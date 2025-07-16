export async function FetchNotificationSettings(supabase: any, userId: string, role: string) {
    try {
        if (!userId || !role) {
            throw new Error("User ID and role are required to fetch notification settings");
        }

        if (role === "brand") {
            const { data, error } = await supabase
                .from('brand_notification_settings')
                .select('*')
                .eq('brand_id', userId);

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                return [];
            }

            return data;
        } else if (role === "customer") {
            const { data, error } = await supabase
                .from('customer_notification_settings')
                .select('*')
                .eq('customer_id', userId);

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                return [];
            }

            return data;
        }
    } catch (error) {
        throw new Error(`Error fetching notification settings: ${error instanceof Error ? error.message : "An unexpected error occurred"}`);
    }
}