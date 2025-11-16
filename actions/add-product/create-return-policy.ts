import { ReturnPolicySchemaType } from "@/lib/validation-logics/add-product-validation/product-schema";
import { createClient } from "@/supabase/server";

export async function createReturnPolicy(returnPolicyData: ReturnPolicySchemaType) {
    try {
        const supabase = await createClient();

        const { data: existingPolicy, error: fetchError } = await supabase
            .from('product_return_policy')
            .select('*')
            .eq('product_id', returnPolicyData.productId)
            .eq('is_active', true)
            .single();

        let nextVersion = 1;

        if (existingPolicy) {
            nextVersion = existingPolicy.version + 1;
            const { error: deactivateError } = await supabase
                .from('product_return_policy')
                .update({ is_active: false })
                .eq('id', existingPolicy.id);

            if (deactivateError) {
                console.error("Error deactivating old policy:", deactivateError);
                return { success: false, message: "Failed to deactivate the previous policy." };
            }
        }

        const { data: newPolicy, error: insertError } = await supabase
            .from("product_return_policy")
            .insert({
                product_id: returnPolicyData.productId,
                use_global_policy: returnPolicyData.useProductSpecificReturnPolicy,
                return_window_days: returnPolicyData.returnWindowDays,
                refund_processing_time_days: returnPolicyData.refundProcessingTimeDays,
                restocking_fee_type: returnPolicyData.restockingFee.type,
                restocking_fee_value: returnPolicyData.restockingFee.value,
                is_active: true,
                version: nextVersion,
                return_shipping_responsibility: returnPolicyData.returnShippingResponsibility,
                condition_requirements: returnPolicyData.conditionRequirements,
                refund_methods: returnPolicyData.refundMethods,
                is_returnable: returnPolicyData.isReturnable,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting new product return policy:", insertError);
            return { success: false, message: "Failed to save the new return policy." };
        }

        return { success: true, message: "Return policy saved successfully.", data: newPolicy };
    } catch (error) {
        console.error("Error creating product return policy:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message: errorMessage };
    }
}