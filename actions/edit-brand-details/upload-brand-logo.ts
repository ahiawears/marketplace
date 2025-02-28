export async function UploadBrandLogo(supabase: any, userId: string, blob: Blob) {
    try {
        const bucketName = "brand-logo";

        console.log("The brand Logo is: ", blob);
        const uniqueFileName = `${userId}/logo.${blob.type.split("/")[1] || "png"}`;

        //Upload to supabase storage

        const{ data, error } = await supabase.storage
            .from(bucketName)
            .upload(`${uniqueFileName}`, blob, {
                upsert: true,
                contentType: blob.type,
            });
        if (error) {
            throw new Error(`Error uploading logo: ${error.message}`);
        }

        const { data: publicUrlData, error: publicUrlError } = await supabase.storage
            .from(bucketName)
            .getPublicUrl(`${uniqueFileName}`);
        
        if (publicUrlError) {
            throw new Error(`Error getting public URL: ${publicUrlError.message}`);
        }

        const publicUrl = publicUrlData.publicUrl;

        const { error: logoInsertionError } = await supabase
            .from("brand_logo")
            .upsert({ brand_id: userId, logo_url: publicUrl})
            .select();
    
        if (logoInsertionError) {
            throw new Error(`Error inserting logo URL to database: ${logoInsertionError.message}`);
        }
        return publicUrl;
    } catch (error) {
        console.error("Error uploading logo:", error);
        throw error;
    }
}