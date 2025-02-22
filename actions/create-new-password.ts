"use server";

import { createClient } from "@/supabase_change/server";
import { redirect } from "next/navigation";

export async function createNewPassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get("newPassword") as string;
    
    try{
        const { error } = await supabase.auth.updateUser({password});
        if(error){
            console.error("Update Password reset error:", error.message);
        }
        redirect("/log-in")
    } catch (error) {

    }
    
}