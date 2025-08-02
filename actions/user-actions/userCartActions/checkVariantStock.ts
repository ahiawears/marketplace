import { createClient } from "@/supabase/server"

export const checkVariantStock = async (variantId: string, size: string, sQuantity: number) => {
    const supabase = await createClient();

    console.log("VariantId: ", variantId, " size: ", size, " quantity: ", sQuantity);

    try {
        let size_id;
        //Get the size id
        const { data: sizeId, error: sizeIdError } = await supabase
            .from('sizes')
            .select('id')
            .eq('name', size)
            .maybeSingle();

        if (sizeIdError) {
            throw new Error(sizeIdError.message);
        }

        if (!sizeId) {
            throw new Error('Size not found');
        }

        size_id = sizeId.id;

        //Check if the variant exists 
        const { data: variantData, error: variantError } = await supabase
            .from('product_sizes')
            .select('quantity')
            .eq('product_id', variantId)
            .eq('size_id', size_id);

        if (variantError) {
            throw new Error(variantError.message);
        }

        if (!variantData) {
            throw new Error('Variant not found');
        }

        const quantity = variantData[0].quantity;

        if ( quantity === 0 || quantity < sQuantity) {
            throw new Error('Variant out of stock');
        }

        return {success: true, sizeId: size_id};
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred');
    }
}