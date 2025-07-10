// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async () => {

	console.log("update_exchange_rates function called");
	
    const EXCHANGE_API_KEY = Deno.env.get("EXCHANGE_API_KEY");
	const BASE_CURRENCY = "USD";

    if (!EXCHANGE_API_KEY) {
        return new Response("Missing environment variables", { status: 500 });
    }

	try {
		const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${BASE_CURRENCY}`);
		const data = await response.json();
		console.log(`Data: ${JSON.stringify(data)}`)

		if (!data || !data.conversion_rates) {
			throw new Error(`Failed to fetch exchange rates.`);
		}

		// Get the service role key from Vault
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

		const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);

		const exchangeRates = Object.entries(data.conversion_rates).map(([currency, rate]) => ({
			base_currency: BASE_CURRENCY,
			target_currency: currency,
			rate: rate,
			last_updated: new Date().toISOString(),
		}));

		// Upsert into Supabase
		const { error } = await supabase
			.from("exchange_rates")
			.upsert(
				exchangeRates, 
				{ 
					onConflict: "target_currency"
				}
			);
	  
		if (error) {
			console.log(`Error: ${error}`)
			return new Response(JSON.stringify({ error: error }), { status: 500 });
		}

		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Exchange rates updated successfully",
				data: data.conversion_rates
			}), 
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json'}
			}
		);

	} catch (error) {
		 return new Response(
			JSON.stringify({ 
				success: false, 
				error: error || "An error occurred." 
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/iupdate_exchange_rates' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
