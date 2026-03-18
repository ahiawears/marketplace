import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";

const BATCH_SIZE = 500;
type ProductToPublishRow = {
    id: string;
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey =
            Deno.env.get("SERVICE_ROLE_KEY") ||
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error("Missing Supabase URL or service role key for scheduled publishing.");
        }

        const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
        const now = new Date().toISOString();
        const publishedIds: string[] = [];

        while (true) {
            const { data: productsToPublish, error: fetchError } = await supabase
                .from("products_list")
                .select("id")
                .eq("is_published", false)
                .lte("release_date", now)
                .not("release_date", "is", null)
                .limit(BATCH_SIZE);

            if (fetchError) {
                console.error("Error fetching products to publish:", fetchError);
                throw fetchError;
            }

            if (!productsToPublish || productsToPublish.length === 0) {
                break;
            }

            const productIds = (productsToPublish as ProductToPublishRow[]).map((product) => product.id);

            const { error: updateError } = await supabase
                .from("products_list")
                .update({ is_published: true })
                .in("id", productIds);

            if (updateError) {
                console.error("Error updating products:", updateError);
                throw updateError;
            }

            publishedIds.push(...productIds);

            if (productsToPublish.length < BATCH_SIZE) {
                break;
            }
        }

        if (publishedIds.length === 0) {
            console.log("No products to publish at this time.");
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "No scheduled products were ready to publish.",
                    published_count: 0,
                    published_ids: [],
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        console.log("Products published successfully:", publishedIds, "at", now);

        return new Response(
            JSON.stringify({
                success: true,
                published_count: publishedIds.length,
                published_ids: publishedIds,
                processed_at: now,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Unhandled error in publish-scheduled-releases:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
