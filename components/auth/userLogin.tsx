'use client';

import { Logo } from "@/components/ui/logo";
import { Input } from "../ui/input";
import Link from "next/link";
import { PasswordInput } from "../ui/password-input";
import { Button } from "../ui/button";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from "react-dom";

interface UserLoginProps {
    serverUserIdentifier: string;
    isAnonymous: boolean;
}

const UserLogin: React.FC<UserLoginProps>=({ serverUserIdentifier, isAnonymous }) => {

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                type="submit"
                className="flex w-full justify-center px-3 py-1 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline"
                disabled={pending}
            >
                {pending ? "Signing In..." : "Sign in"}
            </Button>
        );
    }

    let path;
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');

    if (!redirectPath) {
        path = "/";
    } else {
        path = redirectPath;
    }

    console.log("The redirect string is: ", redirectPath)
    console.log("The userId: ", serverUserIdentifier, " and isAnonymous: ", isAnonymous, " and redirectPath: ", redirectPath);
    return (
        <div>
            <div className="text-center">
                <Logo />
            </div>

            <form className="space-y-6">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm/6 font-bold text-gray-900"
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
                            className="block w-full border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 "
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
                        <div className="text-sm">
                            <Link
                                href="/password-reset"
                                className="font-semibold text-black hover:text-gray-500"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                    <div className="mt-2">
                        <PasswordInput
                            id="password"
                            name="password"
                            required      
                            autoComplete="current-password"
                            className="block w-full border-2 rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Use hidden inputs to pass the other data to the action */}
                <input type="hidden" name="redirectPath" value={path} />
                <input type="hidden" name="serverUserIdentifier" value={serverUserIdentifier} />
                <input type="hidden" name="isAnonymous" value={isAnonymous.toString()} />
                {/* Use hidden inputs to pass the other data to the action */}

                <div className="flex items-center justify-between">
                    <p className="text-center text-sm/6 text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link
                            href={'/signup'}
                            className="font-semibold text-black hover:text-gray-500"
                        >
                            Sign Up
                        </Link>{" "}
                        here
                    </p>
                    <div className="text-sm">
                        <SubmitButton />
                    </div>
                </div>
            </form>
            <div className="flex flex-col gap-3 my-10">
                <Button className="flex items-center justify-center w-full py-2 px-4 bg-white text-gray-700 border-2 rounded-md shadow-sm hover:bg-gray-100">
                    <FcGoogle className="text-xl mr-2" />
                    Sign in with Google
                </Button>
                <Button className="flex items-center justify-center w-full py-2 px-4 bg-black text-white border-2 rounded-md shadow-sm hover:bg-gray-800">
                    <FaApple className="text-xl mr-2" />
                    Sign in with Apple
                </Button>
            </div>
        </div>
    )

} 

export default UserLogin;