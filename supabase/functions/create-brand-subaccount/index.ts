// deno-lint-ignore-file
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';


serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const FLUTTERWAVE_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY")!;
		if (!FLUTTERWAVE_SECRET_KEY) {
			return new Response(JSON.stringify({ success: false, message: "FLUTTERWAVE_SECRET_KEY is not set." }), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
		const url = 'https://api.flutterwave.com/v3/subaccounts';

		let requestBody;
		try {
            requestBody = await req.json();
        } catch (error) {
            return new Response(JSON.stringify({ success: false, message: "Invalid JSON payload." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

		console.log("Received data:", requestBody);

		

		// Make the request to Flutterwave
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

		// Parse the response from Flutterwave
        const responseData = await response.json();

		 // Handle Flutterwave API errors
        if (!response.ok) {
            console.error("Flutterwave API error:", responseData);
            return new Response(JSON.stringify({
                success: false,
                message: responseData.message || "Error from Flutterwave",
                errors: responseData.errors || null,
            }), {
                status: response.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

		 // Successful response
		return new Response(JSON.stringify({
            success: true,
            message: "Subaccount created successfully",
            data: responseData,
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-brand-subaccount' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
