import { createClient } from "@/supabase_change/server"

export const userGetCategoryProducts = async (cat: string) => {
    const supabase = await createClient();

    try {
        //get the category id from the category table and query it in the products_lists
        const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("id")
            .eq("name", cat)
            .single(); 

        if (categoryError) {
            throw new Error(`Error fetching category: ${categoryError.message}`);
        }

        if (!categoryData) {
            throw new Error(`Category "${cat}" not found`);
        }

        const categoryId = categoryData.id;

        // Step 2: Query the "products_list" table using the retrieved category ID
        const { data: productsData, error: productsError } = await supabase
            .from("products_list")
            .select("id, name, price, category_id")
            .eq("category_id", categoryId);

        if (productsError) {
            throw new Error(`Error fetching products: ${productsError.message}`);
        }

        const productIds = productsData?.map((product) => product.id) || [];
        const productResults = productsData?.map((product) => ({
            ...product,
            source: "product",
        })) || [];

        const { data: imagesData, error: imagesError } = await supabase
            .from("product_images")
            .select("product_id, image_url")
            .in("product_id", productIds)
            .eq("is_main", true);

        if (imagesError) throw new Error(`Image query error: ${imagesError.message}`);
        const imageMap = new Map(
            imagesData?.map((image) => [image.product_id, image.image_url]) || []
        );
    
        const productsWithImages = productResults.map((product) => ({
            ...product,
            main_image_url: imageMap.get(product.id) || null,
        }));
        return [...productsWithImages];
    } catch (error) {
        
    }
}