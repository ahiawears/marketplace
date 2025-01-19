"use server";

import { createClient} from "@/supabase/server";
import validator from 'validator';

export const UploadProductDetails = async (formData: FormData) => {
    const supabase = await createClient();

    //Sanitize inputs begin
    const name = validator.trim(formData.get("productName") as string);
    const category = validator.trim(formData.get("categpory") as string);
    const subCategory = validator.trim(formData.get("subCategory") as string);
    const tags = (formData.get("tags") as string).split(",").map(tag => validator.trim(tag.toLowerCase()));
    const description = validator.escape(formData.get("productDescription") as string);
    const material = validator.trim(formData.get("material") as string);
    const currency = validator.trim(formData.get("currency") as string);

    const variantName = validator.trim(formData.get("variantName") as string);
    const variantSku = validator.escape(formData.get("variantSku") as string);
    const variantPrice = parseFloat(formData.get("variantPrice") as string);
    const variantColorName = validator.trim(formData.get("variantColorName") as string);
    const variantColorHex = validator.trim(formData.get("variantColorHex") as string);
    const variantProductCode = validator.trim(formData.get("variantProductCode") as string);
    const variantMeasurements = JSON.parse(formData.get("variantMeasurements") as string);
    const variantImages = formData.getAll("images") as File[];

    
    //Sanitize inputs end


}