// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
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
					message: "User not authenticated., from user"
				}),
				{
					headers: {...corsHeaders, 'Content-Type': 'application/json'}
				}
			);
		}

		const userId = user.id; 

		const formData = await req.json();
		const authType = JSON.parse(formData.get("authType") as string);
		const currentPassword = JSON.parse(formData.get("currentPassword") as string);
		const newPassword = JSON.parse(formData.get("newPassword") as string);
		const confirmPassword = JSON.parse(formData.get("confirmPassword") as string);
		
		if (authType === "updatePassword") {
			try {
				return new Response('ok', { headers: corsHeaders});
			} catch (error) {
				return new Response('ok', { headers: corsHeaders});
			}
		}
		return new Response('ok', { headers: corsHeaders});
	} catch (error) {
		return new Response('ok', { headers: corsHeaders});
	}
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/update-auth-details' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
