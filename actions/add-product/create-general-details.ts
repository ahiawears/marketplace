export async function createProduct(supabase: any, categoryId: string, subCategoryId: string, materialId: string, description: string, name: string, currencyId: string, genderId: string, seasonId: string, brandId: string){
    try {
        const { data: productDataInserted, error: productError } = await supabase  
            .from("products_list")
            .upsert({ 
                name: name,
                product_description: description, 
                material_id: materialId,
                category_id: categoryId, 
                subcategory_id: subCategoryId,
                currency_id: currencyId,
                gender_id: genderId,
                season_id: seasonId,
                brand_id: brandId
            }, {
                onConflict: 'id'
            })
            .select('id')
            .single();
        
        if (productError) {
            throw productError;
        }
        console.log("The product data is: ", productDataInserted);
        return productDataInserted.id;
    } catch(error) {
        console.error("Error creating product:", error);
        throw error;
    }
}