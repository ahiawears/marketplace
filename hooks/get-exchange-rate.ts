import { createClient } from "@/supabase/client";

export async function GetExchangeRates(base_currency: string, target_currency: string): Promise<number | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("base_currency", base_currency)
        .eq("target_currency", target_currency)
        .single();

    if (error) {
        console.error("Error fetching exchange rate:", error);
        return null;
    }

    return data?.rate || null;
}