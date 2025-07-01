

export async function createSeason(supabase: any, season: string) {
    try {
        const { data: seasonData, error: seasonError } = await supabase
            .from("product_season")
            .upsert({
                name: season
            }, {
                onConflict: 'name'
            })
            .select('id')
            .single(); 

        if (seasonError) {
            throw seasonError;
        }

        if (seasonData) {
            console.log("The season data is: ", seasonData);
            return seasonData.id;
        }
        
    } catch (error) {
        console.error(`Error creating season: `, error);
        throw error;
    }
}