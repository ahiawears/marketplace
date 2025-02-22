

export async function createCategory(supabase: any, category: string) {
    try {
        const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("id, name")
            .eq("name", category)
            .maybeSingle();

        if (categoryError) {
            throw new Error(categoryError.message); // Re-throw Supabase error
        }

        if (categoryData) {
            return categoryData.id;
        } else {
            const { data: newCategoryData, error: newCategoryError } = await supabase
                .from("categories")
                .insert({ name: category })
                .select()
                .single();

            if (newCategoryError) {
                throw new Error(newCategoryError.message);
            }
            return newCategoryData.id;
        }
        
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
}