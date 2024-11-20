import { createClient } from "@/supabase/server";

export const getCartItems = async (userId: string) => {
    const supabase = await createClient();

    // Step 1: Fetch cart items with product information
    const { data, error } = await supabase
        .from("cart_items")
        .select(`
            *,
            products_list(name)
        `)
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching cart items:", error);
        throw new Error("Failed to fetch cart items");
    }

    if (!data || data.length === 0) {
        console.log("No cart items found for user:", userId);
        return []; // Return an empty array if no items are found
    }

    // Step 2: Extract all size IDs
    const sizeIds = data.map((product) => product.size_id);

    // Step 3: Fetch size names for the size IDs
    const { data: sizeData, error: sizeError } = await supabase
        .from("sizes")
        .select("id, name")
        .in("id", sizeIds);

    if (sizeError) {
        console.error("Error fetching sizes: ", sizeError);
        throw new Error("Failed to fetch sizes");
    }

    // Create a map of size_id to size_name
    const sizeMap = new Map(sizeData.map((size) => [size.id, size.name]));

    // Step 4: Fetch product images for the products in the cart
    const productIds = data.map((product) => product.product_id);

    const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("product_id, image_url")
        .in("product_id", productIds)
        .eq("is_main", true);

    if (imagesError) {
        console.error("Error fetching product images: ", imagesError);
        throw new Error("Failed to fetch product images");
    }

    // Create a map of product_id to main image public URLs
    const imageMap = new Map(
        imagesData.map((image) => {
            const filename = image.image_url.split("/").pop();

            const { data: publicUrlData } = supabase.storage
                .from("product-images/products")
                .getPublicUrl(filename);

            return [image.product_id, publicUrlData?.publicUrl || null];
        })
    );

    // Step 5: Combine all data into the final productsWithImages array
    const productsWithImages = data.map((product) => ({
        ...product,
        main_image_url: imageMap.get(product.product_id) || null,
        product_name: product.products_list?.name || null,
        size_name: sizeMap.get(product.size_id) || null, // Attach size name using sizeMap
    }));

    console.log(productsWithImages);

    return productsWithImages; // Return fetched data
};
