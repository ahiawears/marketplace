"use client";

import LoadContent from "@/app/load-content/page";
import BrandNotificationSettingsTable from "@/components/brand-dashboard/brand-notification-table";
import { useAuth } from "@/hooks/useAuth";
import { useFetchNotificationSettings } from "@/hooks/useFetchNotificationSettings";
import { BrandNotificationSettingCheckboxTable, DEFAULT_BRAND_NOTIFICATION_SETTINGS } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";

const Notifications = () => {
	const { userId, userSession, loading, error, resetError } = useAuth();

	const {
        brandNotificationSettings: fetchedBrandSettings,
        loading: settingsLoading,
        error: settingsError,
        resetError: resetSettingsError
    } = useFetchNotificationSettings(userId!, "brand", userSession?.access_token ?? "");

	const [settings, setSettings] = useState<BrandNotificationSettingCheckboxTable[]>([]);

	 useEffect(() => {
        if (!settingsLoading && fetchedBrandSettings && fetchedBrandSettings.length > 0) {
            setSettings(fetchedBrandSettings); 
        } else if (!settingsLoading && fetchedBrandSettings && fetchedBrandSettings.length === 0) {
            setSettings(DEFAULT_BRAND_NOTIFICATION_SETTINGS);
        }
    }, [settingsLoading, fetchedBrandSettings]); 


	if (loading || settingsLoading) {
        return <LoadContent />;
    }
    if (!userId || !userSession?.access_token) {
        // Consider a more user-friendly message or redirect here
		//logout here
        return <LoadContent />; 
		
    }

	return (
		<div className="container mx-auto p-4">
			<Toaster position="top-right" richColors  />
			<h1 className="text-2xl font-bold mb-4">Notifications Settings</h1>

			<BrandNotificationSettingsTable
				userId={userId!}
				accessToken={userSession.access_token}
				settings={settings}
				setSettings={setSettings}
			/>
			
			{/* You can add more content or components here as needed */}
		</div>
	);
};

export default Notifications;
