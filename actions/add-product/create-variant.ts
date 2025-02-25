export async function createVariant(supabase: any, variantName: string, variantSku: string, variantPrice: number, colorId: string, variantProductCode: string, mainProdductId: string){
    try {
        const { data: variantDataInserted, error: variantError } = await supabase
            .from("product_variants")
            .insert({
                name: variantName,
                sku: variantSku, 
                price: variantPrice,
                color_id: colorId,
                product_code: variantProductCode,
                main_product_id: mainProdductId,
            })
            .select()
            .single();

        if (variantError) {
            throw new Error("Error adding variant: ", variantError.message);
        }
        return variantDataInserted.id;
    } catch (error) {
        console.error("Error adding product variant:", error);
        throw error;
    }
}