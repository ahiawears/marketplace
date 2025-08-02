import { createClient } from "@/supabase/server"

export const getBrandData = async (brandId: string) => {
    const supabase = await createClient();

    const { data: brandData, error: brandDataError } = await supabase
        .from("brands_list")
        .select('id, name, description, logo, banner')
        .eq("id", brandId)
        .single();

    if (brandDataError) {
        if (brandDataError.code === 'PGRST116') {
            return null; 
        } else {
            throw new Error(`${brandDataError.message}`);
        }
    }

    const { data: legalDetails, error: legalDetailsError } = await supabase
        .from('brand_legal_details')
        .select('country_of_registration')
        .eq('id', brandId)
        .single();

    if (legalDetailsError) {
        throw new Error(`${legalDetailsError.message}`);
    }

    const { data: socialLinks, error: socialLinksError } = await supabase
        .from('brand_social_links')
        .select('instagram, facebook, twitter, website, tiktok')
        .eq('id', brandId)
        .single();

    if (socialLinksError) {
        throw new Error(`${socialLinksError.message}`);
    }

    const mappedSocialLinks = {
        website: socialLinks.website,
        instagram: socialLinks.instagram,
        facebook: socialLinks.facebook,
        twitter: socialLinks.twitter,
        tiktok: socialLinks.tiktok,
    }

    const dataToReturn = {
        ...brandData,
        country_of_registration: legalDetails.country_of_registration,
        social_links: mappedSocialLinks,
    }

    return dataToReturn;

}