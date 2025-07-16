import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { UpdateNotificationSettings } from "@actions/update-notification-settings.ts";

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		// Handle CORS preflight request
		return new Response('ok', { headers: corsHeaders});  
	}

	try {
		const url = new URL(req.url);
		const authHeader = req.headers.get("Authorization");
		const userId = url.searchParams.get("userId");
		const role = url.searchParams.get("role");


		if (!authHeader) {
			return new Response("Unauthorized header", { status: 401 });
		}

		const accessToken = authHeader.split("Bearer ")[1];
		if (!accessToken) {
			return new Response("Unauthorized accessToken", { status: 401 });
		}

		if (!userId || !role) {
			return new Response(JSON.stringify({ success: false, message: "User ID and role are required." }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		//get the settings data from the request body
		const body = await req.json();
		if (!body || !Array.isArray(body)) {
			return new Response(JSON.stringify({ success: false, message: "Invalid settings data." }),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		const supabase = createClient(accessToken);

		const updateBrandNotificationSettings = await UpdateNotificationSettings(supabase, userId, role, body);



		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Notification settings fetched successfully", 
				data: updateBrandNotificationSettings,
			}), 
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false, 
				message: error instanceof Error ? error.message : "An unexpected error occurred",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
})
