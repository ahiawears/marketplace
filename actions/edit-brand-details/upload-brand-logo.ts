"use server"

import { createClient } from "@/supabase/server";

interface UploadResponse {
    success: boolean;
    data?: { publicUrl: string };
    message?: string;
}

/**
 * Uploads a brand logo to Supabase Storage and saves its URL to the database.
 * @param userId The unique ID of the brand.
 * @param blob The Blob object of the image file.
 * @returns An object indicating success, with the public URL if successful.
 */
export async function UploadBrandLogo(userId: string, blob: Blob): Promise<UploadResponse> {
    const supabase = await createClient();
    try {
        const bucketName = "brand-logo";
        const uniqueFileName = `${userId}/logo.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(uniqueFileName, blob, {
                upsert: true,
                contentType: blob.type,
            });

        if (uploadError) {
            return { success: false, message: `${uploadError.message}` };
        }


        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uniqueFileName);

        const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

        const { error: logoInsertionError } = await supabase
            .from("brand_logo")
            .upsert({ id: userId, logo_url: publicUrl }, { onConflict: 'id' });

        if (logoInsertionError) {
            return { success: false, message: `${logoInsertionError.message}`};
        }

        return { success: true, data: { publicUrl } };
    } catch (error) {
        return { success: false, message: "An unexpected error occurred during the logo upload process." };
    }
}
