"use server";

import { ReturnPolicyInterface } from "@/lib/return-policy-validation";
import { createClient } from "@/supabase/server";

export async function updateBrandReturnPolicy(returnPolicyData: ReturnPolicyInterface, brandId: string) {
    try {
        const supabase = await createClient();

        // Deactivate any existing active global policy for the brand
        const { data: existingPolicy, error: fetchError } = await supabase
            .from("return_policies")
            .select("id, version")
            .eq("brand_id", brandId)
            .eq("is_active", true)
            .eq("is_global", true)
            .single();

        let nextVersion = 1;

        if (existingPolicy) {
            nextVersion = existingPolicy.version + 1;
            const { error: deactivateError } = await supabase
                .from("return_policies")
                .update({ is_active: false })
                .eq("id", existingPolicy.id);

            if (deactivateError) {
                console.error("Error deactivating old policy:", deactivateError);
                return { success: false, message: "Failed to deactivate the previous policy." };
            }
        }

        // Insert the new policy as the active one
        const { data: newPolicy, error: insertError } = await supabase
            .from("return_policies")
            .insert({
                brand_id: brandId,
                version: nextVersion,
                is_global: true,
                is_active: true,
                return_window_days: returnPolicyData.returnWindowDays,
                refund_processing_time_days: returnPolicyData.refundProcessingTimeDays,
                restocking_fee_type: returnPolicyData.restockingFee.type,
                restocking_fee_value: returnPolicyData.restockingFee.value,
                return_shipping_responsibility: returnPolicyData.returnShippingResponsibility,
                return_reasons: returnPolicyData.returnReasons,
                condition_requirements: returnPolicyData.conditionRequirements,
                return_methods: returnPolicyData.returnMethods,
                refund_methods: returnPolicyData.refundMethods,
                return_address: returnPolicyData.returnAddress,
                return_contact: returnPolicyData.returnContact,
                return_instructions: returnPolicyData.returnInstructions,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting new policy:", insertError);
            return { success: false, message: "Failed to save the new return policy." };
        }

        return {
            success: true,
            message: "Return policy updated successfully.",
            data: newPolicy,
        };

    } catch (error) {
        console.error("Error updating brand return policy:", error);
        const errorMessage = error instanceof Error ? error.message : error;
        return {
            success: false,
            message: errorMessage,
        };
    }
}