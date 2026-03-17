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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user || user.id !== userId) {
            throw new Error("User not authenticated.");
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

        const dbMap = new Map(
            (data || []).map((item: any) => [
                item.notification_type as BrandNotificationType,
                {
                    email: item.email,
                    sms: item.sms,
                    in_app: item.in_app,
                },
            ])
        );

        return DEFAULT_BRAND_NOTIFICATION_SETTINGS.map((defaultSetting) => ({
            type: defaultSetting.type,
            channels: dbMap.get(defaultSetting.type) || defaultSetting.channels,
        }));

    } catch (error) {
        console.error("Error fetching notification settings:", error);
        return DEFAULT_BRAND_NOTIFICATION_SETTINGS;
    }
}
