export async function UploadBrandBanner(supabase: any, userId: string, blob: Blob) {
    try {
        const bucketName = "brand-banner";

        console.log("The brand banner is: ", blob);
        const uniqueFileName = `${userId}/banner.png`; // Use a consistent file extension

        // Delete the old file (if it exists)
        const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove([uniqueFileName]);

        if (deleteError && deleteError.message !== "File not found") {
            console.error("Error deleting old file:", deleteError);
            throw new Error(`Error deleting old file: ${deleteError.message}`);
        }

        // Upload the new file
        console.log("Uploading file to storage:", uniqueFileName);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(uniqueFileName, blob, {
                upsert: true,
                contentType: blob.type,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(`Error uploading banner: ${uploadError.message}`);
        }

        console.log("File uploaded successfully:", uploadData);

        // Get public URL of the uploaded file
        const { data: publicUrlData, error: publicUrlError } = await supabase.storage
            .from(bucketName)
            .getPublicUrl(uniqueFileName);

        if (publicUrlError) {
            throw new Error(`Error getting public URL: ${publicUrlError.message}`);
        }

        const publicUrl = publicUrlData.publicUrl;

        // Upsert into the database
        console.log("Upserting data:", { brand_id: userId, logo_url: publicUrl });
        const { error: bannerInsertionError } = await supabase
            .from("brand_banner")
            .upsert({ id: userId, banner_url: publicUrl }, { onConflict: 'id' });

        if (bannerInsertionError) {
            throw new Error(`Error inserting logo URL into database: ${bannerInsertionError.message}`);
        }

        console.log("Banner uploaded and URL saved successfully.");
        return publicUrl;
    } catch (error) {
        console.error("Error uploading banner:", error);
        throw error;
    }
}