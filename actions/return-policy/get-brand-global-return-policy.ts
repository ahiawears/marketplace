"use server";

import { 
    ReturnPolicy, 
    returnPolicySchema,
    returnAddressSchema,
    returnContactSchema,
    conditionRequirementsSchema,
    returnReasonsSchema,
    evidenceRequirementsSchema,
    exchangePolicySchema,
    internationalReturnsSchema,
    returnSubmissionLimitsSchema,
    RESTOCKING_FEE_TYPE,
    SHIPPING_RESPONSIBILITY,
    RETURN_METHOD,
    REFUND_METHOD,
    RETURN_REASONS } from "@/lib/return-policy-validation";
import { createClient } from "@/supabase/server";
import { z } from "zod";

interface RawApiData {
    brand_id: string;
    version: number;
    is_global: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    return_window_days: number;
    refund_processing_time_days: number;

    return_shipping_responsibility: (typeof SHIPPING_RESPONSIBILITY)[number];
    paid_by_brand_reasons: string[] | null;

    restocking_fee_type: (typeof RESTOCKING_FEE_TYPE)[number];
    restocking_fee_value: number | null;
    restocking_fee_usd_price: number | null;
    restocking_fee_applies_to: (typeof RETURN_REASONS)[number][];

    return_methods: (typeof RETURN_METHOD)[number][];
    refund_methods: (typeof REFUND_METHOD)[number][];

    return_reasons: z.infer<typeof returnReasonsSchema>;
    condition_requirements: z.infer<typeof conditionRequirementsSchema>;
    return_address: z.infer<typeof returnAddressSchema> ;
    return_contact: z.infer<typeof returnContactSchema>;

    evidence_requirements: z.infer<typeof evidenceRequirementsSchema>;
    exchange_policy: z.infer<typeof exchangePolicySchema>;

    international_returns: z.infer<typeof internationalReturnsSchema>;
    return_submission_limits: z.infer<typeof returnSubmissionLimitsSchema>;

    return_instructions: string | null;
    special_notes: string | null;
}


const transformApiDataToBrandReturnPolicy = (data: RawApiData): ReturnPolicy => {
    // 1. Handle Restocking Fee Discriminated Union carefully
    let restockingFee: ReturnPolicy['restockingFee'];

    if (data.restocking_fee_type === 'none') {
        restockingFee = {
            type: 'none',
            value: undefined,
            appliesTo: data.restocking_fee_applies_to || [],
        };
    } else if (data.restocking_fee_type === 'percentage') {
        restockingFee = {
            type: 'percentage',
            value: data.restocking_fee_value ?? 0,
            appliesTo: data.restocking_fee_applies_to || [],
        };
    } else {
        // Must be 'fixed'
        restockingFee = {
            type: 'fixed',
            value: data.restocking_fee_value ?? 0,
            usdPrice: data.restocking_fee_usd_price ?? undefined,
            appliesTo: data.restocking_fee_applies_to || [],
        };
    }

    return {
        brandId: data.brand_id,
        returnWindowDays: data.return_window_days,
        refundProcessingTimeDays: data.refund_processing_time_days,
        isActive: data.is_active,
        version: data.version,
        
        // Ensure nulls from DB are converted to undefined for Zod optional() fields
        returnInstructions: data.return_instructions ?? undefined,
        specialNotes: data.special_notes ?? undefined,

        conditionRequirements: {
            ...data.condition_requirements,
            otherConditions: data.condition_requirements.otherConditions ?? undefined,
        },

        returnShipping: {
            responsibility: data.return_shipping_responsibility,
            paidByBrandReasons: data.paid_by_brand_reasons ?? [],
        },

        returnReasons: {
            ...data.return_reasons,
            otherReasons: {
                ...data.return_reasons.otherReasons,
                description: data.return_reasons.otherReasons.description ?? undefined,
            },
        },

        restockingFee, // Use the union-safe object created above

        returnMethods: data.return_methods || [],
        refundMethods: data.refund_methods || [],
        returnAddress: data.return_address,
        returnContact: data.return_contact,
        evidenceRequirements: data.evidence_requirements,
        exchangePolicy: data.exchange_policy,
        internationalReturns: data.international_returns,
        returnSubmissionLimits: data.return_submission_limits,
    };
};

export async function getBrandGlobalReturnPolicy(brandId: string) {
    if (!brandId) return { success: false, data: null, message: "Brand ID is required." };

    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('return_policies')
            .select('*')
            .eq('brand_id', brandId)
            .eq('is_global', true)
            .eq('is_active', true)
            .order('version', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!data) return { success: true, data: null, message: "No policy found." };

        const transformedData = transformApiDataToBrandReturnPolicy(data as RawApiData);
        const validation = returnPolicySchema.safeParse(transformedData);

        if (!validation.success) {
            console.error("Validation Error:", validation.error.format());
            return { success: false, data: null, message: "Data format mismatch." };
        }

        return { success: true, data: validation.data, message: "Policy loaded." };
    } catch (error: any) {
        return { success: false, data: null, message: error.message };
    }
}
