import { createClient } from "@/supabase/server";

export const getProductItems = async (userId: string) => {//change this to brandId
    const supabase = await createClient();
    const { data: productData, error: productError } = await supabase
        .from('products_list')
        .select('*, category_id')
        .eq('brand_id', userId); //replace userId  with brandId 

    console.log("Fetched Data:", productData);
    console.log("Fetch Error:", productError);

    if (productError) {
        console.error("Error fetching products items:", productError);
        throw new Error('Failed to fetch products items');
    }

    if (!productData || productData.length === 0) {
        console.log("No products items found for user:", userId);
        return []; 
    }
    const categoryIds = productData.map(item => item.category_id);

    const { data: categoriesData, error: categoriesError } = await supabase
                                                .from('categories')
                                                .select('id, name')
                                                .in('id', categoryIds);

    if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw new Error('Failed to fetch categories');
    }

    // Step 3: Map category names to products
    const categoryMap = new Map(categoriesData.map(category => [category.id, category.name]));
    const productsWithCategoryNames = productData.map(product => ({
        ...product,
        category_name: categoryMap.get(product.category_id) || 'Unknown Category'  
    }));

    return productsWithCategoryNames;
}