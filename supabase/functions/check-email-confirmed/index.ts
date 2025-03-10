// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";  


serve(async (req) => {
  	if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});
	}

	try {
		const { token_hash, type } = await req.json();

		if (!token_hash || type !== 'email_confirmation') {
			return new Response(JSON.stringify({ error: 'Invalid request' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const supabase = createClient();

		const { error } = await supabase.auth.verifyOtp({
			token_hash,
			type,
		});

		if (error) {
			console.error('Verify OTP error:', error);
			return new Response(JSON.stringify({ error: error.message }), {
			 	status: 400,
			  	headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
		return new Response(
            JSON.stringify({
                success: true,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
	} catch (error) {
		let errorMessage;
		if (error instanceof Error) {
			errorMessage = error.message;
			console.error('Edge Function Error:', errorMessage); // Log the error
		} 
		return new Response(
			JSON.stringify({ 
				success: false, 
				message: `${errorMessage}` || "An error occurred." 
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-email-confirmed' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
