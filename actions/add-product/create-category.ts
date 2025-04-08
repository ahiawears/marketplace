

export async function createCategory(supabase: any, category: string) {
    try {
        const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .upsert({
                name: category
            }, {
                onConflict: 'name'
            })
            .select('id')
            .single(); 

        if (categoryError) {
            throw categoryError;
        }

        if (categoryData) {
            console.log("The category data is: ", categoryData);
            return categoryData.id;
        }
        
    } catch (error) {
        console.error(`Error creating category: `, error);
        throw error;
    }
}