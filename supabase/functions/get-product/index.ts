// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { getProductForEdit } from "@actions/get-product.ts";

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
		return new Response('ok', { headers: corsHeaders});
    }
	try { 
		console.log("Request received for get-product function");
		console.log("Request URL: ", req.url);
		const url = new URL(req.url);
        const productId = url.searchParams.get("productId");
		const getProductType = url.searchParams.get("getProductType");
		const authHeader = req.headers.get("Authorization");

		console.log("The Authorization header is: ", authHeader);
		console.log("The product type is: ", getProductType);


		if (!authHeader) { 
			return new Response(
				JSON.stringify({ success: false, message: "Missing Authorization header" }),
				{ status: 401, headers: corsHeaders }
			);
		}

		const accessToken = authHeader.split("Bearer ")[1];

		if (!accessToken) {
            return new Response(
                JSON.stringify({ success: false, message: "Malformed Authorization header" }),
                { status: 401, headers: corsHeaders }
            );
        }

		const supabase = createClient(accessToken);

		if (!productId) {
            return new Response(JSON.stringify({ success: false, message: "Product ID is required." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

		if (!getProductType) {
			return new Response(JSON.stringify({ success: false, message: "Product fetch type is required." }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
		console.log("The. productId is: ", productId);
		console.log("The getProductType is: ", getProductType);

		switch (getProductType) {
			case "getProductForEdit": {
				console.log("Fetching product for edit with ID:", productId);
				const productForEditData = await getProductForEdit(supabase, productId);
				 
				console.log("Product for edit data:", productForEditData);
				if (!productForEditData) {
					return new Response(JSON.stringify({ 
						success: false, message: "Product not found." 
					}), {
						status: 404,
						headers: { ...corsHeaders, "Content-Type": "application/json" },
					});
				}

				return new Response(
					JSON.stringify({ 
						success: true, 
						message: "Product Gotten successfully", 
						data: productForEditData,
					}), 
					{
						headers: { ...corsHeaders, 'Content-Type': 'application/json'}

					}
				);

			}

			default:
				return new Response(
					JSON.stringify({ 
						success: false, 
						message: `Unknown getProductType: ${getProductType}` 
					}), 
					{
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
		}
		
		
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
