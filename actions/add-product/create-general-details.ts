import { createClient } from "@/supabase/server";

export async function createProduct(
    categoryId: string,
    subCategoryId: string,
    description: string,
    name: string,
    genderId: string,
    seasonId: string,
    slug: string,
    metaTitle: string,
    metaDescription: string,
    keywords: string[]
) {
    const supabase = await createClient();
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("User not authenticated");

        const brandId = user.id;

        const seoMetadata = {
            slug,
            metaTitle,
            metaDescription,
            keywords
        }
        const productDataToUpsert: any = {
            name,
            product_description: description,
            category_id: categoryId,
            subcategory_id: subCategoryId,
            gender_id: genderId,
            season_id: seasonId,
            brand_id: brandId,
            seo_metadata: seoMetadata, // JSONB column
        };


        const { data: productDataInserted, error: productError } = await supabase
            .from("products_list")
            .upsert(productDataToUpsert, {
                onConflict: "id",
                ignoreDuplicates: false,
            })
            .select("id")
            .single();

        if (productError) {
            console.error("Supabase product upsert error:", productError);
            throw productError;
        }

        return productDataInserted.id;

    } catch (error) {
        console.error("Error creating/updating product:", error);
        throw error;
    }
}