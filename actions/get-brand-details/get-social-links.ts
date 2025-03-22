export async function GetBrandSocialLinks(supabase: any, userId: string) {
    try{
        const { data: socialLinks, error: socialLinksError } = await supabase  
            .from('brand_social_links')
            .select('instagram, facebook, twitter, website, tiktok, brand_contact_details: id(brand_email, phone_number)')
            .eq('id', userId)
            .single();

        if(socialLinksError) {
            console.error("Error getting brand social links: ", socialLinksError);
            throw new Error(`Error getting brand social links: ${socialLinksError.message}`);
        }

        if (!socialLinks) {
            console.log("No links found for the user.");
            return null; // Return null if no logo is found
        }
        console.log("Logo URL found: ", socialLinks);
        return socialLinks;
    } catch (error) {
        throw new Error(`Error getting brand social links: ${error}`)
    }
}