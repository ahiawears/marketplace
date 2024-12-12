import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input';
import { UserDetails } from '@/lib/types';
import { Button } from '../ui/button';

const Userdetails = () => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');

	useEffect(() => {
		const fetchUserDetails = async () => {
			try {
				const response = await fetch('/api/getUserDetails');
				const data = await response.json();

				if (response.ok && data.data) {
					setFirstName(data.data.first_name || '');
					setLastName(data.data.last_name || '');
					setEmail(data.data.email || '');
				} else {
					console.error("Failed to fetch user details:", data.error);
				}
			} catch (error) {
				console.error("Error fetching user details:", error);
			}
		};
		fetchUserDetails();
	}, []);
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
					className="lucide lucide-book-user mx-auto"
				>
					<path d="M15 13a3 3 0 1 0-6 0" />
					<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
					<circle cx="12" cy="8" r="2" />
				</svg>
				{/* Title */}
				<p className="mt-4 text-lg font-semibold">My Details</p>
			</div>

			<form className="space-y-6">
				<div>
					<label
						htmlFor="firstname"
						className="block text-sm font-bold text-gray-900 mb-1 w-fit"
					>
						First Name:*
					</label>
					<div>
						<Input
							id="firstname"
							name="firstname"
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
							className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="lastname"
						className="block text-sm font-bold text-gray-900 mb-1 w-fit"
					>
						Last Name:*
					</label>
					<div>
						<Input
							id="lastname"
							name="lastname"
							type="text"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
							className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-bold text-gray-900 mb-1 w-fit"
					>
						Email Address:*
					</label>
					<div>
						<Input
							id="email"
							name="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
						/>
					</div>
				</div>

				<div className="text-sm">
					<Button
						// formAction={signup}
						className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Update Fields
					</Button>
				</div>

				{/* Add more form fields here as needed */}
			</form>
		</div>
	)
}

export default Userdetails
