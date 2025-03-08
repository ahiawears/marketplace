import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";

const ChangeBrandPassword = () => {
    return (
        <div className="mx-auto py-10 sm:py-10 shadow-2xl">
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
                <form className="space-y-6">
                    <div>
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
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"                            />
                        </div>
                    </div>

                    <div>
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
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"
                            />
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
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm"                            />
                        </div>
                    </div>

                    <div className="text-sm">
                        <Button
                            // formAction={UpdatePassword}
                            type='submit'
                            className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-smfocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            Change Password
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default ChangeBrandPassword;