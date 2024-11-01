"use server";

import { createClient } from "@/supabase/server";

export async function passwordReset(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
  
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `http://localhost:3000/create-new-password`,
            }
        );
        if (error) {
            console.error("Password reset error:", error.message);
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
    }
}
