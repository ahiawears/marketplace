import { BrandOnboarding } from "@/lib/types";

export const updateBrandBasicDetails = async (supabase: any, data: BrandOnboarding["brandInformation"], userId: string) => {
    try {
        const { data: brandData, error } = await supabase.
            from("brands_list")
            .upsert({
                id: userId,
                name: data.brand_name,
                description: data.brand_description,
                logo: data.brand_logo,
                banner: data.brand_banner,
            },
            {
                onConflict: 'id'
            }
        ).select();

        if (error) {
            console.error(`Error uploading brand basic details`);
            throw error
        }

        if (brandData) {
            return new Response(JSON.stringify({
                success: true,
                brandData
            }), 
            {
                status: 200,
            });
        }
    } catch ( error ) {
        return new Response(JSON.stringify({
            success: false,
            error: error,
        }));
    }
}