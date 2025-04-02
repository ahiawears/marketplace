import { createClient } from "@/supabase/client";

export const ConverttoBaseCurrency = async (price: number, currency: string) => {
    if (currency === "USD") {
        return price;
    }

    const supabase = createClient();
    const { data, error } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("target_currency", currency)
        .single();

    if (error) {
        console.error("Error fetching exchange rate:", error);
        return null;
    };

    if(data) {
        return price / data.rate;
    }
}