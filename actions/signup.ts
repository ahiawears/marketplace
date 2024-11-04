"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";
import { AddUser } from "./add-user";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const userData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("firstname") as string,
    lastName: formData.get("lastname") as string,
  };

  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
      },
    },
  });

  if (error || !data.user?.id) {
    console.error({ error });
    redirect("/signup?error=" + error?.code);
  }

  const { error: addUserError } = await AddUser({
    id: data.user.id, 
    email: userData.email,
  });

  if (addUserError) {
    console.error({ addUserError });
    redirect("/signup?error=" + addUserError?.code);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
