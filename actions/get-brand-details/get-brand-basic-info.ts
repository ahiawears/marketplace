import { createClient } from "@/supabase/server";

export async function GetBrandProfile(brandId: string) {
    const supabase = await createClient();

    try {
        const { data: basicData, error } = await supabase
            .from('brands_list')
            .select('name, description')
            .eq('id', brandId)
            .single();

        if (error) {
            throw error;
        }

        const {data: bannerUrl, error: bannerUrlError} = await supabase
            .from('brand_banner')
            .select('banner_url')
            .eq('id', brandId)
            .single();

        if (bannerUrlError) {
            throw bannerUrlError;
        }

         const {data: logoURL, error: logoURLError} = await supabase
            .from('brand_logo')
            .select('logo_url')
            .eq('id', brandId)
            .single();

        if (logoURLError) {
            throw logoURLError;
        }

        const dataToReturn  = {
            name: basicData.name,
            description: basicData.description,
            banner: bannerUrl.banner_url,
            logo: logoURL.logo_url
        }

        return {
            success: true,
            message: "Brand Details fetched successfully",
            data: dataToReturn
        }

    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred",
            data: null
        }
    }
}