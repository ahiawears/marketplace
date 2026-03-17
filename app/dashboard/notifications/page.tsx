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
        <div className="container mx-auto space-y-6 p-4">
            <div className="border-2 bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">Notification Settings</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Control how your brand receives operational updates, finance notices, and future inventory alerts.
                </p>
            </div>

            <BrandNotificationSettingsTable
                userId={userId}
                settings={notificationSettings}
            />
            
        </div>
    );
};

export default Notifications;
