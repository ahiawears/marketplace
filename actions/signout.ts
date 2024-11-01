"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export const signout = async () => {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
};
