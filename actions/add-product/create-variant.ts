import { VariantFormDetails } from "@/components/brand-dashboard/add-product/variants-details-form";

export async function createVariant(
    supabase: any,
    mainProductId: string,
    baseCurrencyPrice: number,
    variantDetails: Pick<
        VariantFormDetails,
        | 'variantName'
        | 'sku'
        | 'price'
        | 'productCode'
        | 'slug'
        | 'status'
        | 'availableDate'
        | 'pattern'
        | 'colorDescription'
        | 'imagesDescription'
    >
){
    try {
        const { data: variantDataInserted, error: variantError } = await supabase
            .from("product_variants")
            .insert({
                name: variantDetails.variantName,
                sku: variantDetails.sku, 
                price: variantDetails.price,
                product_code: variantDetails.productCode,
                main_product_id: mainProductId,
                base_currency_price: baseCurrencyPrice,
                slug: variantDetails.slug,
                status: variantDetails.status,
                available_date: variantDetails.availableDate || null,
                fabric_pattern: variantDetails.pattern,
                color_description: variantDetails.colorDescription,
                images_description: variantDetails.imagesDescription,
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