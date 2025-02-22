export async function createProduct(supabase: any, categoryId: string, subCategoryId: string, materialId: string, description: string, name: string, currencyId: string, brandId: string){
    try {
        const { data: productDataInserted, error: productError } = await supabase  
            .from("products_list")
            .insert({ 
                name: name,
                product_description: description, 
                material_id: materialId,
                category_id: categoryId, 
                subcategory_id: subCategoryId,
                currency_id: currencyId,
                brand_id: brandId
            })
            .select()
            .single();
        
        if (productError) {
            throw new Error(`Error adding product: ${productError.message}`);
        }

        return productDataInserted.id;
    } catch(error) {
        console.error("Error creating product:", error);
        throw error;
    }
}