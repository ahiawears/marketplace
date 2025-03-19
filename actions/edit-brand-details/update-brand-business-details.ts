import type { BrandOnboarding } from '../../lib/types';

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
                onConflict: 'id',
            }).select();

        if(error) {
            console.error(`The upload brand error is: ${error}`);
            throw error;
        }

        if (businessDetails) {
            return {
                success: true,
                businessDetails,
            }
        }
    } catch (error) {
       console.error(`The upload brand error is: ${error}`);
       throw error;
    }
}