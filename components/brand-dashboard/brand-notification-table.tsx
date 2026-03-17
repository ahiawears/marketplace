"use client";

import { FC, useEffect, useState } from "react";
import { BrandNotificationSettingCheckboxTable } from "@/lib/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { UpdateNotificationSettings } from "@/actions/notification-settings/update-notification-settings";

interface BrandNotificationTableProps {
    userId: string;
    settings: BrandNotificationSettingCheckboxTable[];
}

const NOTIFICATION_COPY: Record<
    BrandNotificationSettingCheckboxTable["type"],
    { label: string; description: string }
> = {
    new_order: {
        label: "New orders",
        description: "Get notified as soon as a customer places a new order with your brand.",
    },
    order_status_update: {
        label: "Order status updates",
        description: "Stay informed when delivery and fulfillment states change.",
    },
    review: {
        label: "Reviews",
        description: "Receive updates when customers leave feedback or product reviews.",
    },
    payout: {
        label: "Payouts",
        description: "Track payout processing, settlement, and finance-related notices.",
    },
    support: {
        label: "Support",
        description: "Receive support-related notifications and issue updates.",
    },
    general: {
        label: "General announcements",
        description: "Platform-wide announcements, policy changes, and important notices.",
    },
};

const capitalize = (s: string): string => {
    return s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const areSettingsEqual = (
    arr1: BrandNotificationSettingCheckboxTable[],
    arr2: BrandNotificationSettingCheckboxTable[]
): boolean => {
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
        ) {
            return false;
        }
    }
    return true;
};

const BrandNotificationSettingsTable: FC<BrandNotificationTableProps> = ({ userId, settings }) => {
    const [dbSettings, setDbSettings] = useState<BrandNotificationSettingCheckboxTable[]>(settings);
    const [savedSettings, setSavedSettings] = useState<BrandNotificationSettingCheckboxTable[]>(settings);
    const role = "brand";

    useEffect(() => {
        setDbSettings(settings);
        setSavedSettings(settings);
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
                      }
                    : dbSetting
            )
        );
    };

    const [isSaving, setIsSaving] = useState(false);

    const hasChanges = !areSettingsEqual(savedSettings, dbSettings);

    const handleSaveChanges = async () => {
        setIsSaving(true);

        try {
            const response = await UpdateNotificationSettings(userId, role, dbSettings);

            if (response.success) {
                toast.success(response.message || "Notification settings updated successfully!");
                setSavedSettings(dbSettings);
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
        <div className="space-y-6">
            <div className="border-2 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Delivery Channels</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Choose which channels your brand should use for each operational update.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-2 bg-white text-slate-700">Email</Badge>
                        <Badge variant="outline" className="border-2 bg-white text-slate-700">SMS</Badge>
                        <Badge variant="outline" className="border-2 bg-white text-slate-700">In-App</Badge>
                    </div>
                </div>
            </div>

            {dbSettings && dbSettings.length > 0 ? (
                <div className="space-y-4">
                    {dbSettings.map((setting) => (
                        <div key={setting.type} className="border-2 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-2xl">
                                    <h3 className="text-base font-semibold text-slate-900">
                                        {NOTIFICATION_COPY[setting.type]?.label || capitalize(setting.type)}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {NOTIFICATION_COPY[setting.type]?.description || "Manage this notification type."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-2 bg-slate-50 p-3">
                                    {(["email", "sms", "in_app"] as const).map((channel) => (
                                        <label
                                            key={channel}
                                            className="flex min-w-[84px] flex-col items-center gap-2 text-sm text-slate-700"
                                        >
                                            <span className="font-medium">{capitalize(channel)}</span>
                                            <Input
                                                type="checkbox"
                                                checked={setting.channels[channel]}
                                                onChange={() => toggleChannel(setting.type, channel)}
                                                className="h-5 w-5 accent-primary border-2"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border-2 bg-white p-6 text-center text-slate-500">
                    No notification settings found.
                </div>
            )}

            <div className="border-2 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900">Planned next</h3>
                <p className="mt-1 text-sm text-amber-800">
                    Low-stock email and in-app alerts will be added here once the inventory notification flow is ready.
                </p>
            </div>

            <div className="flex py-2 w-full">
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
