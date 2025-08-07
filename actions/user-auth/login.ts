'use server';

email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	redirectPath: z.string().optional(),
	isAnonymous: z.boolean().default(false),import { redirect } from 'next/navigation';
import { z } from 'zod'; 

// Define a schema for form data validation
const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	redirectPath: z.string().optional(),
	isAnonymous: z.boolean().default(false),
});

export async function loginUser(formData: FormData) {
	const supabase = await createClient();
	const email = formData.get('email');
	const password = formData.get('password');
	const redirectPath = formData.get('redirectPath');

	// Gotten from the hidden input
	const serverUserIdentifier = formData.get('serverUserIdentifier');
	const isAnonymousString = formData.get('isAnonymous');
	const isAnonymous = isAnonymousString === 'true'; // Convert string to boolean

	// Validate the data using Zod
	const validation = loginSchema.safeParse({
		email,
		password,
		redirectPath,
		isAnonymous,
	});

	if (!validation.success) {
		const errors = validation.error.formErrors.fieldErrors;
		console.error('Validation errors:', errors);
		return { success: false, error: 'Validation failed.' };
	}

	// If validation passes, destructure the validated data
	const { data } = validation;

	const { error: userSignInError } = await supabase.auth.signInWithPassword({
		email: data.email,
		password: data.password,
	})

	if (userSignInError) {
		console.error('Login failed:', userSignInError.message);
		return { success: false, error: userSignInError.message };
	}

	// After a successful login, redirect the user
	// redirect(data.redirectPath || '/');

	switch(data.redirectPath) {
		case "checkout": 
			redirect('/place-order');
			break;

		default: 
			redirect('/');
			break;
	}
}