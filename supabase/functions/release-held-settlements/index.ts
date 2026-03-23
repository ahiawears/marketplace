import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";

const BATCH_SIZE = 500;

type BrandOrderToReleaseRow = {
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
            throw new Error("Missing Supabase URL or service role key for held-settlement release.");
        }

        const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
        const now = new Date().toISOString();
        const releasedIds: string[] = [];

        while (true) {
            const { data: eligibleBrandOrders, error: fetchError } = await supabase
                .from("brand_orders")
                .select("id")
                .eq("settlement_status", "held")
                .lte("return_window_ends_at", now)
                .not("return_window_ends_at", "is", null)
                .limit(BATCH_SIZE);

            if (fetchError) {
                console.error("Error fetching held brand orders:", fetchError);
                throw fetchError;
            }

            if (!eligibleBrandOrders || eligibleBrandOrders.length === 0) {
                break;
            }

            const brandOrderIds = (eligibleBrandOrders as BrandOrderToReleaseRow[]).map((brandOrder) => brandOrder.id);

            const { error: updateError } = await supabase
                .from("brand_orders")
                .update({
                    settlement_status: "eligible_for_release",
                    held_until: now,
                })
                .in("id", brandOrderIds);

            if (updateError) {
                console.error("Error updating held brand orders:", updateError);
                throw updateError;
            }

            releasedIds.push(...brandOrderIds);

            if (eligibleBrandOrders.length < BATCH_SIZE) {
                break;
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                released_count: releasedIds.length,
                released_ids: releasedIds,
                processed_at: now,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Unhandled error in release-held-settlements:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "An unexpected error occurred",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
