import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { createCategory } from "@actions/create-category.ts";
import { createCurrency } from "./actions/create-currency.ts"; 
import { createTags } from "actions/create-tags.ts";
import { createProduct } from "actions/create-general-details.ts"; 
import { createMaterial } from "actions/create-material.ts";
import { createSubCategory } from "actions/create-subCategory.ts";
import validator from "npm:validator";
import { createClient } from "../../server.ts";


// POST Handler
serve(async (req: Request) => {
	try {
		const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
		const supabaseKey = Deno.env.get("SUPABASE_KEY")!;
		const supabase = createClient(supabaseUrl, supabaseKey);
		// Parse form data (multipart/form-data is not natively handled)
		const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return new Response(JSON.stringify({ success: false, message: "Invalid content type. Expected multipart/form-data." }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

		const formData = await req.formData(); // Extract FormData

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			return new Response(JSON.stringify(
				{
					success: false, 
					message: "User not authenticated."
				}), 
				{ 
					status: 401, 
					headers: { "Content-Type": "application/json" } 
				}
			);
		}

		//Sanitize inputs begin
		const name = validator.trim(formData.get("productName") as string);
		const category = validator.trim(formData.get("category") as string);
		const subCategory = validator.trim(formData.get("subCategory") as string);
		const tags = (formData.get("tags") as string).split(",").map(tag => validator.trim(tag.toLowerCase()));
		const description = validator.escape(formData.get("productDescription") as string);
		const material = validator.trim(formData.get("material") as string);
		const currency = validator.trim(formData.get("currency") as string);

		// const variantName = validator.trim(formData.get("variantName") as string);
		// const variantSku = validator.escape(formData.get("variantSku") as string);
		// const variantPrice = parseFloat(formData.get("variantPrice") as string);
		// const variantColorName = validator.trim(formData.get("variantColorName") as string);
		// const variantColorHex = validator.trim(formData.get("variantColorHex") as string);
		// const variantProductCode = validator.trim(formData.get("variantProductCode") as string);
		// const variantMeasurements = JSON.parse(formData.get("variantMeasurements") as string);
		// const variantImages = formData.getAll("images") as File[];
		//Sanitize inputs end

		// **Call helper functions.  Supabase Functions handle transactions implicitly.**
		//Insert Category 
		const categoryId = await createCategory(supabase, category);
		//Insert SubCategory 
		const subCategoryId = await createSubCategory(supabase, subCategory, categoryId);
		//Insert Material
		const materialId = await createMaterial(supabase, material);
		//Insert currency
		const currencyId = await createCurrency(supabase, currency);
		//Insert Product
		const productUpload = await createProduct(supabase, categoryId, subCategoryId, materialId, description, name, currencyId, user.id);
		//Insert Tags
		await createTags(supabase, tags, productUpload.id);

		return new Response(JSON.stringify({ success: true, message: "Product uploaded successfully" }), {
            headers: { "Content-Type": "application/json" },
        });
	} catch (error) {
		console.error("Error in Upload Function: ", error);
        return new Response(JSON.stringify({ success: false, message: error || "An error occurred." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
	}
});
