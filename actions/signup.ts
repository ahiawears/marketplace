"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        first_name: formData.get("name") as string,
        last_name: formData.get("surname") as string,
      },
    },
  });

  if (error) {
    console.error(error);
    redirect("/signup?error=" + error.code);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
