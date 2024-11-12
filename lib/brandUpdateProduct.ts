import { createClient } from "@/supabase/server";
import { ProductDetails } from "./types";

export const fetchProductById = async (id: string): Promise<ProductDetails | null> => {
    const supabase = await createClient();

    const { data: productData, error: productError } = await supabase
        .from('products_list')
        .select('*, category_id')
        .eq('product_id', id);

    if (productError) {
        console.error("Error fetching product items:", productError);
        throw new Error("Failed to fetch product items");
    }

    if (!productData || productData.length === 0) {
        console.log("Product item not found for ID:", id);
        return null; // Return null if no product found
    }

    // Assuming productData contains only one item, take the first
    const product = productData[0];

    const categoryIds = [product.category_id];
    const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);

    if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw new Error('Failed to fetch categories');
    }

    const categoryMap = new Map(categoriesData.map(category => [category.id, category.name]));
    const productWithCategory = {
        ...product,
        category_name: categoryMap.get(product.category_id) || 'Unknown Category'
    };

    const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .eq('product_id', product.id)
        .eq('is_main', true);

    if (imagesError) {
        console.error("Error fetching product images:", imagesError);
        throw new Error('Failed to fetch product images');
    }

    const mainImage = imagesData?.[0]?.image_url || null;

    const productWithImage: ProductDetails = {
        ...productWithCategory,
        main_image_url: mainImage
    };

    return productWithImage;
};
