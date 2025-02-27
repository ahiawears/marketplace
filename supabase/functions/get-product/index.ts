// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { getProductsTexts } from "@actions/get-products-texts.ts"


serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});
    }

	try {
		const url = new URL(req.url);
        const variantId = url.searchParams.get("variantId");
		const authHeader = req.headers.get("Authorization");

		console.log("The variant id from the index is ", variantId);

		if (!authHeader) {
			console.error("Missing Authorization header!");
			return new Response("Unauthorized header", { status: 401 });
		}

		const accessToken = authHeader.split("Bearer ")[1];

		if (!accessToken) {
			console.error("Malformed Authorization header!");
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		const supabase = createClient(accessToken);

		if (!variantId) {
            return new Response(JSON.stringify({ success: false, message: "Variant ID is required." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }
		const productTextsData = await getProductsTexts(supabase, variantId);
		console.log(productTextsData);

		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Product Gotten successfully", 
				data: productTextsData,
			}), 
			{
            	headers: { ...corsHeaders, 'Content-Type': 'application/json'}

        	}
		);
		
	} catch (error) {
		return new Response(
			JSON.stringify({ 
				success: false, 
				message: error || "An error occurred." 
			}), 
			{
				status: 500,
				headers: {...corsHeaders, 'Content-Type': 'application/json'},
        	}
		);
	}
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-product' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
