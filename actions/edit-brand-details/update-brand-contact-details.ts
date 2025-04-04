import type {BrandOnboarding} from '../../lib/types';

export const updateBrandContactDetails = async (supabase: any, data: BrandOnboarding["contactInformation"], userId: string) => {
    try {
        const {data: basicContactData, error: basicContactDataError} = await supabase
            .from("brands_contact_details")
            .upsert({
                id: userId,
                brand_email: data.business_email,
                phone_number: data.phone_number,
            }, {
                onConflict: 'id'
            }).select();
        
        if (basicContactDataError) {
            console.error(`The basic contact details error is: ${JSON.stringify(basicContactDataError)}`);
            throw basicContactDataError;
        }

        const {data: brandSocialLinks, error: brandSocialLinksError} = await supabase
            .from("brand_social_links")
            .upsert({
                id: userId,
                website: data.social_media.website,
                facebook: data.social_media.facebook,
                instagram: data.social_media.instagram,
                twitter: data.social_media.twitter,
                tiktok: data.social_media.tiktok,
            }, {
                onConflict: 'id'
            })
            .select();
        
        if(brandSocialLinksError) {
            console.error(`The brand social links error is: ${JSON.stringify(brandSocialLinksError)}`);
            throw brandSocialLinksError;
        }

        if (basicContactData && brandSocialLinks) {
            return {
                success: true,
                basicContactData,
                brandSocialLinks,
            };
        } else {
            return {
                success: false,
                message: "No data returned from Supabase.",
            }
        }
    } catch (error) {
        console.error(`The upload contact error is: ${JSON.stringify(error)}`);
        throw error;
    }
}