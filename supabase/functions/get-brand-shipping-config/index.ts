import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";


Deno.serve(async (req) => {
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
					message: "User not authenticated."
				}), 
				{ 
					headers: {...corsHeaders, 'Content-Type': 'application/json'}
				}
			);
		}

		const userId = user.id;
		
		if (!userId) {
			return new Response(JSON.stringify({ success: false, message: "User ID is required." }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// 1. Fetch main configuration
        const { data: configData, error: configError } = await supabase
          .from('shipping_configurations')
          .select('*')
          .eq('brand_id', userId)
          .single();

        if (configError) throw configError;
        if (!configData) throw new Error('No shipping configuration found');
		if (configData) {
			console.log(configData);
		}

		// 2. Fetch related data in parallel
		console.log("Running parallel queries...");

		const [ { data: methodsData },{ data: deliveryData },{ data: zonesData },{ data: exclusionsData },{ data: freeShippingData }, { data: sameDayCitiesData}] = await Promise.all([
			supabase
				.from('shipping_methods')
				.select('*')
            	.eq('config_id', configData.id),
			supabase
				.from('shipping_method_delivery')
				.select('*')
				.eq('config_id', configData.id),
			supabase
				.from('shipping_zones')
				.select('*')
				.eq('config_id', configData.id),
			supabase
				.from('zone_exclusions')
				.select('*')
				.eq('config_id', configData.id),
			supabase
				.from('free_shipping_rules')
				.select('*')
				.eq('config_id', configData.id),
			supabase
				.from('same_day_applicable_cities')
				.select('city_name')
				.eq('config_id', configData.id),

		])
       
		console.log("The configuration data is: ", configData, methodsData, deliveryData, zonesData, exclusionsData, freeShippingData);
		
		return new Response(
			JSON.stringify({
				success: true,
				message: "Shipping Configuration Data Gotten Successfully",
				//data: dataConfig
				data: {
					shipping_configurations: configData,
					shipping_methods: methodsData,
					shipping_method_delivery: deliveryData,
					shipping_zones: zonesData,
					zone_exclusions: exclusionsData,
					free_shipping_rules: freeShippingData,
					same_day_applicable_cities: sameDayCitiesData,
				}
			}), 
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-brand-shipping-config' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
