import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (_req) => {

    try {
        // Get the service role key from Vault
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

        const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
        const now = new Date().toISOString();

        // 1. Find all products that are not yet published and whose release date has passed.
        const { data: productsToPublish, error: fetchError } = await supabase
            .from("products_list")
            .select("id")
            .eq("is_published", false)
            .lte("release_date", now)
            .not("release_date", "is", null); // Use .not(..., "is", null) for Supabase

        if (fetchError) {
            console.error("Error fetching products to publish:", fetchError);
            throw fetchError;
        }

        if (!productsToPublish || productsToPublish.length === 0) {
            console.log("No products to publish at this time.");
            return new Response(
                JSON.stringify({ message: "No products to publish at this time." }),
                { status: 200, headers: corsHeaders }
            );
        }

        const productIds = productsToPublish.map((p) => p.id);
        console.log("Product IDs to publish:", productIds);

        // 2. Update the `is_published` flag for these products to `true`.
        const { error: updateError } = await supabase
            .from("products_list")
            .update({ is_published: true })
            .in("id", productIds);

        if (updateError) {
            console.error("Error updating products:", updateError);
            throw updateError;
        }

        console.log("Products published successfully:", productIds, "at", now);

        return new Response(
            JSON.stringify({
                success: true,
                published_count: productIds.length,
                published_ids: productIds
            }),
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("Unhandled error in publish-scheduled-releases:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            }),
            { status: 500, headers: corsHeaders }
        );
    }
});