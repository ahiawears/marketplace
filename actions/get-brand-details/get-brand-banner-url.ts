export async function GetBrandBannerUrl(supabase: any, userId: string) {
    try {
        const {data: bannerUrl, error: bannerUrlError} = await supabase
            .from('brand_banner')
            .select('banner_url')
            .eq('id', userId)
            .single();

        if (bannerUrlError) {
            console.error("Error getting brand logo URL: ", bannerUrlError);
            throw new Error(`Error getting brand logo URL: ${bannerUrlError.message}`);
        }

        if (!bannerUrl) {
            console.log("No logo found for the user.");
            return null; // Return null if no logo is found
        }
        console.log("Logo URL found: ", bannerUrl);
        return bannerUrl;
    } catch (error) {
        throw new Error(`Error getting brand banner url: ${error}`)
    }
}