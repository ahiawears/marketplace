"use server";

import { ReturnPolicy, validateReturnPolicy } from "@/lib/return-policy-validation";
import { createClient } from "@/supabase/server";

export async function updateBrandReturnPolicy(returnPolicyData: ReturnPolicy, brandId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: "User not authenticated.",
            };
        }

        if (user.id !== brandId) {
            return {
                success: false,
                message: "You are not authorized to update this return policy.",
            };
        }

        // Validate the data first
        const validation = validateReturnPolicy(returnPolicyData);
        if (!validation.success) {
            return {
                success: false,
                message: "Validation failed",
                errors: validation.error.errors
            };
        }

        const { data: newPolicy, error: rpcError } = await supabase.rpc(
            "replace_global_return_policy",
            {
                p_brand_id: brandId,
                p_return_window_days: returnPolicyData.returnWindowDays,
                p_refund_processing_time_days: returnPolicyData.refundProcessingTimeDays,
                p_return_shipping_responsibility: returnPolicyData.returnShipping.responsibility,
                p_paid_by_brand_reasons: returnPolicyData.returnShipping.paidByBrandReasons || [],
                p_return_reasons: returnPolicyData.returnReasons,
                p_condition_requirements: returnPolicyData.conditionRequirements,
                p_return_methods: returnPolicyData.returnMethods,
                p_refund_methods: returnPolicyData.refundMethods,
                p_return_contact: returnPolicyData.returnContact,
                p_return_address: returnPolicyData.returnAddress,
                p_return_instructions: returnPolicyData.returnInstructions ?? null,
                p_special_notes: returnPolicyData.specialNotes ?? null,
                p_evidence_requirements: returnPolicyData.evidenceRequirements,
                p_exchange_policy: returnPolicyData.exchangePolicy,
                p_international_returns: returnPolicyData.internationalReturns,
                p_return_submission_limits: returnPolicyData.returnSubmissionLimits,
                p_restocking_fee_type: returnPolicyData.restockingFee.type,
                p_restocking_fee_value: returnPolicyData.restockingFee.type === "none"
                    ? null
                    : returnPolicyData.restockingFee.value,
                p_restocking_fee_usd_price: returnPolicyData.restockingFee.type === "fixed"
                    ? (returnPolicyData.restockingFee.usdPrice ?? null)
                    : null,
                p_restocking_fee_applies_to: returnPolicyData.restockingFee.appliesTo || [],
            }
        );

        if (rpcError) {
            console.error("Error replacing return policy via RPC:", rpcError);
            return {
                success: false,
                message: "Failed to save the new return policy.",
            };
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
            .order("version", { ascending: false })
            .limit(1)
            .maybeSingle();

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
