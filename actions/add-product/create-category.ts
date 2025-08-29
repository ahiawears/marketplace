import { createClient } from "@/supabase/server";


export async function createCategory(category: string) {
    const supabase = await createClient();
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