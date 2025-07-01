

export async function createGender(supabase: any, gender: string) {
    try {
        const { data: genderData, error: genderError } = await supabase
            .from("product_gender")
            .upsert({
                name: gender
            }, {
                onConflict: 'name'
            })
            .select('id')
            .single(); 

        if (genderError) {
            throw genderError;
        }

        if (genderData) {
            console.log("The gender data is: ", genderData);
            return genderData.id;
        }
        
    } catch (error) {
        console.error(`Error creating gender: `, error);
        throw error;
    }
}