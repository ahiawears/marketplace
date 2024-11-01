"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNewPassword } from "@/actions/create-new-password";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

const NewPassword = () => {
	const router = useRouter();
	
	return (
		<div>
			<div className="flex h-screen items-center justify-center">
				<div className="container mx-auto w-2/4 hidden lg:block">
					<div className="p-5 px-10 py-10 loginForm"> 
						<NewPasswordForm />
					</div>
				</div>
				<div className="w-full p-5 px-10 py-10 lg:hidden">
					<NewPasswordForm />
				</div>
			</div>
		</div>
	)
};

const NewPasswordForm = () => ( 
	<div>
		<div className="text-center py-5 mb-5">
			<Logo />
		</div>

        <div className="text-center py-5 mb-5">
            <p className="text-center text-md/6 text-gray-500">
                Enter your new password
			</p>
		</div>

		<form className="space-y-6">
            <div>
				<label htmlFor="newPassword" className="block text-sm/6 font-bold text-gray-900">
					Enter New Password:*
				</label> 
				<div className="mt-2">
					<Input
						id="newPassword"
						name="newPassword"
						type="password"
						required
						autoComplete="current-password"
						className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
					/>
				</div>
			</div>

            <div>
				<label htmlFor="validateNewPassword" className="block text-sm/6 font-bold text-gray-900">
					Confirm New Password:*
				</label> 
				<div className="mt-2">
					<Input
						id="validateNewPassword"
						name="validateNewPassword"
						type="password"
						required
						autoComplete="current-password"
						className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
					/>
				</div>
			</div>			

			<div className="flex items-center justify-between">
				
				<div className="text-sm">
					<button
						formAction={createNewPassword}
						className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Reset Password
					</button>
				</div>
			</div>
		</form>

	</div>
);

export default NewPassword;