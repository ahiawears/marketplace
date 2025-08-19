// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts';
import { GetBrandProfile } from "@actions/get-brand-basic-info.ts";

Deno.serve(async (req: Request) => {
  	if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});  
	}

	try {
		const url = new URL(req.url);
        const userId = url.searchParams.get("userId");
		const authHeader = req.headers.get("Authorization");

		if (!authHeader) {
			console.error("Missing Authorization header!");
			return new Response("Unauthorized header", { status: 401 });
		}

		const accessToken = authHeader.split("Bearer ")[1];
		if (!accessToken) {
			console.error("Malformed Authorization header!");
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		if (!userId) {
			return new Response(JSON.stringify({ success: false, message: "User ID is required." }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const brandBasicData = await GetBrandProfile(userId);

		if (!brandBasicData) {
			return new Response(JSON.stringify({ success: true, message: "No Data found for the user.", data: null }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Data Gotten successfully", 
				data: brandBasicData,
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-brand-name-description' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
 
*/
