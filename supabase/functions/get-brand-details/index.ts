// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";

Deno.serve(async (req) => { 
 	if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});  
	}

	try {
		const url = new URL(req.url);
		const dataName = url.searchParams.get("data_name");
		const brandId = url.searchParams.get("brandId");
		const authHeader = req.headers.get("Authorization");

		console.log("The dataName gotten is ", dataName);

		if (!authHeader) {
			return new Response("Unauthorized header", { status: 401 });
		}

		const accessToken = authHeader.split("Bearer ")[1];
		if (!accessToken) {
			console.error("Malformed Authorization header!");
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		const supabase = createClient(accessToken);
		
		if (!brandId) {
			return new Response(JSON.stringify({ success: false, message: "Brand ID is required." }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		switch (dataName) {
			case "legal-details":
				try {
					const { data: legalData, error: legalError } = await supabase
						.from('brand_legal_details')
						.select('*')
						.eq('id', brandId)
						.single();

					if (legalError) {
						console.log(legalError);
						throw new Error(`Error getting legal details: ${legalError}`);
					}

					return new Response(JSON.stringify({
						success: true,
						message: "Legal details fetched successfully",
						data: legalData,
					}),
					{
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					})
				} catch (error) {
					return new Response(
						JSON.stringify({ 
							success: false, 
							message: error
						}), 
						{
							status: 500,
							headers: {...corsHeaders, 'Content-Type': 'application/json'},
						}
					);
				}

				
		
			default:
				break;
		}

		if (dataName === "legal-details") {
			try {
				const { data: legalData, error: legalError } = await supabase
					.from('brand_legal_details')
					.select('*')
					.eq('id', brandId)
					.single();

				if (legalError) {
					console.log(legalError);
					throw new Error(`Error getting legal details: ${legalError}`);
				}

				return new Response(JSON.stringify({
					success: true,
					message: "Legal details fetched successfully",
					data: legalData,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			} catch (error) {
				return new Response(
					JSON.stringify({ 
						success: false, 
						message: error
					}), 
					{
						status: 500,
						headers: {...corsHeaders, 'Content-Type': 'application/json'},
					}
				);
			}
		}
		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Data Gotten successfully", 
			}), 
			{
            	headers: { ...corsHeaders, 'Content-Type': 'application/json'},
				status: 200
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-brand-details' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
