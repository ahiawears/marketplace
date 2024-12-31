type CurrencyProps = {
    id: number;
    name: string;
    symbol: string;
    code: string;
}

export const currency: CurrencyProps[] = [
    { id: 1, name: "Naira", symbol: "₦", code: "NGN" },
    { id: 2, name: "United States Dollar", symbol: "$", code: "USD" },
    { id: 3, name: "Euro", symbol: "€", code: "EUR" },
] 