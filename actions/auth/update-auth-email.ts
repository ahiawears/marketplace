// actions/auth/update-auth-email.ts
'use server';

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function UpdateAuthEmail(formData: FormData, role?: string) {
    const supabase = await createClient();

    try {
        const { data: { user }, } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: "User not authenticated.",
            };
        }
        
        const newEmail = formData.get("newEmail") as string;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        
        if (!baseUrl) {
            return {
                success: false,
                message: "Can't find baseurl, please refresh"
            }
        }
        // Set the custom redirect URL to your confirmation page
        const redirectTo = `${baseUrl}/confirm-new-auth-email`;
        
        const { data, error } = await supabase.auth.updateUser({
            email: newEmail,
        }, {
            emailRedirectTo: redirectTo
        });

        
        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }

        if (role === "brand") {
            revalidatePath('/dashboard/brand-profile-management')
        }

        return {
            success: true,
            // Updated message to inform the user about both emails
            message: "A confirmation email has been sent to your new email address, and a security alert has been sent to your current email. Please check both inboxes to complete the change.",
            user: data.user
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred.",
        }
    }
}