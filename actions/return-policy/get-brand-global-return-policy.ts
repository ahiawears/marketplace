"use server";

import { ReturnPolicyInterface, returnAddressSchema, returnContactSchema, returnPolicySchema } from "@/lib/return-policy-validation";
import { createClient } from "@/supabase/server";
import { z } from "zod";

interface RawApiData {
    brand_id: string;
    version: number;
    is_global: boolean;
    is_active: boolean;
    return_window_days: number;
    refund_processing_time_days: number;
    restocking_fee_type: 'percentage' | 'fixed';
    restocking_fee_value: number;
    return_shipping_responsibility: z.infer<typeof returnPolicySchema.shape.returnShippingResponsibility>;
    return_reasons: z.infer<typeof returnPolicySchema.shape.returnReasons>;
    condition_requirements: z.infer<typeof returnPolicySchema.shape.conditionRequirements>;
    return_methods: z.infer<typeof returnPolicySchema.shape.returnMethods>;
    refund_methods: z.infer<typeof returnPolicySchema.shape.refundMethods>;
    return_address: z.infer<typeof returnAddressSchema>;
    return_contact: z.infer<typeof returnContactSchema>;
    return_instructions: string | null;
}

const transformApiDataToBrandReturnPolicy = (data: RawApiData): ReturnPolicyInterface => {
    return {
        policyScope: data.is_global ? 'brand' : 'product',
        returnWindowDays: data.return_window_days,
        refundProcessingTimeDays: data.refund_processing_time_days,
        restockingFee: {
            type: data.restocking_fee_type,
            value: data.restocking_fee_value,
        },
        returnShippingResponsibility: data.return_shipping_responsibility,
        returnReasons: data.return_reasons,
        conditionRequirements: data.condition_requirements,
        returnMethods: data.return_methods,
        refundMethods: data.refund_methods,
        returnAddress: data.return_address,
        returnContact: data.return_contact,
        returnInstructions: data.return_instructions ?? "",
    };
}

export async function getBrandGlobalReturnPolicy(brandId: string): Promise<{ success: boolean; data: ReturnPolicyInterface | null; message: string; }> {
    if (!brandId) {
        return { success: false, data: null, message: "Brand ID is required." };
    }

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
            .single();

        if (error) {
            if (error.code === 'PGRST116') { 
                return { success: true, data: null, message: "No active global return policy found." };
            }
            console.error("Error fetching return policy:", error.message);
            return { success: false, data: null, message: `Database error: ${error.message}` };
        }

        if (!data) {
            return { success: true, data: null, message: "No active global return policy found." };
        }

        const rawData = data as RawApiData;
        const transformedData = transformApiDataToBrandReturnPolicy(rawData);

        const validationResult = returnPolicySchema.safeParse(transformedData);
        if (!validationResult.success) {
            console.error("Transformed data failed validation:", validationResult.error.flatten());
            return { success: false, data: null, message: "Fetched data is malformed." };
        }

        return {
            success: true,
            data: validationResult.data,
            message: "Successfully fetched the global return policy."
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Unexpected error in getBrandGlobalReturnPolicy:", errorMessage);
        return { success: false, data: null, message: errorMessage };
    }
}