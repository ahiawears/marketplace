import UserLogin from '@/components/auth/userLogin'
import { createClient } from '@/supabase/server';
import { getServerAnonymousId } from '@/lib/anon_user/server';

export default async function LoginPage(){
	const supabase = await createClient();
	const { data: user } = await supabase.auth.getUser();
	const userId = user.user?.id;
	const userIdentifier = userId || await getServerAnonymousId();
	const isAnonymous = !userId;

	return (
		<div className="flex w-full h-screen items-center justify-center mx-auto lg:w-1/2">
			<div className="container w-full">
				<div>
					<UserLogin 
						serverUserIdentifier={userIdentifier}
						isAnonymous={isAnonymous}
					/>. 
				</div>
			</div>
		</div>
	);
};

