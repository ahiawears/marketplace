
export async function createCurrency(supabase: any, currency: string) {
    try {
        const { data: currencyData, error: currencyError } = await supabase
            .from("currency")
            .select("id, name")
            .eq("name", currency)
            .maybeSingle();

        if (currencyError) {
            throw new Error(currencyError.message);
        }

        if (currencyData) {
            return currencyData.id;
        } else {
            const { data: newCurrencydata, error: newCurrencyError } = await supabase
                .from("currency")
                .insert({name: currency})
                .select()
                .single();

            if (newCurrencyError) {
                throw new Error(newCurrencyError.message);
            }
            return newCurrencydata.id;
        }
    } catch (error) {
        console.error("Error creating currency:", error);
        throw error;
    }
}