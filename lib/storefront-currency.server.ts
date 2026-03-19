import { cookies } from "next/headers";
import {
  normalizeStorefrontCurrency,
  STOREFRONT_CURRENCY_COOKIE,
} from "@/lib/storefront-currency";

export async function getPreferredStorefrontCurrency() {
  const cookieStore = await cookies();
  return normalizeStorefrontCurrency(
    cookieStore.get(STOREFRONT_CURRENCY_COOKIE)?.value
  );
}
