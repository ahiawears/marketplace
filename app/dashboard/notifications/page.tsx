import BrandNotificationSettingsTable from "@/components/brand-dashboard/brand-notification-table";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import React from "react";
import { FetchNotificationSettings } from "@/actions/notification-settings/fetch-notification-settings";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Notification Settings",
}

const Notifications = async () => {
    const supabase = await createClient();
    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user.user) {
        redirect("/login-brand");
    }

    const userId = user?.user?.id;

    const notificationSettings = await FetchNotificationSettings(userId, "brand");

    return (
        <div className="container mx-auto p-4 border-2">
            <h1 className="text-2xl font-bold my-4">Notifications Settings</h1>

            <BrandNotificationSettingsTable
                userId={userId}
                settings={notificationSettings}
            />
            
        </div>
    );
};

export default Notifications;