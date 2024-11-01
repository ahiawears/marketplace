"use server";

import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export async function passwordReset(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error("Password reset error:", error.message);
  }

  redirect("/create-new-password");
}
