"use client";

import { signup } from "@/actions/signup";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import validator from 'validator';  
import ErrorModal from "@/components/modals/error-modal";
import { Button } from "@/components/ui/button";


interface Errors {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  termsAgreement?: string;
}

const SignupPage = () => {
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

	async function handleSignUp (event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const email = formData.get('email') as string;
		const firstName = formData.get('firstName') as string;
  		const lastName = formData.get('lastName') as string;

		const newErrors: Errors = {};

		// Email validation
		if (!validator.isEmail(email)) {
			newErrors.email = 'Invalid email address';
		}

		const sanitizedEmail = validator.normalizeEmail(email);
		const sanitizedFirstname = validator.trim(firstName);
  		const sanitizedLastname = validator.trim(lastName);

		// Validate sanitized names
		if (!sanitizedFirstname) {
			newErrors.firstName = 'First name is required';
		}
		if (!sanitizedLastname) {
			newErrors.lastName = 'Last name is required';
		}
		

		// Password validation
		if (inputPassword.length < 8) {
			newErrors.password = 'Password must be at least 8 characters long';
		} else if (!validator.isStrongPassword(inputPassword)) {
			newErrors.password =
				'Password must include uppercase, lowercase, numbers, and symbols';
		}

		// Checkbox validation
		if (!isTermsAgreed) {
			newErrors.termsAgreement = 'You must agree to the terms of use and privacy policy';
		}

		// Update errors state
		setErrors(newErrors);

		// If no errors, proceed with form submission
		if (Object.keys(newErrors).length === 0) {
			
			// try {
			// 	const response = await fetch('/api/userSignUp', {
			// 		method: 'POST',
			// 		headers: { 'Content-Type': 'application/json' },
			// 		body: JSON.stringify({ email: sanitizedEmail, password: inputPassword, firstName: sanitizedFirstname, lastName: sanitizedLastname }),
			// 	});
			// 	if (!response.ok) {
			// 		const data = await response.json();
			// 		throw new Error(data.error || "Something went wrong.");
			// 	} else {
			// 		router.push("/")
			// 	}
				
			// } catch (error: any) {
			// 	setErrorMessage(error.message)
			// }

			try {
				const signupResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/user-signup`, {
					method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,

                    },
                    body: JSON.stringify({ email: sanitizedEmail, password: inputPassword, firstName: sanitizedFirstname, lastName: sanitizedLastname }),
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
					{/* <ModalBackdrop disableInteraction={false}/> */}
					<ErrorModal
						message={errorMessage}
						onClose={() => setErrorMessage('')}
					/>
				</>
			)}
			<div className="flex h-screen items-center justify-center">
				<div className="container mx-auto w-full p-5 px-10 py-10 lg:w-2/4 lg:block md:w-10/12">
					<RegisterForm 
						onSignup={handleSignUp}
                        errors={errors}
                        inputPassword={inputPassword}
                        inputConfirmPassword={inputConfirmPassword}
                        passwordStrength={passwordStrength}
                        passwordMatch={passwordMatch}
                        setTermsAgreed={setIsTermsAgreed}
                        onPasswordChange={handlePasswordChange}
					/>
				</div>
			</div>
		</>
	);
};

interface RegisterFormProps {
	onSignup: (e: React.FormEvent<HTMLFormElement>) => void;
	errors: Errors;
	inputPassword: string;
	inputConfirmPassword: string;
	passwordStrength: string;
	passwordMatch: boolean;
	onPasswordChange: (password: string) => void;
	setTermsAgreed: (agreed: boolean) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
	onSignup,
    errors,
    inputPassword,
    inputConfirmPassword,
    passwordStrength,
    passwordMatch,
    onPasswordChange,
    setTermsAgreed,
}) => (
	<div>
		<div className="text-center py-5 mb-5">
			<Logo />
		</div>

		<form className="space-y-6" onSubmit={onSignup}>
			<div>
				<label
					htmlFor="email"
					className="block text-sm font-bold text-gray-900"
				>
					Email address:*
				</label>
				<div className="mt-2">
					<Input
						id="email"
						name="email"
						type="email"
						required
						autoComplete="email"
						className="block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
					/>
					{errors.email && (
                        <p style={{ color: 'red' }} className="py-2">
                            {errors.email}
                        </p>
                    )}
				</div>
			</div>

			<div>
				<label
					htmlFor="firstName"
					className="block text-sm/6 font-bold text-gray-900"
				>
					First Name:*
				</label>
				<div className="mt-2">
					<Input
						id="firstName"
						name="firstName"
						type="text"
						required
						className="block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="lastName"
					className="block text-sm/6 font-bold text-gray-900"
				>
					Last Name:*
				</label>
				<div className="mt-2">
					<Input
						id="lastName"
						name="lastName"
						type="text"
						required
						className="block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
					/>
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between">
					<label
						htmlFor="password"
						className="block text-sm/6 font-bold text-gray-900"
					>
						Password:*
					</label>
				</div>
				<div className="mt-2">
					<PasswordInput
						id="password"
						name="password"
						className="block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
						value={inputPassword}
                        onChange={(e) => onPasswordChange(e.target.value)}
					/>
					<p className="text-sm text-gray-600 mt-2 font-bold">
                        *Password must include uppercase, lowercase, numbers, and symbols*
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
				<div className="flex items-center mb-4 gap-2">
					<Input 
						id="termsagreement" 
						type="checkbox" 
						value="" 
						className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
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
				<p className="text-center text-sm/6 text-gray-500">
					Already have an account?{" "}
					<Link
						href="/log-in"
						className="font-semibold text-indigo-600 hover:text-indigo-500"
					>
						Sign In
					</Link>{" "}
					here
				</p>
				<div className="text-sm">
					<Button
						type="submit"
						className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Sign Up
					</Button>
				</div>
			</div>
		</form>
	</div>
);

export default SignupPage;
