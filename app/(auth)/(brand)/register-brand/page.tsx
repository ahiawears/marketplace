'use client';

import ErrorModal from '@/components/modals/error-modal';
import ModalBackdrop from '@/components/modals/modal-backdrop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { PasswordInput } from '@/components/ui/password-input';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import validator from 'validator';

interface Errors {
    email?: string;
    password?: string;
    confirm_password?: string;
    termsAgreement?: string;
}

const RegisterBrand = () => {
    const [errors, setErrors] = useState<Errors>({});
    const [passwordStrength, setPasswordStrength] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [inputPassword, setInputPassword] = useState('');
    const [inputConfirmPassword, setInputConfirmPassword] = useState('');
    const [isTermsAgreed, setIsTermsAgreed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const router = useRouter();

    const validatePasswordStrength = (password: string) => {
        if (!password) return '';
        if (password.length < 8) return 'Too short';
        if (validator.isStrongPassword(password, { minSymbols: 1 })) return 'Strong';
        return 'Weak';
    };

    const handlePasswordChange = (password: string) => {
        setInputPassword(password);
        setPasswordStrength(validatePasswordStrength(password));
        setPasswordMatch(password === inputConfirmPassword);
    };

    const handleConfirmPasswordChange = (confirmPassword: string) => {
        setInputConfirmPassword(confirmPassword);
        setPasswordMatch(confirmPassword === inputPassword);
    };

    async function handleSignUp (event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;

        const newErrors: Errors = {};

        // Email validation
        if (!validator.isEmail(email)) {
            newErrors.email = 'Invalid email address';
        }

        // Password validation
        if (inputPassword.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        } else if (!validator.isStrongPassword(inputPassword)) {
            newErrors.password = 'Password must include uppercase, lowercase, numbers, and symbols';
        }

        // Confirm password validation
        if (inputPassword !== inputConfirmPassword) {
            newErrors.confirm_password = 'Passwords do not match';
        }

         // Checkbox validation
        if (!isTermsAgreed) {
            newErrors.termsAgreement = 'You must agree to the terms of use and privacy policy';
        }

        // Update errors state
        setErrors(newErrors);
 
        // If no errors, proceed with form submission
        if (Object.keys(newErrors).length === 0) {
            const sanitizedEmail = validator.normalizeEmail(email);
            try {
                const signupResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/brand-signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,

                    },
                    body: JSON.stringify({ email: sanitizedEmail, password: inputPassword}),
                });
                const signupData = await signupResponse.json();
                if (!signupResponse.ok) {
                    console.error('Signup failed:', signupData);
                    setErrorMessage(`${signupData.message}` || 'Something went wrong.');
                    return;
                } 

                if (signupResponse.ok) {
                    router.push('/check-email')
                }
            } catch (error) {
                let signupError;
                if (error instanceof Error) {
                    signupError = error.message;
                }
                console.error('Signup error:', error);
                setErrorMessage( `${signupError}` || 'An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <>
            {errorMessage && (
                <>
                    <ErrorModal
                        message={errorMessage}
                        onClose={() => setErrorMessage('')}
                    />
                </>
            )}
            <div className="flex h-full items-center justify-center">
                <div className="container mx-auto w-full p-5 px-10 py-10 lg:w-2/4 lg:block md:w-10/12">
                    <RegisterBrandForm
                        onSignup={handleSignUp}
                        errors={errors}
                        inputPassword={inputPassword}
                        inputConfirmPassword={inputConfirmPassword}
                        passwordStrength={passwordStrength}
                        passwordMatch={passwordMatch}
                        setTermsAgreed={setIsTermsAgreed}
                        onPasswordChange={handlePasswordChange}
                        onConfirmPasswordChange={handleConfirmPasswordChange}
                    />
                </div>
            </div>
        </>
    );
};

interface RegisterBrandFormProps {
    onSignup: (e: React.FormEvent<HTMLFormElement>) => void;
    errors: Errors;
    inputPassword: string;
    inputConfirmPassword: string;
    passwordStrength: string;
    passwordMatch: boolean;
    onPasswordChange: (password: string) => void;
    setTermsAgreed: (agreed: boolean) => void;
    onConfirmPasswordChange: (confirmPassword: string) => void;
}

const RegisterBrandForm: React.FC<RegisterBrandFormProps> = ({
    onSignup,
    errors,
    inputPassword,
    inputConfirmPassword,
    passwordStrength,
    passwordMatch,
    onPasswordChange,
    setTermsAgreed,
    onConfirmPasswordChange,
}) => (
    <div>
        <div className="text-center py-5 mb-5">
            <Logo />
        </div>

        <form className="space-y-6" onSubmit={onSignup}>
            <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900">
                    Brand Email Address: *
                </label>
                <div className="mt-2">
                    <Input
                        id="email"
                        name="email"
                        autoComplete="email"
                        className="w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                    />
                    {errors.email && (
                        <p style={{ color: 'red' }} className="py-2">
                            {errors.email}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                    Password: *
                </label>
                <div className="mt-2">
                    <PasswordInput
                        id="password"
                        name="password"
                        className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                        value={inputPassword}
                        onChange={(e) => onPasswordChange(e.target.value)}
                    />
                    <p className="text-sm text-gray-600 mt-2 font-bold">
                        *Password must include uppercase, lowercase, numbers, and a symbol*
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Strength: {passwordStrength}
                    </p>
                    {errors.password && (
                        <p style={{ color: 'red' }} className="py-2">
                            {errors.password}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="confirm_password" className="block text-sm font-bold text-gray-900">
                    Confirm Password: *
                </label>
                <div className="mt-2">
                    <PasswordInput
                        id="confirm_password"
                        name="confirm_password"
                        className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                        value={inputConfirmPassword}
                        onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    />
                    {!passwordMatch && (
                        <p style={{ color: 'red' }}>Passwords do not match</p>
                    )}
                </div>
            </div>

            <div>

                <div className="flex items-center mb-4 gap-2">
                    <Input 
                        id="termsagreement" 
                        type="checkbox" 
                        value="" 
                        className="w-4 h-4 border-gray-300 rounded accent-indigo-600"
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        Yes! I agree to {' '}
                        <a
                            href='#'
                            className='font-semibold text-indigo-600 hover:text-indigo-500'
                        >
                            Terms of Use
                        </a>{' '} and {' '}
                        <a
                            href='#'
                            className='font-semibold text-indigo-600 hover:text-indigo-500'
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>
                {errors.termsAgreement && (
                    <p style={{ color: 'red' }} className="py-2">
                        {errors.termsAgreement}
                    </p>
                )}

            </div>

            <div className="flex items-center justify-between">
                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Sign In
                    </a>{' '}
                    here
                </p>
                <div className="text-sm">
                    <Button
                        type="submit"
                        className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
                    >
                        Sign Up
                    </Button>
                </div>
            </div>
        </form>
    </div>
);

export default RegisterBrand;
