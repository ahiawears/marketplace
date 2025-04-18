import { createClient } from "@/supabase/server"

export const getSavedItems = async (userId: string) => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_saved_item")
        .select(`*, products_list(name, price, id)`)
        .eq("user_id", userId);

    if (error) {
        throw new Error("Failed to fetch favorite items");
    }

    if (!data || data.length === 0) {
        return [];
    }

    const productIds = data.map((product) => product.product_id);

    const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("product_id, image_url")
        .in("product_id", productIds)
        .eq("is_main", true);

    if (imagesError) {
        throw new Error("Failed to fetch product images");
    }

    const imageMap = new Map(
        imagesData.map((image) => {
            const filename = image.image_url.split("/").pop();

            const { data: publicUrlData } = supabase.storage
                .from("product-images/products")
                .getPublicUrl(filename);

            return [image.product_id, publicUrlData?.publicUrl || null];
        })
    );

    const productsWithImages = data.map((product) => ({
        ...product,
        main_image_url: imageMap.get(product.product_id) || null,
        name: product.products_list?.name || null,
        price: product.products_list?.price || null,
        id: product?.product_id || null,
    }));

    return productsWithImages;
}