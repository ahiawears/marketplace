import type { BrandOnboarding } from '../../lib/types';

export const updateBrandPaymentDetails = async (supabase: any, data: BrandOnboarding["paymentInformation"], userId: string) => {
    try {
        const {data: brandData, error} = await supabase
            .from("brand_bank_info")
            .upsert({
                id: userId,
                bank_name: data.bank_name,
                account_number: data.account_number,
                bank_code: data.account_bank,
                split_type: data.split_type,
                split_value: data.split_value,
                account_contact_mobile: data.business_contact_mobile,
                account_contact_name: data.business_contact,
                subaccount_id: data.subaccount_id,
                country: data.country,
            }, {
                onConflict: 'id',
            }).select();

        if (error) {
            console.error(`The upload brandd payment error is ${error}`);
            throw error;
        }

        if (brandData) {
            return {
                success: true,
                brandData,
            }
        }
    } catch (error) {
        console.error(`The upload brandd payment error is ${error}`);
        throw error;
    }
}