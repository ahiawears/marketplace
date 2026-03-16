import { ReturnPolicySchemaType } from "@/lib/validation-logics/add-product-validation/product-schema";

export async function createReturnPolicy(supabase: any, returnPolicyData: ReturnPolicySchemaType) {
    const { data: existingPolicy, error: fetchError } = await supabase
        .from('product_return_policy')
        .select('*')
        .eq('product_id', returnPolicyData.productId)
        .eq('is_active', true)
        .maybeSingle();

    if (fetchError) {
        console.error("Error fetching existing product return policy:", fetchError);
        throw fetchError;
    }

    let nextVersion = 1;

    if (existingPolicy) {
        nextVersion = existingPolicy.version + 1;
        const { error: deactivateError } = await supabase
            .from('product_return_policy')
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingPolicy.id);

        if (deactivateError) {
            console.error("Error deactivating old product return policy:", deactivateError);
            throw deactivateError;
        }
    }

    const policySnapshot = {
        isReturnable: returnPolicyData.isReturnable,
        useProductSpecificReturnPolicy: returnPolicyData.useProductSpecificReturnPolicy,
        returnWindowDays: returnPolicyData.returnWindowDays,
        refundProcessingTimeDays: returnPolicyData.refundProcessingTimeDays,
        restockingFee: returnPolicyData.restockingFee,
        refundMethods: returnPolicyData.refundMethods,
        returnShippingResponsibility: returnPolicyData.returnShippingResponsibility,
        conditionRequirements: returnPolicyData.conditionRequirements,
        returnInstruction: returnPolicyData.returnInstruction || "",
    };

    const { data: newPolicy, error: insertError } = await supabase
        .from("product_return_policy")
        .insert({
            product_id: returnPolicyData.productId,
            use_global_policy: !returnPolicyData.useProductSpecificReturnPolicy,
            policy: policySnapshot,
            return_window_days: returnPolicyData.returnWindowDays,
            refund_processing_time_days: returnPolicyData.refundProcessingTimeDays,
            restocking_fee_type: returnPolicyData.restockingFee.type,
            restocking_fee_value: returnPolicyData.restockingFee.value,
            refund_methods: returnPolicyData.refundMethods,
            return_shipping_responsibility: returnPolicyData.returnShippingResponsibility,
            condition_requirements: returnPolicyData.conditionRequirements,
            is_returnable: returnPolicyData.isReturnable === "returnable",
            version: nextVersion,
            is_active: true,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertError) {
        console.error("Error inserting new product return policy:", insertError);
        throw insertError;
    }

    return newPolicy;
}
