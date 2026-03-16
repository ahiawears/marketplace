import { VariantDetailsSchemaType } from "@/lib/validation-logics/add-product-validation/product-schema";

type VariantWriteDetails = Pick<
    VariantDetailsSchemaType,
    | "id"
    | "variantName"
    | "sku"
    | "price"
    | "productCode"
    | "slug"
    | "status"
    | "availableDate"
    | "pattern"
    | "colorDescription"
    | "imagesDescription"
>;

export async function createVariant(
    supabase: any,
    mainProductId: string,
    baseCurrencyPrice: number,
    variantDetails: VariantWriteDetails,
    displayOrder: number
){
    try {
        const { data: variantDataInserted, error: variantError } = await supabase
            .from("product_variants")
            .upsert({
                draft_variant_id: variantDetails.id,
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
                display_order: displayOrder,
            }, {
                onConflict: "main_product_id,draft_variant_id",
            })
            .select('id')
            .single();

        if (variantError) {
            console.log("The variant error is: ", variantError);
            throw variantError;
        }
        return variantDataInserted.id;
    } catch (error) {
        // console.log("Error adding product variant:", error);
        // throw error;
        let errorMessage;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred.";
        }   
        throw new Error(`${errorMessage}`);
    }
}
