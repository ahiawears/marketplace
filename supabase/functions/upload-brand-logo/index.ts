// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { UploadBrandLogo } from "@actions/upload-brand-logo.ts"
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";


Deno.serve(async (req: Request) => {
	if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});
	}

	try {
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

		const supabase = createClient(accessToken);

		// Authenticate user
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			return new Response(JSON.stringify(
				{
					success: false, 
					message: "User not authenticated. from user"
				}), 
				{ 
					headers: {...corsHeaders, 'Content-Type': 'application/json'}
				}
			);
		}

		const userId = user.id;


		//Check if content type is multipart/form-data
        const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return new Response(JSON.stringify({ success: false, message: "Invalid content type. Expected multipart/form-data." }), { 
                headers: corsHeaders
            });
        }

		const formData = await req.formData();
        const logoBlob = formData.get("logo") as Blob;

		// Check if logoBlob is null
        if (!logoBlob) {
            return new Response(JSON.stringify({   
                success: false, 
                message: "No logo image provided."
            }), {
                headers: {...corsHeaders, 'Content-Type': 'application/json'},
                status: 400,
            });
        }
		const logoURL = await UploadBrandLogo(userId, logoBlob);
		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Logo uploaded successfully", 
				logoURL: logoURL
			}), 
			{
            	headers: { ...corsHeaders, 'Content-Type': 'application/json'}
        	}
		);
	} catch (error) {
		console.error(`Error in Upload Logo function: ${error instanceof Error ? error.message : String(error)}`);
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/upload-brand-logo' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
