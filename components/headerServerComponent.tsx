
import { createClient } from "@/supabase/server";
//import { Header } from "./header";
import { HeaderNew } from "./headernew";

export const ServerHeader = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return <HeaderNew user={data?.user} />;
};
