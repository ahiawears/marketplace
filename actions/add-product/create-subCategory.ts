import { createClient } from "@/supabase/server";

export async function createSubCategory(subCategory: string, categoryId: string) {
    const supabase = await createClient();
    try {
        const { data: subCategoryData, error: subCategoryError } = await supabase
            .from("subcategories")
            .upsert({
                name: subCategory,
                category_id: categoryId
            }, {
                onConflict: 'name'
            })
            .select('id')
            .single();

        if (subCategoryError) {
            throw subCategoryError;
        }

        if (subCategoryData) {
            console.log("The subcategory data is: ", subCategoryData);
            return subCategoryData.id;
        }
    } catch (error) {
        console.error("Error creating subcategory:", error);
        throw error;
    }
}