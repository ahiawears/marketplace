
export async function createCurrency(supabase: any, currency: string) {
    try {
        const {data: currencyData, error: currencyError } = await supabase  
            .from("currency")
            .upsert({
                name: currency
                }, {
                onConflict: 'name'
            })
            .select('id')
            .single();

            if (currencyError) {
                throw currencyError;
            }

            if (currencyData) {
                console.log("The currency data is: ", currencyData);
                return currencyData.id;
            }

    } catch (error) {
        console.error("Error creating currency:", error);
        throw error;
    }
}