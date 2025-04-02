type CurrencyProps = {
    id: number;
    name: string;
    symbol: string;
    code: string;
}

export const currency: CurrencyProps[] = [
    { id: 1, name: "Nigerian Naira", symbol: "₦", code: "NGN" },
    { id: 2, name: "Kenyan Shilling", symbol: "KSh", code: "KES" },
    { id: 3, name: "South African Rand", symbol: "ZAR", code: "ZAR" },
    { id: 4, name: "Ghanaian Cedi", symbol: "GH₵", code: "GHS" },
    { id: 5, name: "Ugandan Shilling", symbol: "UGX", code: "UGX"},
    { id: 6, name: "Tanzanian Shilling", symbol: "TZS", code: "TZS"},
] 