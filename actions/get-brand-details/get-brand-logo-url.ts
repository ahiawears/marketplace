export async function GetBrandLogoUrl(supabase: any, userId: string) {
    console.log("The user id is: ", userId);
    try {
        const {data: logoURL, error: logoURLError} = await supabase
            .from('brand_logo')
            .select('logo_url')
            .eq('brand_id', userId)
            .single();

        if (logoURLError) {
            throw new Error(`Error getting brand logo URL: ${logoURLError}, ${logoURLError.name}, ${logoURLError.message}}`);
        }

        if (logoURL) {
            return logoURL;
        }
    } catch (error: any) {
        throw new Error(`Error getting brand logo URL: ${error}, ${error.name}, ${error.message}`)
    }
}