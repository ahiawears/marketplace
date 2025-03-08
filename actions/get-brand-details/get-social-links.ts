export async function GetBrandSocialLinks(supabase: any, userId: string) {
    console.log("The user id is: ", userId);
    try{
        const { data: socialLinks, error: socialLinksError } = await supabase  
            .from('brand_social_links')
            .select('instagram, facebook, twitter, website')
            .eq('brand_id', userId)
            .single();

        if(socialLinksError) {
            console.error("Error getting brand logo URL: ", socialLinksError);
            throw new Error(`Error getting brand logo URL: ${socialLinksError.message}`);
        }

        if (!socialLinks) {
            console.log("No links found for the user.");
            return null; // Return null if no logo is found
        }
        console.log("Logo URL found: ", socialLinks);
        return socialLinks;
    } catch (error: any) {
        throw new Error(`Error getting brand social links: ${error}, ${error.name}, ${error.message}`)
    }
}