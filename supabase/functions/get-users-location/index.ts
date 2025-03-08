// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
//import { createClient } from "../../server-deno.ts";

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get the user's IP address from the headers
        const userIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip");

        if (!userIp) {
            return new Response(JSON.stringify({ success: false, message: "Could not determine user's location'." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        // Use a geolocation API to get the user's country
        const geolocationResponse = await fetch(`https://ipapi.co/${userIp}/json/`);
        if (!geolocationResponse.ok) {
            throw new Error("Failed to fetch geolocation data.");
        }

        const country = await geolocationResponse.json();

        return new Response(
            JSON.stringify({
                success: true,
                message: "User country retrieved successfully.",
                data: { country },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        console.log(`${error.message}, ${error.stack}, ${error.name}`)
        return new Response(
			JSON.stringify({ 
				success: false, 
				message: error || "An error occurred.",
                error: `${error.message}, ${error.stack}, ${error.name}`
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-users-location' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
