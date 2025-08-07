'use client';

import { useSearchParams } from "next/navigation";
import { Logo } from "../ui/logo";
import { Input } from "../ui/input";
import Link from "next/link";
import { PasswordInput } from "../ui/password-input";
import { Button } from "../ui/button";
import { FormEvent, useState } from "react";
import validator from 'validator';  
import { signUpUser } from "@/actions/user-auth/user-signup";

// The Server Action you'll call on success
// import { signupUser } from '@/app/actions/userAuthActions'; 
// import { experimental_useFormStatus as useFormStatus } from 'react-dom';

interface UserSignupProps {
    serverUserIdentifier: string;
    isAnonymous: boolean;
}

interface Errors {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    confirmPassword?: string; // Add a confirm password error
    termsAgreement?: string;
}

const UserSignup: React.FC<UserSignupProps>=({ serverUserIdentifier, isAnonymous }) => {
    let path;
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');

    if (!redirectPath) {
        path = "/";
    } else {
        path = redirectPath;
    }

    console.log("The redirect string is: ", path);
    console.log("The userId: ", serverUserIdentifier, " and isAnonymous: ", isAnonymous, " and redirectPath: ", path);

    const [errors, setErrors] = useState<Errors>({});
    const [passwordStrength, setPasswordStrength] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputConfirmPassword, setInputConfirmPassword] = useState(''); // New state for confirm password
    const [isTermsAgreed, setTermsAgreed] = useState(false);
    
    // Validate password strength in a helper function
    const validatePasswordStrength = (password: string): string => {
        if (!password) return '';
        if (password.length < 8) return 'Too short';
        if (validator.isStrongPassword(password, { minSymbols: 1, minLowercase: 1, minUppercase: 1, minNumbers: 1 })) {
            return 'Strong';
        }
        return 'Weak';
    };

    // This function handles all client-side validation logic
    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Stop the default form submission

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Get the values from the form data
        const email = formData.get('email') as string;
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string; // Get confirm password value

        // Initialize a new errors object
        const newErrors: Errors = {};

        // Perform validation checks
        if (!validator.isEmail(email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!firstName) {
            newErrors.firstName = "First name is required.";
        }
        if (!lastName) {
            newErrors.lastName = "Last name is required.";
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

        // Set the errors state with the new validation results
        setErrors(newErrors);
        
        // If there are no errors, proceed with the submission (e.g., call a Server Action)
        if (Object.keys(newErrors).length === 0) {
            console.log("Form is valid. Submitting data...");
            // Call your server action here with formData
            // For example: signupUser(formData);
            signUpUser(formData)
        }
    };
    
    return (
        <div className="max-h-screen mx-6">
            <div className="text-center">
                <Logo />
            </div>
        
            {/* The onSubmit handler now points to our validation function */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-900">
                        Email address:*
                    </label>
                    <div className="my-1">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className="block w-full border-2 py-1.5 text-gray-900 sm:text-sm"
                        />
                        {errors.email && (
                            <p className="py-1 text-red-500 text-sm/6">
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>
    
                <div>
                    <label htmlFor="firstName" className="block text-sm/6 font-bold text-gray-900">
                        First Name:*
                    </label>
                    <div className="my-1">
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            className="block w-full border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                        />
                        {errors.firstName && (
                            <p className="py-1 text-red-500 text-sm/6">
                                {errors.firstName}
                            </p>
                        )}
                    </div>
                </div>
    
                <div>
                    <label htmlFor="lastName" className="block text-sm/6 font-bold text-gray-900">
                        Last Name:*
                    </label>
                    <div className="my-1">
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            className="block w-full border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
                        />
                        {errors.lastName && (
                            <p className="py-1 text-red-500 text-sm/6">
                                {errors.lastName}
                            </p>
                        )}
                    </div>
                </div>
    
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm/6 font-bold text-gray-900">
                            Password:*
                        </label>
                    </div>
                    <div className="my-1">
                        <PasswordInput
                            id="password"
                            name="password"
                            className="block w-full border-2 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm/6"
                            value={inputPassword}
                            onChange={(e) => {
                                setInputPassword(e.target.value);
                                setPasswordStrength(validatePasswordStrength(e.target.value));
                            }}
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
                        {errors.password && (
                            <p className="py-1 text-red-500 text-sm/6">
                                {errors.password}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* New: Confirm Password field */}
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="confirmPassword" className="block text-sm/6 font-bold text-gray-900">
                            Confirm Password:*
                        </label>
                    </div>
                    <div className="my-1">
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            className="block w-full border-2 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm/6"
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
                            className="w-4 h-4 accent-black border-2 cursor-pointer"
                            onChange={(e) => setTermsAgreed(e.target.checked)}
                            checked={isTermsAgreed} // Controlled input
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
                        <p className="py-2 text-red-500 text-sm/6">
                            {errors.termsAgreement}
                        </p>
                    )}
    
                </div>

                {/* Use hidden inputs to pass the other data to the action */}
                <input type="hidden" name="redirectPath" value={path} />
                <input type="hidden" name="serverUserIdentifier" value={serverUserIdentifier} />
                <input type="hidden" name="isAnonymous" value={isAnonymous.toString()} />
                {/* Use hidden inputs to pass the other data to the action */}
    
                <div className="flex items-center justify-between">
                    <p className="text-center text-sm/6 text-gray-500">
                        Already have an account?{" "}
                        <Link
                            href="/log-in"
                            className="font-semibold text-black hover:text-gray-500"
                        >
                            Sign In
                        </Link>{" "}
                        here
                    </p>
                    <div className="text-sm">
                        <Button
                            type="submit"
                            className="flex w-full justify-center px-3 py-1.5 font-semibold text-white shadow-sm"
                        >
                            Sign Up
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default UserSignup;