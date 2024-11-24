import { brandLogin } from "@/actions/brand-login";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { PasswordInput } from "@/components/ui/password-input";

const LoginBrand = () => {
    return (
        <div>
            <div className="flex h-screen items-center justfity-center">
                <div className="container mx-auto w-2/4 hidden lg:block">
                    <div className="p-5 px-10 py-10">
                        <BrandLoginForm />
                    </div>
                </div>
                <div className="w-full p-5 px-10 py-10 lg:hidden">
                    <BrandLoginForm />
                </div>
            </div>
        </div>
    )
};

const BrandLoginForm = () => (
    <div>
        <div className="text-center py-5 mb-5">
            <Logo />
        </div>

        <form className="space-y-6">
            <div>
                <label 
                    htmlFor="brandEmail"
                    className="block text-sm/6 font-bold text-gray-900"    
                >
                    Brand Email Address:*
                </label>
                <div className="mt-2">
                    <Input 
                        name="brandEmail"
                        type="email"
                        required
                        autoComplete="email"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
                    />
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between">
                    <label 
                        htmlFor="brandPassword"
                        className="block text-sm/6 font-bold text-gray-900"
                    >
                        Password:*
                    </label>
                    <div className="text-sm">
                        <a
                            href="#"
                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            Forgot Password?
                        </a>
                    </div>
                </div>
                <div className="mt-2">
                    <PasswordInput
                        name="brandPassword"
                        required
                        autoComplete="current-password"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
                    />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-center text-sm/6 text-gray-500">
                    Don&apos;t have an account?{" "}
                    <a
                        href="#"
                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                        Sign Up
                    </a>{" "}
                         your Brand here
                </p>
                <div className="text-sm">
                    <button
                        formAction={brandLogin}
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </form>
    </div>
);

export default LoginBrand