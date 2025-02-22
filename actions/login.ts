"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase_change/server";

export async function login(formData: FormData) {
	const supabase = await createClient();

	const data = {  
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	if (!data.email) {
		redirect("/log-in?error=missing_email");
		return;
	}

	const { data: brandData, error: brandCheckError } = await supabase
		.from("brands")
		.select("brand_email")
		.eq("brand_email", data.email)
		.single();

	if ( brandCheckError && brandCheckError.code !== "PGRST116") {
		redirect("/log-in?error=check_failed");
		return;
	}

	const emailIsBrand = "This email is signed up as a Customer, please enter a valid Brand Email"
 
	if (brandData) {
		redirect("/log-in?error=" + encodeURIComponent(emailIsBrand));
		return;
	}

	const { error: loginError } = await supabase.auth.signInWithPassword(data);

	if (loginError) {
		redirect("/log-in?error=" + loginError.code);
	}

	//Get the logged-in users ID
	const { data: user, error: userError } = await supabase.auth.getUser();
	if (userError || !user.user) {
		redirect("/log-in?error=auth_failed");
		return;
	}


	revalidatePath("/", "layout");
	redirect("/");
}
