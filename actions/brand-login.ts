"use server";

import { createClient } from "../supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function brandLogin(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("brandEmail") as string,
        password: formData.get("brandPassword") as string,
    };

    if (!data.email) {
        redirect("/login-brand?error=missing_email");
        return;
    }

    // Check if email exists in the users table
    const { data: userData, error: userCheckError } = await supabase
        .from("users")
        .select("email")
        .eq("email", data.email)
        .single();

    if (userCheckError && userCheckError.code !== "PGRST116") { 
        // Code PGRST116 means no row was found
        redirect("/login-brand?error=check_failed");
        return;
    }

    const emailIsUser = "This email is signed up as a Customer, please enter a valid Brand Email";
    if (userData) {
        // If the email exists, redirect with an error message
        redirect("/login-brand?error=" + encodeURIComponent(emailIsUser));
        return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword(data);

    if (loginError) {
        redirect("/login-brand?error=" + loginError.code);
        return;
    }

    // Get the logged-in brands's ID
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
        redirect("/login-brand?error=auth_failed");
        return;
    }

    const userId = user.user.id;

    // Check if the logged-in brand's ID exists in the brands_list table
    const { data: brandData, error: brandDataError } = await supabase
        .from("brands_list")
        .select("id")
        .eq("id", userId)
        .single();

    if (brandDataError && brandDataError.code !== "PGRST116") {
        redirect("/login-brand?error=check_failed");
        return;
    }

    if (brandData) {
        // If the brand exists, redirect to the dashboard
        redirect("/dashboard");
    } else {
        // If the brand does not exist, redirect to onboarding
        redirect("/brand-onboarding");
    }

    revalidatePath("/", "layout");
}
