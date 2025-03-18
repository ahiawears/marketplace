import { BrandOnboarding } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const updateBrandBusinessDetails = async (supabase: any, data: BrandOnboarding["businessDetails"], userId: string) => {
    try {
        const { data: businessDetails, error } = await supabase
            .from("brand_legal_details")
            .upsert({
                id: userId,
                business_registration_name: data.business_registration_name,
                business_registration_number: data.business_registration_number,
                country_of_registration: data.country_of_registration,
            }, {
                onConflict: "id",
            })
            .select();

        if(error) {
            throw error
        }

        if (businessDetails) {
            return new Response(JSON.stringify({
                success: true,
                businessDetails,
            }), 
            {
                status: 200,
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error,
        }));
    }
}