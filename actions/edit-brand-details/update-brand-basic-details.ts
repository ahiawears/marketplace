import type {BrandOnboarding} from '../../lib/types';

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
            }).select();

        if (error) {
            console.error(`Error uploading brand basic details ${error.message} ${error.cause}`);
            throw error;
            
        }

        if (brandData) {
            return {
                success: true,
                brandData
            };
        }
    } catch ( error ) {
        console.error(`Error uploading brand basic details ${error}`);
        throw error;
    }
}