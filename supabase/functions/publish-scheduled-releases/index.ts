import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "../../server-deno.ts";  
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
	if (req.headers.get("Referer")) {
		return new Response(
			JSON.stringify({ 
				error: "This function can only be called by a Supabase Cron Job." 
			}),
			{ status: 403, headers: corsHeaders }
		);
	}

	try {
		const supabase = createClient();
		const now = new Date().toISOString();

		// 1. Find all products that are not yet published and whose release date has passed.
		const { data: productsToPublish, error: fetchError } = await supabase
			.from("products_list")
			.select("id")
			.eq("is_published", false)
			.lte("release_date", now)
			.neq("release_date", null);

		if (fetchError) {
			throw fetchError;
		}

		if (!productsToPublish || productsToPublish.length === 0) {
			return new Response(
				JSON.stringify({ 
					message: "No products to publish at this time." 
				}), {
					status: 200,
					headers: corsHeaders,
				}
			);
		}
		 
		const productIds = productsToPublish.map((p) => p.id);

		// 2. Update the `is_published` flag for these products to `true`.
		const { error: updateError } = await supabase
			.from("products_list")
			.update({ is_published: true })
			.in("id", productIds);

		if (updateError) {
		throw updateError;
		}

		return new Response(
			JSON.stringify({ 
				success: true, 
				published_count: productIds.length, 
				published_ids: productIds 
			}), {
				status: 200,
				headers: corsHeaders,
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify(
				{
					error: (error as Error).message 
				}
			), { 
				status: 500, 
				headers: corsHeaders 
			}
		);
	}
})


