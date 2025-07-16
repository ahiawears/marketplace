import { BrandNotificationSettingCheckboxTable, DEFAULT_BRAND_NOTIFICATION_SETTINGS, FetchedBrandNotificationSettingFromDB } from "@/lib/types"
import { useEffect, useState } from "react"

interface FetchNotificationSettingsResponse {
    brandNotificationSettings: BrandNotificationSettingCheckboxTable[];
    loading: boolean;
    error: Error | null;
    resetError: () => void;
}

export const useFetchNotificationSettings = (userId: string, role: string, accessToken: string): FetchNotificationSettingsResponse => {
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);
    const resetError = () => {
        setError(null);
    };
    const [brandNotificationSettings, setBrandNotificationSettings] = useState<BrandNotificationSettingCheckboxTable[]>(DEFAULT_BRAND_NOTIFICATION_SETTINGS);

    useEffect(() => {
        if(!userId || !role || !accessToken) {
            setError(new Error("User ID and role are required to fetch notification settings"));
            setLoading(false);
            return;
        }

        const fetchNotificationSettings = async() => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/fetch-notification-settings?userId=${userId}&role=${role}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                    throw new Error(errorData.message || `Error fetching shipping config: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                if (role === "brand") {
                    const fetched: FetchedBrandNotificationSettingFromDB[] = data.data;

                    const mapped: BrandNotificationSettingCheckboxTable[] = DEFAULT_BRAND_NOTIFICATION_SETTINGS.map(defaultSetting => {
                        const foundInDb = fetched.find(item => item.notification_type === defaultSetting.type);

                        return {
                            type: defaultSetting.type,
                            channels: {
                                email: foundInDb ? foundInDb.email : defaultSetting.channels.email,
                                sms: foundInDb ? foundInDb.sms : defaultSetting.channels.sms,
                                in_app: foundInDb ? foundInDb.in_app : defaultSetting.channels.in_app,
                            }
                        };
                    });
                    setBrandNotificationSettings(mapped);
                }
            } catch (fetchError) {
                setError(error instanceof Error ? error : new Error("An unexpected error occurred"));
            } finally {
                setLoading(false);
            }
        }
        fetchNotificationSettings();
    }, [ userId, role, accessToken ]);

    return {
        brandNotificationSettings,
        // customerNotificationSettings,
        loading,
        error,
        resetError
    }
}