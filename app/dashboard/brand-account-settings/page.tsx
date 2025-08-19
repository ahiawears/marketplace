"use client"
import BrandBasicDetails from "@/components/brand-dashboard/brand-basic-details";
import ChangeBrandPassword from "@/components/brand-dashboard/change-brand-password";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useEffect, useState } from "react";
import validator from 'validator';

type BrandPasswordAuthDetails = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
interface BrandSccountSettingsProps {
    userId: string;
    accessToken: string;
}

interface Errors {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

export const BrandAccountSettings: React.FC<BrandSccountSettingsProps> = ({userId, accessToken}) => {
    const [changePasswordErrors, setChangePasswordErrors] = useState<Errors>({});

    const [passwordStrength, setPasswordStrength] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [passwordAuthDetails, setPasswordAuthDetails] = useState<BrandPasswordAuthDetails> ({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const onPasswordChange = (password: string) => {
        setNewPassword(password);
        setPasswordStrength(validatePasswordStrength(password));
        setPasswordMatch(password === confirmPassword);
    }

    const onConfirmPasswordChange = (confirmPassword: string) => {
        setConfirmPassword(confirmPassword);
        setPasswordMatch(newPassword === confirmPassword);
    }
    
    const validatePasswordStrength = (password: string) => {
        if (!password) return '';
        if (password.length < 8) return 'Too short';
        if (validator.isStrongPassword(password, { minSymbols: 1 })) return 'Strong';
        return 'Weak';
    };

    const updateBrandPassword = async () => {

        console.log(currentPassword, newPassword, confirmPassword)
    }
    return (
        <div>
            {/* <BrandBasicDetails /> */}
            <>
                <ChangeBrandPassword/>
            </>
        </div>
    );
}