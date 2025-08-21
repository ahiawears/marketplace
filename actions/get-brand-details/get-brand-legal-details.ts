import { createClient } from "@/supabase/server";

interface BrandLegalDetailsResponse {
    business_registration_name?: string;
    business_registration_number?: string;
    country_of_registration?: string;
    success: boolean;
    message: string;
}

export async function GetBrandLegalDetails(brandId: string): Promise<BrandLegalDetailsResponse> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('brand_legal_details')
            .select('*')
            .eq('id', brandId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return {
                    success: false,
                    message: "Brand not found",
                }
            }
            return {
                success: false,
                message: error.message,
            }
        }
        
        return {
            success: true,
            message: "Legal details fetched successfully",
            business_registration_name: data?.business_registration_name,
            business_registration_number: data?.business_registration_number,
            country_of_registration: data?.country_of_registration,
        }

    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred",
        }
    }
}