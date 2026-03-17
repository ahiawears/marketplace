"use client"

import ChangeBrandPassword from "@/components/brand-dashboard/change-brand-password";
import ChangeAuthEmail from "./change-brand-email";
interface BrandSccountSettingsProps {
    userId: string;
}

export const BrandAccountSettings: React.FC<BrandSccountSettingsProps> = ({userId}) => {
  
    return (
        <div className="space-y-6">
            <div className="border-2 bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">Account Settings</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Manage the credentials used to access your brand dashboard and receive security notifications.
                </p>
            </div>

            <div className="my-2 space-y-6">
                <ChangeBrandPassword/>
                <ChangeAuthEmail />
            </div>
        </div>
    );
}
