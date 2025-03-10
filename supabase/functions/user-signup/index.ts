// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { SignUpuser } from "@actions/user-signup.ts"

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});
    }

	try {
		const { email, password, firstName, lastName } = await req.json();
		const supabase = createClient();
		const response = await SignUpuser({supabase, email, password, firstName, lastName});

		let result;

		try {
            result = await response.json();
        } catch (error) {
			let errorMessage;
			if (error instanceof Error) {
				errorMessage = error.message
			}
            return new Response(
                JSON.stringify({
                    success: false,
                    message: `${errorMessage}` || "Failed to parse response from SignUpBrand.",
                    status: 500,
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                }
            );
        }

		if (!response.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					message: `Signup failed: ${result.message}`,
					status: result.status,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					status: result.status,
				}
			)
		}

		return new Response(
            JSON.stringify({
                success: true,
                user: result.data.user, // Include the user's ID in the response
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/user-signup' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
