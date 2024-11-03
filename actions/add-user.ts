import { createClient } from "@/supabase/server";

type Props = {
  user_id: string;
  email: string;
};

export async function AddUser({ user_id, email }: Props) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("users").insert({
    user_id,
    email,
  });

  return {
    data,
    error,
  };
}
