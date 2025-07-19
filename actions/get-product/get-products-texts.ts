export async function getProductsTexts(supabase: any, variantId: string) {
    console.log("The variant Id is ", variantId);
    try {
        const {data: variantTexts, error: variantsTextsError} = await supabase
            .from("product_variants")
            .select(
                "name, price, sku, product_code, color_id(name, hex_code), main_product_id(id, product_description, category_id(name), subcategory_id(name), currency_id(name), material_id(name))"
            ) 
            .eq("id", variantId)
            .single();

        if (variantsTextsError) {
            throw new Error(variantsTextsError.message);
        }
        console.log("The variants data", variantTexts);

        const {data: variantImages, error: variantImagesError} = await supabase
            .from("product_images")
            .select("image_url, is_main")
            .eq("product_variant_id", variantId);

        if (variantImagesError) {
            throw new Error(variantImagesError.message);
        } 
        console.log("The images data", variantImages)

        const productId = variantTexts.main_product_id.id;
        console.log("The product id is ", productId);

        const {data: variantTags, error: variantTagsError} = await supabase
            .from("product_tags")
            .select("tag_id(name)")
            .eq("product_id", productId);

        if (variantTagsError) {
            throw new Error(variantTagsError.message);
        }
        console.log("The product tag is ", variantTags);

        const { data: measurementsData, error: measurementsError } = await supabase
            .from("product_measurements")
            .select("value, measurement_type_id(name), product_size_id(quantity, size_id(name), product_id)")
            .eq("product_size_id.product_id", variantId);

        if (measurementsError) {
            throw new Error(measurementsError.message);
        }
        return {variantTexts, variantTags, variantImages, measurementsData};
    } catch (error: any) {
        error;
        throw new Error(`Error getting products texts: ${error.message}, ${error.name}`)
    }
}