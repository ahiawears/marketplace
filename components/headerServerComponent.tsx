
import { createClient } from "@/supabase/server";
import { Header } from "./header";

export const ServerHeader = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return <Header user={data?.user} />;
};
