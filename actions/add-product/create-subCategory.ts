export async function createSubCategory(supabase: any, subCategory: string, categoryId: string) {
    try {
        const { data: subCategoryData, error: subCategoryError } = await supabase
            .from("subcategories")
            .select("id, name")
            .eq("name", subCategory)
            .eq("category_id", categoryId)
            .maybeSingle();

        if (subCategoryError) {
            throw new Error(subCategoryError.message);
        }

        if (subCategoryData) {
            return subCategoryData.id;
        } else {
            const { data: newSubCategoryData, error: newSubCategoryError } = await supabase
                .from("subcategories")
                .insert({ name: subCategory, category_id: categoryId })
                .select()
                .single();

            if (newSubCategoryError) {
                throw new Error(newSubCategoryError.message);
            }
            return newSubCategoryData.id;
        }
    } catch (error) {
        console.error("Error creating subcategory:", error);
        throw error;
    }
}