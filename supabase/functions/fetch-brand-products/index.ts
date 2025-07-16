import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { FetchBrandProducts } from "@actions/fetchBrandProducts.ts";


Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});  
	}

	try {
		const url = new URL(req.url);
		const authHeader = req.headers.get("Authorization");
		const brandId = url.searchParams.get("brandId");

		if (!authHeader) {
			console.error("Missing Authorization header!");
			return new Response("Unauthorized header", { status: 401 });
		}

		const accessToken = authHeader.split("Bearer ")[1];

		if (!accessToken) {
			console.error("Malformed Authorization header!");
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		if (!brandId) {
			return new Response(JSON.stringify({ success: false, message: "Brand ID is required." }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
		// Create Supabase client with the access token
		const supabase = createClient(accessToken);

		// Fetch brand products using the provided brandId
		const getBrandProducts = await FetchBrandProducts(supabase, brandId);

		if (!getBrandProducts || getBrandProducts.length === 0) {
			return new Response(JSON.stringify({ success: true, message: "No products found for the brand.", data: [] }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Products fetched successfully", 
				data: getBrandProducts,
			}), 
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({ 
				success: false, 
				message: error instanceof Error ? error.message : "An error occurred." 
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}

})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-brand-products' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
