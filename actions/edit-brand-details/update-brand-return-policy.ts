"use server";

import { ReturnPolicy, validateReturnPolicy } from "@/lib/return-policy-validation";
import { createClient } from "@/supabase/server";

export async function updateBrandReturnPolicy(returnPolicyData: ReturnPolicy, brandId: string) {
    try {
        // Validate the data first
        const validation = validateReturnPolicy(returnPolicyData);
        if (!validation.success) {
            return {
                success: false,
                message: "Validation failed",
                errors: validation.error.errors
            };
        }

        const supabase = await createClient();

        // Deactivate any existing active global policy for the brand
        const { data: existingPolicy, error: fetchError } = await supabase
            .from("return_policies") // Updated table name
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
                .update({ 
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingPolicy.id);

            if (deactivateError) {
                console.error("Error deactivating old policy:", deactivateError);
                return { success: false, message: "Failed to deactivate the previous policy." };
            }
        }

        // Prepare the data for insertion
        const policyData = {
            brand_id: brandId,
            version: nextVersion,
            is_global: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            
            // Timeline
            return_window_days: returnPolicyData.returnWindowDays,
            refund_processing_time_days: returnPolicyData.refundProcessingTimeDays,
            
            // Shipping
            return_shipping_responsibility: returnPolicyData.returnShipping.responsibility,
            paid_by_brand_reasons: returnPolicyData.returnShipping.paidByBrandReasons || [],
            
            // Fees
            restocking_fee_type: returnPolicyData.restockingFee.type,
            restocking_fee_value: returnPolicyData.restockingFee.type === 'none' 
                ? 0 
                : returnPolicyData.restockingFee.value,
            restocking_fee_usd_price: returnPolicyData.restockingFee.type === 'fixed' 
                ? (returnPolicyData.restockingFee.usdPrice ?? 0)
                : 0,
            restocking_fee_applies_to: returnPolicyData.restockingFee.appliesTo || [],
            
            // Methods
            return_methods: returnPolicyData.returnMethods,
            refund_methods: returnPolicyData.refundMethods,
            
            // JSON structures
            return_reasons: returnPolicyData.returnReasons,
            condition_requirements: returnPolicyData.conditionRequirements,
            return_address: returnPolicyData.returnAddress,
            return_contact: returnPolicyData.returnContact,
            
            // New JSON structures
            evidence_requirements: returnPolicyData.evidenceRequirements,
            exchange_policy: returnPolicyData.exchangePolicy,
            international_returns: returnPolicyData.internationalReturns,
            return_submission_limits: returnPolicyData.returnSubmissionLimits,
            
            // Text fields
            return_instructions: returnPolicyData.returnInstructions,
            special_notes: returnPolicyData.specialNotes,
        };

        // Insert the new policy
        const { data: newPolicy, error: insertError } = await supabase
            .from("return_policies")
            .insert(policyData)
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
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return {
            success: false,
            message: errorMessage,
        };
    }
}

// Helper function to fetch active policy
export async function getActiveReturnPolicy(brandId: string) {
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from("return_policies")
            .select("*")
            .eq("brand_id", brandId)
            .eq("is_active", true)
            .eq("is_global", true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows returned
                return null;
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error fetching return policy:", error);
        return null;
    }
}