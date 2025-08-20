'use client';

import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Logo } from "../ui/logo";
import { PasswordInput } from "../ui/password-input";
import validator from 'validator';
import { Button } from "../ui/button";
import Link from "next/link";
import { SignUpbrand } from "@/actions/auth/brand-auth/brand-signup";
import { toast } from "sonner";

interface Errors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    termsAgreement?: string;
}

const BrandSignup = () => {
    const [errors, setErrors] = useState<Errors>({});
    const [passwordStrength, setPasswordStrength] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputConfirmPassword, setInputConfirmPassword] = useState('');
    const [isTermsAgreed, setTermsAgreed] = useState(false);

    const validatePasswordStrength = (password: string): string => {
        if (!password) return '';
        if (password.length < 8) return 'Too short';
        if (validator.isStrongPassword(password, { minSymbols: 1, minLowercase: 1, minUppercase: 1, minNumbers: 1 })) {
            return 'Strong';
        }
        return 'Weak';
    };

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        const newErrors: Errors = {};

        if (!validator.isEmail(email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!password || validatePasswordStrength(password) !== 'Strong') {
            newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.";
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        if (!isTermsAgreed) {
            newErrors.termsAgreement = "You must agree to the terms of use and privacy policy.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            const result = await SignUpbrand(formData);
            if(!result.success) {
                toast.error('Sign up failed', {
                    description: result.message,
                    position: 'top-right',
                    duration: 5000,
                })
            }
        }
    }


    return (
        <div className="max-h-screen">
             <div className="text-center">
                <Logo />
            </div>

            <form className="space-y-6" onSubmit={handleFormSubmit}>
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
                            onChange={(e) => {
                                setInputPassword(e.target.value)
                                setPasswordStrength(validatePasswordStrength(e.target.value));
                            }}
                        />
                        <p className="text-sm text-gray-600 mt-2 font-bold">
                            *Password must include uppercase, lowercase, numbers, and a symbol*
                        </p>
                        <p className="text-sm text-gray-600 my-1">
                            Strength: <span className={
                                passwordStrength === 'Strong' ? 'text-green-500 font-bold' :
                                passwordStrength === 'Weak' ? 'text-yellow-500 font-bold' :
                                'text-gray-600'
                            }>{passwordStrength}</span>
                        </p>
                        {errors.password && (
                            <p style={{ color: 'red' }} className="py-2">
                                {errors.password}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900">
                        Confirm Password: *
                    </label>
                    <div className="mt-2">
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                            value={inputConfirmPassword}
                            onChange={(e) => setInputConfirmPassword(e.target.value)}
                        />
                        {errors.confirmPassword && (
                            <p className="py-1 text-red-500 text-sm/6">
                                {errors.confirmPassword}
                            </p>
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
                                className='font-semibold text-black hover:text-gray-500'
                            >
                                Terms of Use
                            </a>{' '} and {' '}
                            <a
                                href='#'
                                className='font-semibold text-black hover:text-gray-500'
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
                        <Link 
                            href="/login-brand" 
                            className="font-semibold text-black hover:text-gray-500"
                        >
                            Sign In
                        </Link>{' '}
                        here
                    </p>
                    <div className="text-sm">
                        <Button
                            type="submit"
                            className="flex w-full justify-center px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
                        >
                            Sign Up
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default BrandSignup;