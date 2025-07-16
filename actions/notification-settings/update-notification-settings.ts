import { BrandNotificationSettingCheckboxTable } from "../../lib/types.ts";

export async function UpdateNotificationSettings(supabase: any, userId: string, role: string, settings: BrandNotificationSettingCheckboxTable[]) {
    try {
        if (!userId || !role) {
            throw new Error("User ID and role are required to update notification settings");
        }

        if (role === "brand") {

            try {
                // 1. Delete existing settings for the brand
                const { error: deleteError } = await supabase
                    .from('brand_notification_settings')
                    .delete()
                    .eq('brand_id', userId);

                if (deleteError) {
                    throw deleteError;
                }

                // 2. Prepare data for reinsertion
                const dataToInsert = settings.map(setting => ({
                    brand_id: userId,
                    notification_type: setting.type,
                    email: setting.channels.email,
                    sms: setting.channels.sms,
                    in_app: setting.channels.in_app,
                }));

                // 3. Insert new settings
                const { error: insertError } = await supabase
                    .from('brand_notification_settings')
                    .insert(dataToInsert);

                if (insertError) {
                    throw insertError;
                }

            } catch (error) {
                throw new Error(
                    `Error updating notification settings: ${error instanceof Error ? error.message : "An unexpected error occurred"}`
                );
            }
        }
    } catch(error) {
        throw new Error(`Error updating notification settings: ${error instanceof Error ? error.message : "An unexpected error occurred"}`);
    }
}