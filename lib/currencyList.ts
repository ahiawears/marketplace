type CurrencyProps = {
    id: number;
    name: string;
    symbol: string;
    code: string;
    country_alpha: string;
}

export const currency: CurrencyProps[] = [
    { id: 1, name: "Nigerian Naira", symbol: "₦", code: "NGN", country_alpha: "NG"},
    { id: 2, name: "Kenyan Shilling", symbol: "KSh", code: "KES", country_alpha: "KE" },
    { id: 3, name: "South African Rand", symbol: "ZAR", code: "ZAR", country_alpha: "ZA" },
    { id: 4, name: "Ghanaian Cedi", symbol: "GH₵", code: "GHS", country_alpha: "GH" },
    { id: 5, name: "Ugandan Shilling", symbol: "UGX", code: "UGX", country_alpha: "UG"},
    { id: 6, name: "Tanzanian Shilling", symbol: "TZS", code: "TZS", country_alpha: "TZ"},
] 