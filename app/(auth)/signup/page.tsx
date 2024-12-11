import { signup } from "@/actions/signup";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";

const SignupPage = async ({
  searchParams, 
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const errorCode = (await searchParams).error as string;

  return (
    <div>
      <div className="flex h-screen items-center justify-center">
        <div className="container mx-auto w-2/4 hidden lg:block">
          <div className="p-5 px-10 py-10 loginForm">
            <RegisterForm />
            {errorCode && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorCode}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="w-full p-5 px-10 py-10 lg:hidden">
          <RegisterForm />
          {errorCode && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorCode}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

const RegisterForm = () => (
  <div>
    <div className="text-center py-5 mb-5">
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
            name="email"
            type="email"
            required
            autoComplete="email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="firstname"
          className="block text-sm/6 font-bold text-gray-900"
        >
          First Name:*
        </label>
        <div className="mt-2">
          <Input
            name="firstname"
            type="text"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="lastname"
          className="block text-sm/6 font-bold text-gray-900"
        >
          Last Name:*
        </label>
        <div className="mt-2">
          <Input
            id="lastname"
            name="lastname"
            type="text"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
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
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
          />
        </div>
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
          <button
            formAction={signup}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign Up
          </button>
        </div>
      </div>
    </form>
  </div>
);

export default SignupPage;
