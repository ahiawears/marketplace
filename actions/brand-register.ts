"use server";

import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { AddBrand } from "./add-brand";
import { revalidatePath } from "next/cache";


export async function brandRegister(formData: FormData) {
    const supabase = await createClient();

    const userData = {
        email: formData.get("brandEmail") as string,
        password: formData.get("brandPassword") as string,
        confirmPassword: formData.get("brandConfirmPassword") as string,
    };


    if (userData.password === userData.confirmPassword) {
        const { data, error } = await supabase.auth.signUp ({
            email: userData.email,
            password: userData.password,
        });
        if (error || !data.user?.id) {
            console.error({ error });
            redirect("/register-brand?error=" + error?.code)
        }

        const { error: addBrandError } = await AddBrand({
            id: data.user.id,
            brand_email: userData.email, 
        });

        if (addBrandError) {
            console.error({ addBrandError });
            redirect("/brand-register?error=" + addBrandError?.code);
        }

        revalidatePath("/", "layout");
        redirect("/brand-onboarding");
    
    } else {
        console.log("Passwords do not match");
    }
}