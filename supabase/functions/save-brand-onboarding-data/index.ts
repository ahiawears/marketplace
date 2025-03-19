// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "../../server-deno.ts";
import { BrandOnboarding } from '@lib/types.ts';
import { updateBrandContactDetails } from '@actions/update-brand-contact-details.ts'
import { updateBrandBasicDetails } from '@actions/update-brand-basic-details.ts'
import { updateBrandBusinessDetails } from '@actions/update-brand-business-details.ts'
import { updateBrandPaymentDetails } from '@actions/update-brand-payment-details.ts'
import { UploadBrandLogo } from '@actions/upload-brand-logo.ts'
import { UploadBrandBanner } from '@actions/upload-brand-banner.ts'

serve(async (req: Request) => {
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

		// Ensure request content type is multipart/form-data
		const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return new Response(JSON.stringify({ success: false, message: "Invalid content type. Expected multipart/form-data." }), { 
                headers: corsHeaders
            });
        }

		const formData = await req.formData();
        const step = Number(formData.get("step"));
        const data = JSON.parse(formData.get("data") as string) as BrandOnboarding;
        const logoBlob = formData.get("brand_logo") as Blob | null;
        const bannerBlob = formData.get("brand_banner") as Blob | null;

		let logoURL: string;
        let bannerURL: string;

		if (step === 1) {
			if (logoBlob) {
				try {
					logoURL = await UploadBrandLogo(supabase, userId, logoBlob);
					data.brandInformation.brand_logo = logoURL;
				} catch (error) {
					console.error("Error uploading logo:", error);
					return new Response(JSON.stringify({ success: false, message: "Error uploading logo." }), {
						headers: corsHeaders,
						status: 500,
					});
				}
			}
	
			if (bannerBlob) {
				try {
					bannerURL = await UploadBrandBanner(supabase, userId, bannerBlob);
					data.brandInformation.brand_banner = bannerURL;
				} catch (error) {
					console.error("Error uploading banner:", error);
					return new Response(JSON.stringify({ success: false, message: "Error uploading banner." }), {
						headers: corsHeaders,
						status: 500,
					});
				}
			}
		}


		let result;

		try {
			switch(step) {
				case 1: 
					result = await updateBrandBasicDetails(supabase, data.brandInformation, userId);
					break;
				case 2: 
					result = await updateBrandContactDetails(supabase, data.contactInformation, userId);
					break;
				case 3: 
					result = await updateBrandBusinessDetails(supabase, data.businessDetails, userId);
					break;
				case 4: 
					result = await updateBrandPaymentDetails(supabase, data.paymentInformation, userId);
					break;
				
				default: return new Response(JSON.stringify({ success: false, message: "Invalid step number" }), {
					headers: corsHeaders,
					status: 400,
				});
			}
		} catch (error) {
			console.error(`Error updating data for step ${step}:`, error);
			return new Response(JSON.stringify({ success: false, message: `Error updating data for step ${step}.` }), {
				headers: corsHeaders,
				status: 500,
			});
		}

		if (!result) {
			return new Response(JSON.stringify({ success: false, message: "Error saving data."}),
				{
					headers: corsHeaders,
					status: 500,
				}
			);
		}

		return new Response(JSON.stringify({ success: true, message: "Data saved successfully."}), {
			headers: corsHeaders,
			status: 200,
		});

	} catch (error) {
		let onboardingError;
		if (error instanceof Error) {
			onboardingError = `Error: ${error.message}, cause: ${error.cause} name: ${error.name}`;
		}
		return new Response(JSON.stringify({ success: false, message: onboardingError || "An error occured"}), {
			headers: corsHeaders,
			status: 500,
		});
	}
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/save-brand-onboarding-data' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
