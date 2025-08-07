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
					/>
				</div>
			</div>
		</div>
	);
};

// const LoginForm = () => (
//   <div>
//     <div className="text-center py-5 mb-5">
//       <Logo />
//     </div>

//     <form className="space-y-6">
//       <div>
//         <label
//           htmlFor="email"
//           className="block text-sm/6 font-bold text-gray-900"
//         >
//           Email address:*
//         </label>
//         <div className="mt-2">
//           <Input
//             id="email"
//             name="email"
//             type="email"
//             required
//             autoComplete="email"
//             className="block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
//           />
//         </div>
//       </div>

//       <div>
//         <div className="flex items-center justify-between">
//           <label
//             htmlFor="password"
//             className="block text-sm/6 font-bold text-gray-900"
//           >
//             Password:*
//           </label>
//           <div className="text-sm">
//             <Link
//               href="/password-reset"
//               className="font-semibold text-indigo-600 hover:text-indigo-500"
//             >
//               Forgot password?
//             </Link>
//           </div>
//         </div>
//         <div className="mt-2">
//           <PasswordInput
//             id="password"
//             name="password"
//             required      
//             autoComplete="current-password"
//             className="block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
//           />
//         </div>
//       </div>

//       <div className="flex items-center justify-between">
//         <p className="text-center text-sm/6 text-gray-500">
//           Don&apos;t have an account?{" "}
//           <Link
//             href={'/signup'}
//             className="font-semibold text-indigo-600 hover:text-indigo-500"
//           >
//             Sign Up
//           </Link>{" "}
//           here
//         </p>
//         <div className="text-sm">
//           <button
//             formAction={login}
//             type="submit"
//             className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//           >
//             Sign in
//           </button>
//         </div>
//       </div>
//     </form>

//     <div className="flex flex-col gap-3 my-10">
//       <button className="flex items-center justify-center w-full py-2 px-4 bg-white text-gray-700 border rounded-md shadow-sm hover:bg-gray-100">
//         <FcGoogle className="text-xl mr-2" />
//         Sign in with Google
//       </button>
//       <button className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
//         <FaFacebook className="text-xl mr-2" />
//         Sign in with Facebook
//       </button>
//       <button className="flex items-center justify-center w-full py-2 px-4 bg-black text-white rounded-md shadow-sm hover:bg-gray-800">
//         <FaApple className="text-xl mr-2" />
//         Sign in with Apple
//       </button>
//     </div>
//   </div>
// );

