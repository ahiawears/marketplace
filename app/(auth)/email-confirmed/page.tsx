'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { EmailOtpType } from '@supabase/supabase-js';


export default function ConfirmPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');


	useEffect(() => {

		const tokenHash = searchParams.get('token_hash');
		const type = searchParams.get('type') as EmailOtpType;
		const next = searchParams.get('next');

		if (!tokenHash || !type) {
			setConfirmationStatus('error');
			return;
		}

		const confirmEmail = async () => {
			try {
				const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNNCTION_URL}/check-email-confirmed`, { // Adjust the path if needed
					method: 'POST', // Use POST method
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ token_hash: tokenHash, type: type }),
				});
	  
				if (!confirmResponse.ok) {
					throw new Error(`HTTP error! status: ${confirmResponse.status}`);
				}
	  
			  	const data = await confirmResponse.json();
	  
				if (data.success) {
					setConfirmationStatus('success');
					if (next) {
						router.push(next);
					} else {
						router.push('/'); // Default redirect
					}
				} else {
					setConfirmationStatus('error');
				}
			} catch (error) {
			  console.error('Email confirmation error:', error);
			  setConfirmationStatus('error');
			}
		};
		confirmEmail();
	}, [router, searchParams]);

	let message;
	if (confirmationStatus === 'success') {
		message = 'Email confirmed successfully!';
	} else if (confirmationStatus === 'error') {
		message = 'Email confirmation failed. Please try again.';
	} else {
		message = 'Please wait while we verify your account.';
	}

	return (
		<div className='flex h-screen items-center justify-center'>
			<div className='container mx-auto w-full p-5 px-10 py-10 lg:w-2/4 lg:block md:w-10/12'>
				<div className="text-center py-5 mb-5">
					<Logo />
				</div>
				<h1 className='text-center pb-10 font-bold block'>Confirming your email...</h1>
        		<p className='text-center'>{message}</p>
			</div>
		</div>
	);
}