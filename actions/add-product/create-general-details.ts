export async function createProduct(
    supabase: any,
    categoryId: string,
    subCategoryId: string,
    materialId: string,
    description: string,
    name: string,
    currencyId: string,
    genderId: string,
    seasonId: string,
    brandId: string,
    // The editProductId is now definitely a string or null thanks to the type assertion
    editProductId: string | null // Changed from 'string | undefined' to 'string | null'
) {
    try {
        const productDataToUpsert: any = {
            name: name,
            product_description: description,
            material_id: materialId,
            category_id: categoryId,
            subcategory_id: subCategoryId,
            currency_id: currencyId,
            gender_id: genderId,
            season_id: seasonId,
            brand_id: brandId // Assuming brand_id is always set
        };

        // If editProductId is provided, include it for the upsert operation
        if (editProductId) {
            productDataToUpsert.id = editProductId;
        }

        const { data: productDataInserted, error: productError } = await supabase
            .from("products_list")
            .upsert(productDataToUpsert, {
                onConflict: 'id', // Specify 'id' as the conflict target
                ignoreDuplicates: false // Set to false to ensure update if conflict occurs
            })
            .select('id') // Select the 'id' of the inserted/updated row
            .single();

        if (productError) {
            console.error("Supabase product upsert error:", productError);
            throw productError;
        }

        console.log("The product data (upserted) is: ", productDataInserted);
        return productDataInserted.id;

    } catch (error) {
        console.error("Error creating/updating product:", error);
        throw error;
    }
}