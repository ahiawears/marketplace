export function convertBaseCurrencyPrice(
  baseCurrencyPrice: number | null,
  exchangeRate: number
) {
  if (baseCurrencyPrice == null) {
    return null;
  }

  return +(baseCurrencyPrice * exchangeRate).toFixed(2);
}

export function formatStorefrontPrice(
  amount: number | null,
  currencyCode: string
) {
  if (amount == null) {
    return "Price unavailable";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}
