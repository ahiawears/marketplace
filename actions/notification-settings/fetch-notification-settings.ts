import { BrandNotificationSettingCheckboxTable, BrandNotificationType, DEFAULT_BRAND_NOTIFICATION_SETTINGS } from "@/lib/types";
import { createClient } from "@/supabase/server";

interface DbNotificationSetting {
    type: BrandNotificationType;
    email: boolean;
    sms: boolean;
    in_app: boolean;
}

export async function FetchNotificationSettings(
    userId: string,
    role: string
): Promise<BrandNotificationSettingCheckboxTable[]> {
    const supabase = await createClient();

    try {
        if (!userId || !role) {
            throw new Error("User ID and role are required to fetch notification settings");
        }

        let dbTableName;
        let dbUserIdField;
        if (role === "brand") {
            dbTableName = 'brand_notification_settings';
            dbUserIdField = 'brand_id';
        } else if (role === "customer") {
            dbTableName = 'customer_notification_settings';
            dbUserIdField = 'customer_id';
        } else {
            throw new Error("Invalid role provided. Must be 'brand' or 'customer'");
        }

        const { data, error } = await supabase
            .from(dbTableName)
            .select('notification_type, email, sms, in_app') 
            .eq(dbUserIdField, userId);

        if (error) {
            throw error;
        }

        // If no data is found, return the default settings
        if (!data || data.length === 0) {
            return DEFAULT_BRAND_NOTIFICATION_SETTINGS;
        }

        // Transform the raw database data into the expected format
        const formattedData: BrandNotificationSettingCheckboxTable[] = data.map(
            (item: any) => ({
                type: item.notification_type,
                channels: {
                    email: item.email,
                    sms: item.sms,
                    in_app: item.in_app,
                },
            })
        );
        
        return formattedData;

    } catch (error) {
        console.error("Error fetching notification settings:", error);
        return DEFAULT_BRAND_NOTIFICATION_SETTINGS;
    }
}