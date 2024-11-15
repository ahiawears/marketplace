import React from 'react'
import { Input } from '../ui/input'
import { UpdatePassword } from '@/actions/update-password'

const ChangePassword = () => {
    return (
        <div className='p-4'>
            <div className="text-center py-5 mb-5">
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
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                        />
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
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                        />
                    </div>
                </div>

                <div className="text-sm">
                    <button
                        // formAction={UpdatePassword}
                        type='submit'
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Change Password
                    </button>
                </div>

                {/* Add more form fields here as needed */}
            </form>
		</div>
    )
}

export default ChangePassword