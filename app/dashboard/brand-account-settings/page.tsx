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
                <div className="border-2">
                    <form className="mx-auto p-10 sm:p-4 shadow-2xl" onSubmit={updateBrandPassword}>
                        <div className="my-5 space-y-1">
                            <label
                                htmlFor="currentPassword"
                                className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                            >
                                Current Password:*
                            </label>
                            <div>
                                <PasswordInput
                                    id="currentPassword"
                                    name="currentPassword"
                                    required
                                    className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"                           
                                />
                                {changePasswordErrors.currentPassword && (
                                    <p style={{ color: 'red' }} className="py-2">
                                        {changePasswordErrors.currentPassword}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="my-5 space-y-1">
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                            >
                                New Password:* 
                            </label>
                            <div>
                                <PasswordInput
                                    id="newPassword"
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={(e) => onPasswordChange(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                                />
                                <p className="text-sm text-gray-600 mt-2 font-bold">
                                    *Password must include uppercase, lowercase, numbers, and a symbol*
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Strength: {passwordStrength}
                                </p>
                                {changePasswordErrors.newPassword && (
                                    <p style={{ color: 'red' }} className="py-2">
                                        {changePasswordErrors.newPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="my-5 space-y-1">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                            >
                                Confirm New Password:*
                            </label>
                            <div>
                                <PasswordInput
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"                            
                                />
                                {!passwordMatch && (
                                    <p style={{ color: 'red' }}>Passwords do not match</p>
                                )}
                            </div>
                        </div>

                        <div className="text-sm">
                            <Button
                                type="submit"
                                className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-smfocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                Change Password
                            </Button>
                        </div>
                    </form>
                </div>
            </>
        </div>
    );
}