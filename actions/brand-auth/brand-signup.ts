"use server";

import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { z } from 'zod';

const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function SignUpbrand(formData: FormData) {

    const supabase = await createClient();
    const validation = signUpSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validation.success) {
        return { succcess: false, errors: validation.error.formErrors.fieldErrors }
    } 

    const { data } = validation;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_SITE_URL is not set');
    }

    const emailRedirectTo = `${baseUrl}/brand-onboarding`;

    const { error } = await supabase.auth.signUp ({
        email: data.email,
        password: data.password,
        options: {
            emailRedirectTo: emailRedirectTo.toString(),
            data: {
                role: 'brand',
            }
        },
    });

    if (error) {
        return { success: false, message: error.message}
    }
    redirect('/check-email');
}