export async function createVariant(supabase: any, variantName: string, variantSku: string, variantPrice: number,  baseCurrencyPrice: number, colorId: string, colorDescription: string, variantProductCode: string, mainProdductId: string){
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
                base_currency_price: baseCurrencyPrice,
                color_description: colorDescription
            })
            .select('id')
            .single();

        if (variantError) {
            console.log("The variant error is: ", variantError);
            throw variantError;
        }
        return variantDataInserted.id;
    } catch (error) {
        console.log("Error adding product variant:", error);
        throw error;
    }
}