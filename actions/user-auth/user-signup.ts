'use server';

import { z } from 'zod'; 
import { createClient } from '@/supabase/server';
import { redirect } from 'next/navigation';

// Define a complete validation schema for the sign-up form data.
const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    // These are from hidden inputs, so they are optional on the server side
    redirectPath: z.string().optional(),
    isAnonymous: z.string().transform(val => val === 'true').optional(),
    serverUserIdentifier: z.string().optional(),
});

export async function signUpUser(formData: FormData) {
    const supabase = await createClient();
    const validation = signUpSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validation.success) {
        // Log the errors for debugging on the server.
        console.error('Validation failed:', validation.error.formErrors.fieldErrors);
        // You can return the errors or throw a new Error.
        return { success: false, errors: validation.error.formErrors.fieldErrors };
    }

    // Destructure the validated data.
    const { data } = validation;
    const path = data.redirectPath; // This is 'checkout' from your form
    const uid = data.serverUserIdentifier;


    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_SITE_URL is not set');
    }

    console.log("The baseUrl is ", baseUrl);

    //Use environment variables for production and development URLs.
    const emailRedirectTo = new URL('/callback', baseUrl);
    if (path) {
        emailRedirectTo.searchParams.set('redirect', path);
    }
    if (uid) {
        emailRedirectTo.searchParams.set('anonId', uid);
    }

    // let next;

    // switch (path) {
    //     case "checkout":
    //         next = 'place-order'
    //         break;
    
    //     default:
    //         next = '/'
    //         break;
    // }

    //console.log(`Should redirect to ${baseUrl}/confirm?next=${next}`);

    // Call Supabase with the validated data.
    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            emailRedirectTo: emailRedirectTo.toString(),
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'customer'
            },
        },
    });

    if (error) {
        console.error('SignUp Error:', error);
        // Return a structured error object.
        return { success: false, message: error.message };
    }    
    
    redirect('/check-email');
}