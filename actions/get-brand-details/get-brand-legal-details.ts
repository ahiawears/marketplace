import { createClient } from "@/supabase/server";

interface BrandLegalDetailsData {
  business_registration_name: string;
  business_registration_number: string;
  country_of_registration: string;
}

interface BrandLegalDetailsResponse {
  data: BrandLegalDetailsData | null;
  success: boolean;
  message: string;
}


export async function GetBrandLegalDetails(brandId: string): Promise<BrandLegalDetailsResponse> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('brand_legal_details')
            .select("business_registration_name, business_registration_number, country_of_registration")
            .eq('id', brandId)
            .single();

        if (error) {
            const message = error.code === "PGRST116"
                ? "Brand not found"
                : error.message;
            return { success: false, message, data: null };
        }

        if (!data) {
            return { success: false, message: "Brand legal details not found", data: null };
        }
        
        return {
            success: true,
            message: "Legal details fetched successfully",
            data: data,
        }

    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred",
            data: null,
        }
    }
}