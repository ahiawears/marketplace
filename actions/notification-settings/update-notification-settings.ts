"use server";

import { createClient } from "@/supabase/server";
import { BrandNotificationSettingCheckboxTable } from "../../lib/types";

// Define the return type for better type safety
interface ServerActionResponse {
    success: boolean;
    message?: string;
    data?: BrandNotificationSettingCheckboxTable[];
}

export async function UpdateNotificationSettings(
    userId: string, 
    role: string, 
    settings: BrandNotificationSettingCheckboxTable[]
): Promise<ServerActionResponse> {
    const supabase = await createClient();

    try {
        if (!userId || !role) {
            return {
                success: false,
                message: "User ID and role are required to update notification settings."
            };
        }

        if (role === "brand") {
            // 1. Delete existing settings for the brand.
            const { error: deleteError } = await supabase
                .from('brand_notification_settings')
                .delete()
                .eq('brand_id', userId);

            if (deleteError) {
                console.error("Supabase delete error:", deleteError);
                return { success: false, message: deleteError.message };
            }

            // 2. Prepare data for reinsertion.
            const dataToInsert = settings.map(setting => ({
                brand_id: userId,
                notification_type: setting.type,
                email: setting.channels.email,
                sms: setting.channels.sms,
                in_app: setting.channels.in_app,
            }));

            // 3. Insert new settings.
            const { error: insertError } = await supabase
                .from('brand_notification_settings')
                .insert(dataToInsert);

            if (insertError) {
                console.error("Supabase insert error:", insertError);
                return { success: false, message: insertError.message };
            }

            // Return success with the updated data
            return {
                success: true,
                message: "Notification settings updated successfully.",
                data: settings,
            };

        } else {
            return {
                success: false,
                message: "Invalid role provided. Only 'brand' is supported for this action."
            };
        }
    } catch (error) {
        console.error("Unexpected error in server action:", error);
        return {
            success: false,
            message: `An unexpected error occurred: ${error instanceof Error ? error.message : "unknown error"}`
        };
    }
}
