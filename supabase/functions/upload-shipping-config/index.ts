// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { ShippingConfigDataProps } from "@lib/types.ts";
import { updateBrandShippingConfig } from '@actions/update-brand-shipping-config.ts';

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {  
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders}); 
	}

	try {
		const authHeader = req.headers.get("Authorization");
		if (!authHeader) {
			console.error("Malformed Authorization header!");
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		const accessToken = authHeader.split("Bearer ")[1];

		if (!accessToken) {
			console.error("Malformed Access Token!");
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		const supabase = createClient(accessToken);

		// Authenticate user
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) { 
			return new Response(JSON.stringify(
				{
					success: false, 
					message: "User not authenticated."
				}), 
				{ 
					headers: {...corsHeaders, 'Content-Type': 'application/json'}
				}
			);
		}

		// Directly parse the incoming JSON body into configData
		const configData: ShippingConfigDataProps = await req.json();

		// Check if data was parsed correctly
		if (!configData || typeof configData !== 'object') {
			console.error("Invalid or missing request body.");
			return new Response(JSON.stringify({ success: false, message: "Invalid request body." }), {
				headers: {...corsHeaders, 'Content-Type': 'application/json'},
				status: 400, 
			});
		}
		
		const userId = user.id;
		let result;

		try {
			result = await updateBrandShippingConfig(supabase, configData, userId);
		} catch (error) {
			console.error(`Error updating shipping configuration data`, error);
			return new Response(JSON.stringify({ success: false, message: `Error updating shipping configuration data` }), {
				headers: corsHeaders,
				status: 500,
			});
		}

		if(!result) {
			throw new Error(`Error Updating shipping configuration data: ${result}`)
		}
		console.log(result);
		
		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Shipping Configuration Data Updated successfully", 
			}), 
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json'}
			}
		)
	} catch (error) {
		let errorMessage;
		if (error instanceof Error) {
			errorMessage = error.message;
		}
        return new Response(
			JSON.stringify({ 
				success: false, 
				message: errorMessage || "Error Uploading Shipping Configuration Data: Something went wrong." 
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/upload-shipping-config' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
