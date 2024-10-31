import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

const LoginPage = () => {
	return (
		<div>
			<div className="flex h-screen items-center justify-center">
				<div className="container mx-auto w-2/4 hidden lg:block">
					<div className="p-5 px-10 py-10 loginForm"> 
						<LoginForm />
					</div>
				</div>
				<div className="w-full p-5 px-10 py-10 lg:hidden">
					<LoginForm />
				</div>
			</div>
		</div>
	)
};

const LoginForm = () => ( 
	<div>
		<div className="text-center py-5 mb-5">
			<Logo />
		</div> 
		<form action="#" method="POST" className="space-y-6">
			<div>
				<label htmlFor="email" className="block text-sm/6 font-bold text-gray-900">
					Email address:*
				</label> 
				<div className="mt-2">
					<Input
						id="email"
						name="email"
						type="email"
						required
						autoComplete="email"
						className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
					/>
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between">
					<label htmlFor="password" className="block text-sm/6 font-bold text-gray-900">
						Password:*
					</label>
					<div className="text-sm">
						<a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
							Forgot password?
						</a>
					</div>
				</div>
				<div className="mt-2">
					<Input
						id="password"
						name="password"
						type="password"
						required
						autoComplete="current-password"
						className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
					/>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<p className="text-center text-sm/6 text-gray-500">
					Don't have an account?{' '}
					<a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
						Sign Up 
					</a>
					{' '} here
				</p>
				<div className="text-sm">
					<button
						type="submit"
						className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Sign in
					</button>
				</div>
			</div>
		</form>
	</div>
);

export default LoginPage;
