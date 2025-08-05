import { createClient } from "@/supabase/server";

export const getCartItems = async (isAnonymous: boolean, userId: string) => {
    const supabase = await createClient();

    let totalPrice;

    try {
        // Find the user cart.
        const { data: userCart, error: userCartError } = await supabase
            .from('carts')
            .select('id, total_price')
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .single();

        if (userCartError) {
            // PGRST116 means no rows were found, so we can treat it as an empty cart.
            if (userCartError.code === 'PGRST116') {
                return { productsWithImages: [], totalPrice: 0 };
            }
            console.error("Error finding user cart id:", userCartError);
            throw new Error(userCartError.message || "Failed to find user cart id");
        }

        if (!userCart) {
            console.log("No cart items found for user:", userId);
            return { productsWithImages: [], totalPrice: 0 }; 
        }

        const cartId = userCart.id;
        totalPrice = userCart.total_price;

        // Fetch cart items and nested product/size info.
        const { data: cartItems, error: cartItemsError } = await supabase
            .from('cart_items')
            .select('quantity, size_id(name), price, product_id(id, name), id')
            .eq('cart_id', cartId);

        if (cartItemsError) {
            if (cartItemsError.code === 'PGRST116') {
                return { productsWithImages: [], totalPrice: totalPrice };
            }
            console.error("Error fetching cart items:", cartItemsError);
            throw new Error(cartItemsError.message || "Failed to fetch cart items");
        }

        // If no cart items are found, the query returns an empty array.
        if (!cartItems || cartItems.length === 0) {
            return { productsWithImages: [], totalPrice: totalPrice };
        }

        // Extract the variant IDs from the cart items.
        const variantIds = cartItems.map((item: any) => item.product_id.id);

        // Fetch the variant colors using the corrected `.in()` filter.
        const { data: variantColors, error: variantColorsError } = await supabase
            .from('product_variants')
            .select('id, color_id(name, hex_code)')
            .in('id', variantIds);

        if (variantColorsError) {
            throw new Error(variantColorsError.message || "Failed to fetch variant colors");
        }

        // Create a map that stores an object with both the color name and hex code.
        const colorMap = new Map(variantColors.map((color: any) => [
            color.id,
            color.color_id ? { name: color.color_id.name, hex: color.color_id.hex_code } : null
        ]));

        // Fetch the main images of each variant using the corrected `.in()` filter.
        const { data: variantImages, error: variantImagesError } = await supabase
            .from('product_images')
            .select('image_url, product_variant_id')
            .in('product_variant_id', variantIds)
            .eq('is_main', true);

        if (variantImagesError) {
            throw new Error(variantImagesError.message || "Failed to fetch variant images");
        }

        // Create a map for the main images.
        const imageMap = new Map(variantImages.map((image) => [image.product_variant_id, image.image_url]));

        // Map the cart items with their corresponding main images and colors.
        const productsWithImages = cartItems.map((item: any) => {
            const variantId = item.product_id.id;
            return {
                ...item,
                product_name: item.product_id.name,
                main_image_url: imageMap.get(variantId) || null,
                variant_color: colorMap.get(variantId) || null, // <-- ADDED: Getting the color object from the new map
            };
        });

        console.log(productsWithImages, totalPrice);

        return { productsWithImages, totalPrice };

    } catch (error) {
        console.error(error instanceof Error ? error.message : "Failed to fetch cart items");
        throw error;
    }
};