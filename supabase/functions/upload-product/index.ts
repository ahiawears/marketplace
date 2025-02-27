// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { createCategory } from "@actions/create-category.ts";
import { createCurrency } from "@actions/create-currency.ts"; 
import { createTags } from "@actions/create-tags.ts";
import { createProduct } from "@actions/create-general-details.ts"; 
import { createMaterial } from "@actions/create-material.ts";
import { createSubCategory } from "@actions/create-subCategory.ts";
import { createColor } from "@actions/create-color.ts";
import { createVariant} from "@actions/create-variant.ts";
import { createSizes } from "@actions/create-sizes.ts";
import { createImages } from "@actions/create-images.ts"
import validator from "npm:validator";
import { createClient } from "../../server-deno.ts";
import { corsHeaders } from '../_shared/cors.ts';


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
	
		// Ensure request content type is multipart/form-data
		const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return new Response(JSON.stringify({ success: false, message: "Invalid content type. Expected multipart/form-data." }), { 
                headers: corsHeaders
            });
        }

		const formData = await req.formData(); // Extract FormData

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

		// Sanitize Inputs
		const name = validator.escape(formData.get("productName") as string);
		const category = validator.escape(formData.get("category") as string);
		const subCategory = validator.escape(formData.get("subCategory") as string);
		const tags = (formData.get("tags") as string).split(",").map(tag => validator.trim(tag.toLowerCase()));
		const description = validator.escape(formData.get("productDescription") as string);
		const material = validator.trim(formData.get("material") as string);
		const currency = validator.trim(formData.get("currency") as string);

		const variantName = validator.trim(formData.get("variantName") as string);
		const variantSku = validator.escape(formData.get("variantSku") as string);
		const variantPrice = parseFloat(formData.get("variantPrice") as string);
		const variantColorName = validator.trim(formData.get("variantColorName") as string);
		const variantColorHex = validator.trim(formData.get("variantColorHex") as string);
		const variantProductCode = validator.escape(formData.get("variantProductCode") as string);
		const variantMeasurements = JSON.parse(formData.get("variantMeasurements") as string);
		const variantImages = formData.getAll("images") as File[];
		if (!variantImages || variantImages.length === 0) {
			return new Response(
				JSON.stringify({ success: false, message: "No images provided." }),
				{
					headers: { ...corsHeaders, "Content-Type": "application/json" },
					status: 400,
				}
			);
		}

		// Insert General details into database
		const categoryId = await createCategory(supabase, category);
		const subCategoryId = await createSubCategory(supabase, subCategory, categoryId);
		const materialId = await createMaterial(supabase, material);
		const currencyId = await createCurrency(supabase, currency);
		const productUploadId = await createProduct(supabase, categoryId, subCategoryId, materialId, description, name, currencyId, user.id);
		await createTags(supabase, tags, productUploadId);


		//Insert Variant Details into database
		const colorId = await createColor(supabase, variantColorName, variantColorHex);
		const variantId = await createVariant(supabase, variantName, variantSku, variantPrice, colorId, variantProductCode, productUploadId);
		await createSizes(supabase, variantId, {measurements: variantMeasurements});	
		await Promise.all(
			variantImages.map((imageFile, index) =>
			  createImages(supabase, variantId, imageFile, index)
			)
		);
		
		return new Response(
			JSON.stringify({ 
				success: true, 
				message: "Product uploaded successfully", 
				productId: variantId 
			}), 
			{
            	headers: { ...corsHeaders, 'Content-Type': 'application/json'}
        	}
		);
	} catch (error) {
		console.error("Error in Upload Function: ", error);
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/upload-product' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
