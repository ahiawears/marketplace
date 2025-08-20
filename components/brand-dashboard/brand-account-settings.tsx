"use client"

import ChangeBrandPassword from "@/components/brand-dashboard/change-brand-password";


type BrandPasswordAuthDetails = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
interface BrandSccountSettingsProps {
    userId: string;
}

interface Errors {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

export const BrandAccountSettings: React.FC<BrandSccountSettingsProps> = ({userId}) => {
  
    return (
        <div>
            {/* <BrandBasicDetails /> */}
            <>
                <ChangeBrandPassword/>
            </>
        </div>
    );
}