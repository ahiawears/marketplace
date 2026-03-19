import { createClient } from "@/supabase/server";
import { formatStorefrontPrice } from "@/lib/storefront-pricing";

export const getCartItems = async (isAnonymous: boolean, userId: string) => {
    const supabase = await createClient();

    try {
        // Find the user cart.
        const { data: userCart, error: userCartError } = await supabase
            .from('carts')
            .select('id, total_price, currency_code, subtotal_base, subtotal_customer_currency')
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .single();

        if (userCartError) {
            // PGRST116 means no rows were found, so we can treat it as an empty cart.
            if (userCartError.code === 'PGRST116') {
                return {
                    productsWithImages: [],
                    totalPrice: 0,
                    currencyCode: "USD",
                    formattedTotalPrice: formatStorefrontPrice(0, "USD"),
                    subtotalBase: 0,
                    subtotalCustomerCurrency: 0,
                };
            }
            console.error("Error finding user cart id:", userCartError);
            throw new Error(userCartError.message || "Failed to find user cart id");
        }

        if (!userCart) {
            console.log("No cart items found for user:", userId);
            return {
                productsWithImages: [],
                totalPrice: 0,
                currencyCode: "USD",
                formattedTotalPrice: formatStorefrontPrice(0, "USD"),
                subtotalBase: 0,
                subtotalCustomerCurrency: 0,
            }; 
        }

        const cartId = userCart.id;
        const currencyCode = userCart.currency_code || "USD";
        const subtotalBase = Number(userCart.subtotal_base || 0);
        const subtotalCustomerCurrency = Number(
            userCart.subtotal_customer_currency || userCart.total_price || 0
        );
        const totalPrice = Number(userCart.total_price || 0);

        // Fetch cart items and nested product/size info.
        const { data: cartItems, error: cartItemsError } = await supabase
            .from('cart_items')
            .select('quantity, price, customer_currency, unit_price_customer_currency, product_name_snapshot, variant_name_snapshot, size_name_snapshot, image_url_snapshot, product_id(id, name), id, size_id(id, size_id(name))')
            .eq('cart_id', cartId);

        if (cartItemsError) {
            if (cartItemsError.code === 'PGRST116') {
                return {
                    productsWithImages: [],
                    totalPrice,
                    currencyCode,
                    formattedTotalPrice: formatStorefrontPrice(totalPrice, currencyCode),
                    subtotalBase,
                    subtotalCustomerCurrency,
                };
            }
            console.error("Error fetching cart items:", cartItemsError);
            throw new Error(cartItemsError.message || "Failed to fetch cart items");
        }

        // If no cart items are found, the query returns an empty array.
        if (!cartItems || cartItems.length === 0) {
            return {
                productsWithImages: [],
                totalPrice,
                currencyCode,
                formattedTotalPrice: formatStorefrontPrice(totalPrice, currencyCode),
                subtotalBase,
                subtotalCustomerCurrency,
            };
        }

        // Extract the variant IDs from the cart items.
        const variantIds = cartItems.map((item: any) => item.product_id.id);

        // Colors live in the variant-color join table in the current schema.
        const { data: variantColors, error: variantColorsError } = await supabase
            .from('product_variant_colors')
            .select('product_variant_id, color_id(name, hex_code)')
            .in('product_variant_id', variantIds);

        if (variantColorsError) {
            throw new Error(variantColorsError.message || "Failed to fetch variant colors");
        }

        // Create a map that stores an object with both the color name and hex code.
        const colorMap = new Map(
            (variantColors || []).map((color: any) => {
                const relation = Array.isArray(color.color_id) ? color.color_id[0] : color.color_id;

                return [
                    color.product_variant_id,
                    relation ? { name: relation.name, hex: relation.hex_code } : null,
                ];
            })
        );

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
            const resolvedSizeRelation = Array.isArray(item.size_id)
                ? item.size_id[0]
                : item.size_id;
            const resolvedSizeName = Array.isArray(resolvedSizeRelation?.size_id)
                ? resolvedSizeRelation?.size_id[0]?.name
                : resolvedSizeRelation?.size_id?.name;

            return {
                ...item,
                product_name: item.variant_name_snapshot || item.product_name_snapshot || item.product_id.name,
                main_image_url: item.image_url_snapshot || imageMap.get(variantId) || null,
                variant_color: colorMap.get(variantId) || null, // <-- ADDED: Getting the color object from the new map
                size_name: item.size_name_snapshot || resolvedSizeName || "Unknown",
                currency_code: item.customer_currency || currencyCode,
                formatted_price: formatStorefrontPrice(
                    Number(item.unit_price_customer_currency || item.price || 0),
                    item.customer_currency || currencyCode
                ),
            };
        });

        return {
            productsWithImages,
            totalPrice,
            currencyCode,
            formattedTotalPrice: formatStorefrontPrice(totalPrice, currencyCode),
            subtotalBase,
            subtotalCustomerCurrency,
        };

    } catch (error) {
        console.error(error instanceof Error ? error.message : "Failed to fetch cart items");
        throw error;
    }
};
