import { createClient } from "@/supabase/server";

const DEFAULT_BRAND_BANNER =
    "https://placehold.co/1200x400.png?text=Add+Brand+Banner";
const DEFAULT_BRAND_LOGO =
    "https://placehold.co/160x160.png?text=Logo";

export async function GetBrandProfile(brandId: string) {
    const supabase = await createClient();

    try {
        const { data: basicData, error } = await supabase
            .from('brands_list')
            .select('name, description')
            .eq('id', brandId)
            .maybeSingle();

        if (error || !basicData) {
            throw error;
        }

        const {data: bannerUrl, error: bannerUrlError} = await supabase
            .from('brand_banner')
            .select('banner_url')
            .eq('id', brandId)
            .maybeSingle();

         const {data: logoURL, error: logoURLError} = await supabase
            .from('brand_logo')
            .select('logo_url')
            .eq('id', brandId)
            .maybeSingle();

        const dataToReturn  = {
            name: basicData.name,
            description: basicData.description || "",
            banner: !bannerUrlError && bannerUrl?.banner_url ? bannerUrl.banner_url : DEFAULT_BRAND_BANNER,
            logo: !logoURLError && logoURL?.logo_url ? logoURL.logo_url : DEFAULT_BRAND_LOGO
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
