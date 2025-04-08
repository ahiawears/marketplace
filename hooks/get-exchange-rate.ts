export async function GetExchangeRates(supabase: any, base_currency: string, target_currency: string): Promise<number> {
    try {

        if (target_currency === base_currency) {
            return 1;
        }
        
        const { data, error } = await supabase
            .from("exchange_rates")
            .select("rate")
            .eq("base_currency", base_currency)
            .eq("target_currency", target_currency)
            .single();

        if (error) {
            console.error("Error fetching exchange rate:", error);
            throw error;
        }

        return data?.rate;
    } catch (error) {
        console.log(error);
        throw error;
    }
}