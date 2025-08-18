import { getServerAnonymousId } from '@/lib/anon_user/server';
import UserSignup from "@/components/auth/userSignup";
import { createClient } from "@/supabase/server";

export default async function SignupPage() {
	const supabase = await createClient();
	const { data: user } = await supabase.auth.getUser();
	const userId = user.user?.id;
	const userIdentifier = userId || await getServerAnonymousId();
	const isAnonymous = !userId;
 
	return (
		<div className="flex w-full h-screen items-center justify-center mx-auto lg:w-1/2">
			<div className="container w-full">
				<div>
					<UserSignup  
						serverUserIdentifier={userIdentifier}
						isAnonymous={isAnonymous}
					/>
				</div>
			</div>
		</div>
	);
};
