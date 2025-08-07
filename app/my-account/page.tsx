'use server'
import MyAccountClient from "@/components/customer-facing-components/user-account-settings/user-account-client";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { getUserDetails } from "@/actions/user-auth/get-user-details"

interface UserDetails {
	firstName: string;
	lastName: string;
	email: string;
	email_verified: boolean;
}

export default async function MyAccount() {
	const supabase = await createClient();
	const { data: user } = await supabase.auth.getUser();
	if (!user.user) {
		redirect('/log-in');
	}
	const userId = user.user.id;

	const userDetailsData = await getUserDetails();
	if (!userDetailsData) {
		redirect('/log-in');
	}

	const userDetails: UserDetails = {
		firstName: userDetailsData.firstName,
		lastName: userDetailsData.lastName,
		email: userDetailsData.email,
		email_verified: userDetailsData.email_verified,
	};

	return (
		<MyAccountClient 
			userDetailsData={userDetails}

		/>
	)
};

