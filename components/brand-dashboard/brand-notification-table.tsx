"use client";

import { FC, useEffect, useState } from "react";
import { BrandNotificationSettingCheckboxTable } from "@/lib/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { UpdateNotificationSettings } from "@/actions/notification-settings/update-notification-settings";

interface BrandNotificationTableProps {
    userId: string;
    settings: BrandNotificationSettingCheckboxTable[];
}

const capitalize = (s: string): string => {
    return s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Performs a deep comparison of two arrays of BrandNotificationSettingCheckboxTable.
 * @param arr1
 * @param arr2 
 * @returns 
 */
const areSettingsEqual = (arr1: BrandNotificationSettingCheckboxTable[], arr2: BrandNotificationSettingCheckboxTable[]): boolean => {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        const item1 = arr1[i];
        const item2 = arr2[i];
        
        if (
            item1.type !== item2.type ||
            item1.channels.email !== item2.channels.email ||
            item1.channels.sms !== item2.channels.sms ||
            item1.channels.in_app !== item2.channels.in_app
        ) 
            {
                return false;
            }
    }
    return true;
};

const BrandNotificationSettingsTable: FC<BrandNotificationTableProps> = ({ userId, settings }) => {
    const [dbSettings, setDbSettings] = useState<BrandNotificationSettingCheckboxTable[]>(settings);
    const role = "brand";

    useEffect(() => {
        setDbSettings(settings);
    }, [settings]);

    const toggleChannel = (
        type: string,
        channel: "email" | "sms" | "in_app"
    ) => {
        setDbSettings((prev) =>
            prev.map((dbSetting) =>
                dbSetting.type === type
                ? {
                    ...dbSetting,
                    channels: {
                        ...dbSetting.channels,
                        [channel]: !dbSetting.channels[channel],
                    },
                } : dbSetting
            )
        );
    };

    const [isSaving, setIsSaving] = useState(false);
    
    const hasChanges = !areSettingsEqual(settings, dbSettings);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        
        try {
            const response = await UpdateNotificationSettings(userId, role, dbSettings);
           
            if (response.success) {
                toast.success(response.message || "Notification settings updated successfully!");

            } else {
                toast.error(response.message || "Failed to update notification settings.");
            }
        } catch (error) {
            toast.error(`Error updating notification settings: ${error instanceof Error ? error.message : "An unexpected error occurred"}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="overflow-x-auto border-2 rounded p-4">
            <table className="min-w-full table-auto text-sm">
                <thead>
                    <tr className="text-left text-muted-foreground border-b-2">
                        <th className="p-2 font-semibold">Notification Type</th>
                        <th className="p-2 font-semibold text-center">Email</th>
                        <th className="p-2 font-semibold text-center">SMS</th>
                        <th className="p-2 font-semibold text-center">In-App</th>
                    </tr>
                </thead>
                <tbody>
                    {dbSettings && dbSettings.length > 0 ? (
                        dbSettings.map((setting) => (
                            <tr key={setting.type} className="border-b-2">
                                <td className="p-2">{capitalize(setting.type)}</td>
                                {(["email", "sms", "in_app"] as const).map((channel) => (
                                    <td key={channel} className="text-center p-2">
                                        <Input
                                            type="checkbox"
                                            checked={setting.channels[channel]}
                                            onChange={() => toggleChannel(setting.type, channel)}
                                            className="h-4 w-4 accent-primary border-2"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                No notification settings found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex py-4 w-full">
                <Button
                    className="ml-auto bg-primary text-white hover:bg-primary-dark"
                    onClick={handleSaveChanges}
                    disabled={isSaving || !hasChanges}
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
};

export default BrandNotificationSettingsTable;