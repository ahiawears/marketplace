"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function brandLogin(formData: FormData){
    const supabase = await createClient();

    const data = {
        email: formData.get("brandEmail") as string,
        password: formData.get("brandPassword") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if( error ) {
        redirect("/login-brand?error=" + error.code);
    }

    revalidatePath("/", "layout");
    redirect("/brand-onboarding"); //fix the redirect
}