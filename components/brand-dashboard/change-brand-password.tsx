import { Button } from "../ui/button";
import { PasswordInput } from "../ui/password-input";
import validator from 'validator';
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { UpdatePassword } from "@/actions/auth/update-password";

interface Errors {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string; 
}

const ChangeBrandPassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    
    const [statusMessage, setStatusMessage] = useState("");
    const [errors, setErrors] = useState<Errors>({});

    const validatePasswordStrength = (password: string): string => {
        if (!password) return '';
        if (password.length < 8) return 'Too short';
        if (validator.isStrongPassword(password, { minSymbols: 1, minLowercase: 1, minUppercase: 1, minNumbers: 1 })) {
            return 'Strong';
        }
        return 'Weak';
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage("Updating password...");
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);
        //get the values fromm form data
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const newErrors: Errors = {};


        if (!newPassword || validatePasswordStrength(newPassword) !== 'Strong') {
            newErrors.newPassword = "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.";
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        try {
            const result = await UpdatePassword(formData, "brand");

            if (result.success) {
                toast.success("Password has been updated");
                setStatusMessage(result.message || "Password has been updated");
                // Reset fields on success
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(result.message || "An error occurred.");
                setStatusMessage(result.message || "An error occurred.");
            }
        } catch (error) {
            toast.error("Failed to change password. Please try again.");
            setStatusMessage("Failed to change password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="mx-auto py-10 sm:py-10 shadow-2xl border-2">
            <div className="mx-auto max-7xl px-6 lg:px-8">
                <div className="text-center">
                    {/* SVG Icon */}
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="30" 
                        height="30"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="lucide lucide-lock mx-auto"
                    >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    {/* Title */}
                    <p className="mt-4 text-lg font-semibold">Change Password</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                        >
                            Current Password:*
                        </label>
                        <div className="my-1">
                            <PasswordInput
                                id="currentPassword"
                                name="currentPassword"
                                autoComplete="off"
                                value={currentPassword}
                                onChange={(e) => { 
                                    setCurrentPassword(e.target.value);
                                }}
                                className="block w-full border-2 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm/6 "
                            />
                            {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword[0]}</p>}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                        >
                            New Password:* 
                        </label>
                        <div className="my-1">
                            <PasswordInput
                                id="newPassword"
                                name="newPassword"
                                autoComplete="off"
                                value={newPassword}
                                onChange={(e) => { 
                                    setNewPassword(e.target.value);
                                    setPasswordStrength(validatePasswordStrength(e.target.value));
                                }}
                                className="block w-full border-2 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm/6 "
                            />
                            <p className="text-sm text-gray-600 my-1 font-bold">
                                *Password must include uppercase, lowercase, numbers, and symbols*
                            </p>
                                <p className="text-sm text-gray-600 my-1">
                                Strength: <span className={
                                    passwordStrength === 'Strong' ? 'text-green-500 font-bold' :
                                    passwordStrength === 'Weak' ? 'text-yellow-500 font-bold' :
                                    'text-gray-600'
                                }>{passwordStrength}</span>
                            </p>
                            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword[0]}</p>}
                        </div>
                    </div>

                    <div>
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
                                autoComplete="off"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full border-2 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm/6 "
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword[0]}</p>}
                        </div>
                    </div>

                    <div className="text-sm">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                            className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            {isSubmitting ? 'Changing Password...' : 'Change Password'}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default ChangeBrandPassword;