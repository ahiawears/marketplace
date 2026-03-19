import { currency } from "@/lib/currencyList";

export const STOREFRONT_CURRENCY_COOKIE = "preferred_currency";

const defaultCurrencyOption = {
  code: "USD",
  name: "US Dollar",
  symbol: "$",
};

const derivedCurrencyOptions = currency.map((item) => ({
  code: item.code,
  name: item.name,
  symbol: item.symbol,
}));

export const STOREFRONT_CURRENCY_OPTIONS = [
  defaultCurrencyOption,
  ...derivedCurrencyOptions.filter((item) => item.code !== defaultCurrencyOption.code),
];

const supportedCurrencyCodes = new Set(
  STOREFRONT_CURRENCY_OPTIONS.map((item) => item.code)
);

export function normalizeStorefrontCurrency(code?: string | null) {
  if (!code) {
    return defaultCurrencyOption.code;
  }

  const normalizedCode = code.toUpperCase();
  return supportedCurrencyCodes.has(normalizedCode)
    ? normalizedCode
    : defaultCurrencyOption.code;
}
