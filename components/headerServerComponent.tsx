
import { createClient } from "@/supabase/server";
import { HeaderNew } from "./headernew";
import { getPreferredStorefrontCurrency } from "@/lib/storefront-currency.server";

export const ServerHeader = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const selectedCurrency = await getPreferredStorefrontCurrency();

  return <HeaderNew user={data?.user} selectedCurrency={selectedCurrency} />;
};
