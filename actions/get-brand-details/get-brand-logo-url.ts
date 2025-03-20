export async function GetBrandLogoUrl(supabase: any, userId: string) {
    try {
        const {data: logoURL, error: logoURLError} = await supabase
            .from('brand_logo')
            .select('logo_url')
            .eq('id', userId)
            .single();

        if (logoURLError) {
            console.error("Error getting brand logo URL: ", logoURLError);
            throw new Error(`Error getting brand logo URL: ${logoURLError.message}`);
        }

        if (!logoURL) {
            console.log("No logo found for the user.");
            return null; // Return null if no logo is found
        }
        console.log("Logo URL found: ", logoURL);
        return logoURL;
    } catch (error: any) {
        throw new Error(`Error getting brand logo URL: ${error}`)
    }
}