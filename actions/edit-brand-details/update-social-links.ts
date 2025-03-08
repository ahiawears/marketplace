export async function updateSocialMediaLinks(supabase: any, website: string, facebook: string, instagram: string, twitter: string, brand_id: string) {
    try {
        const { data, error } = await supabase
            .from("brand_social_links")
            .upsert([{ 
                brand_id, 
                website, 
                instagram, 
                twitter, 
                facebook 
            }], { 
                onConflict: ["brand_id"] }
            );
        
        if (error) {
            throw error;
        } 

        return new Response(JSON.stringify({ success: true, data }), { status: 200 });

    } catch (error) {
        console.error("Error updating social media links:", error);
        throw error;
    }
}