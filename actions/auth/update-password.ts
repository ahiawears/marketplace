'use server'
import { createClient } from "@/supabase/server";
import z from 'zod';
import { revalidatePath } from "next/cache";

// Define a schema for validation, including the current password
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters long.")
});

export async function UpdatePassword(formData: FormData, role?: string){
    const supabase = await createClient();
    
    try {
        const validation = passwordSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            return {
                success: false,
                errors
            }
        }

        const { data } = validation;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            return { success: false, message: 'User not authenticated.' };
        }

        // STEP 1: Re-authenticate the user with their current password
        // This is a critical security step to verify the user's identity
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: data.currentPassword as string,
        });

        if (signInError) {
            console.error("Authentication failed:", signInError);
            return { success: false, message: 'The current password you entered is incorrect.' };
        }

        // STEP 2: If re-authentication succeeds, update the password
        const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword as string });

        if (updateError) {
            console.error("Password update error:", updateError);
            return { success: false, message: updateError.message };
        }

        // Revalidate the path to ensure the session is updated
        if (role === "brand") {
            revalidatePath("/dashboard/brand-profile-management")
            return { success: true, message: "Password updated successfully!" };
        } else {
            revalidatePath("/my-account");
            return { success: true, message: "Password updated successfully!" };
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}