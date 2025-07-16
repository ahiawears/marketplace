import { FC, useEffect, useState } from "react";
import { BrandNotificationSettingCheckboxTable } from "@/lib/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface BrandNotificationTableProps {
    userId: string;
    accessToken: string;
    settings: BrandNotificationSettingCheckboxTable[];
    setSettings: React.Dispatch<React.SetStateAction<BrandNotificationSettingCheckboxTable[]>>;
}

const capitalize = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const BrandNotificationSettingsTable: FC<BrandNotificationTableProps> = ({ settings, setSettings, userId, accessToken }) => {
    const role = "brand";
    const toggleChannel = (
        type: string,
        channel: "email" | "sms" | "in_app"
    ) => {
        setSettings((prev) =>
            prev.map((setting) =>
                setting.type === type
                ? {
                    ...setting,
                    channels: {
                        ...setting.channels,
                        [channel]: !setting.channels[channel],
                    },
                } : setting
            )
        );
    };

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(userId !== "") {
            console.log("The user id is: ", userId);
            //logout here
        }
    }, [userId]);

    const handleSaveChanges = async () => {
        setIsSaving(true);

        try {
            setSettings((prev) => {
                return prev.map((setting) => ({
                    ...setting,
                    channels: {
                        email: setting.channels.email,
                        sms: setting.channels.sms,
                        in_app: setting.channels.in_app,
                    },
                }));
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/update-notification-settings?role=${role}&userId=${userId}`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(settings),
                }
            )

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to save notification settings");
            }

            const data = await res.json();
            if (!data.success) {
                toast.error(`Failed to save shipping details: ${data.message}`);
            }

            if (data.success) {
                toast.success("Notification settings updated successfully!");
            }
        } catch (error) {
            toast.error(`Error updating notification settings: ${error instanceof Error ? error.message : "An unexpected error occurred"}`);
        } finally {
            setIsSaving(false);
        }
        
    }

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
                    {settings.map((setting) => (
                        <tr key={setting.type} className="border-b-2">
                            <td className="p-2">{capitalize(setting.type)}</td>
                            {(["email", "sms", "in_app"] as const).map((channel) => (
                                <td key={channel} className="text-center p-2">
                                    <input
                                        type="checkbox"
                                        checked={setting.channels[channel]}
                                        onChange={() => toggleChannel(setting.type, channel)}
                                        className="h-4 w-4 accent-primary border-2"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex py-4 w-full">
                <Button
                    className="ml-auto bg-primary text-white hover:bg-primary-dark"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}

export default BrandNotificationSettingsTable;