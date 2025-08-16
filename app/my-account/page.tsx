'use server'
import MyAccountClient from "@/components/customer-facing-components/user-account-settings/my-account-comps/user-account-client";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { getUserDetails } from "@/actions/user-auth/get-user-details"
import { getUserAddress } from "@/actions/user-actions/my-account/get-user-address";
import { getDbPaymentDetails } from "@/actions/user-actions/my-account/getDbPaymentDetails";

interface UserDetails {
	firstName: string;
	lastName: string;
	email: string;
	email_verified: boolean;
}

interface DbPaymentDetails {
	id: string;
	expiry_month: number;
	expiry_year: number;
	card_brand: string;
	last_four: string;
	flutterwave_id: string;
	is_default: boolean;
	card_holder: string;
}

export default async function MyAccount() {
	const supabase = await createClient();
	const { data: user } = await supabase.auth.getUser();
	if (!user.user) {
		redirect('/log-in');
	}

	const userDetailsData = await getUserDetails();
	if (!userDetailsData) {
		redirect('/log-in');
	}
	const userAddressData = await getUserAddress();


	const userDetails: UserDetails = {
		firstName: userDetailsData.firstName,
		lastName: userDetailsData.lastName,
		email: userDetailsData.email,
		email_verified: userDetailsData.email_verified,
	};

	const dbPaymentDetails = await getDbPaymentDetails();

	const partialPaymentDetails = dbPaymentDetails.map((ppD: DbPaymentDetails) => ppD);
	return (
		<MyAccountClient 
			userDetailsData={userDetails}
			userAddressData={userAddressData}
			dbPaymentMethods={partialPaymentDetails}
		/>
	)
};

