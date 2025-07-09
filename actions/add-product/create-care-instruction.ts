
interface ProductCareInstruction {
  productId: string;
  washingInstruction?: string | null;
  bleachingInstruction?: string | null;
  dryingInstruction?: string | null;
  ironingInstruction?: string | null;
  dryCleaningInstruction?: string | null;
  specialCases?: string | null;
}

export async function createProductCareInstruction(supabase: any, productCareInstructions: ProductCareInstruction) {
    try {
        const { data: careInstructionData, error: careInstructionError } = await supabase
            .from('product_care_instructions')
            .upsert({
                product_id: productCareInstructions.productId,
                washing_instruction: productCareInstructions.washingInstruction,
                bleaching_instruction: productCareInstructions.bleachingInstruction,
                dry_cleaning_instruction: productCareInstructions.dryCleaningInstruction,
                drying_instruction: productCareInstructions.dryCleaningInstruction,
                ironing_instruction: productCareInstructions.ironingInstruction,
                special_cases: productCareInstructions.specialCases,
            }, {
                onConflict: 'product_id',
            })
            .select('id')
            .single();

        if (careInstructionError) {
            throw careInstructionError;
        }

        if (!careInstructionData) {
            throw new Error("Failed to create or retrieve product care instruction ID.");
        }

        return careInstructionData.id;

    } catch (error) {
        console.error("Error creating/updating product care instruction:", error);
        throw error;
    }
}