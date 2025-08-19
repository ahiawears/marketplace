"use server"

import { createClient } from "@/supabase/server";

interface UploadResponse {
    success: boolean;
    data?: { publicUrl: string };
    message?: string;
}

/**
 * Uploads a brand banner to Supabase Storage and saves its URL to the database.
 * @param userId The unique ID of the brand.
 * @param blob The Blob object of the image file.
 * @returns An object indicating success, with the public URL if successful.
 */
export async function UploadBrandBanner(userId: string, blob: Blob): Promise<UploadResponse> {
    const supabase = await createClient();
    try {
        const bucketName = "brand-banner";
        const uniqueFileName = `${userId}/banner.png`;

        // Upload the new file, which will overwrite the old one due to `upsert: true`
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(uniqueFileName, blob, {
                upsert: true,
                contentType: blob.type,
            });

        if (uploadError) {
            return { success: false, message: uploadError.message };
        }

        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uniqueFileName);

        const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

        // Upsert into the database
        const { error: bannerInsertionError } = await supabase
            .from("brand_banner")
            .upsert({ id: userId, banner_url: publicUrl }, { onConflict: 'id' });

        if (bannerInsertionError) {
            return { success: false, message: bannerInsertionError.message };
        }

        return { success: true, data: { publicUrl } };
    } catch (error) {
        return { success: false, message: "An unexpected error occurred during the banner upload process." };
    }
}