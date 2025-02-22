"use server";

import { createClient } from "@/supabase_change/server";

interface CartItem {
    productId: string;
    sizeId: string;
    quantity: number;
    price: number;
}

const addItemToUserCart = async (cartItem: CartItem) => {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    const userId = authData.user?.id;

    if (!userId) {
        throw new Error("User is not authenticated");
    }

    console.log(cartItem);

    // Step 1: Check for an existing cart
    const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("id, total_price")
        .eq("user_id", userId)
        .maybeSingle();

    if (cartError) {
        throw new Error("Error fetching cart data: " + cartError.message);
    }

    let cartId = cartData?.id;

    // Step 2: Create a new cart if one doesn't exist
    if (!cartId) {
        const { data: newCart, error: newCartError } = await supabase
            .from("carts")
            .insert({ user_id: userId, total_price: 0 })
            .select("id, total_price")
            .single();

        if (newCartError) {
            throw new Error("Error creating cart: " + newCartError.message);
        }

        cartId = newCart.id;
    }

    // Step 3: Check if the product already exists in cart_items
    const { data: existingCartItem } = await supabase
        .from("cart_items")
        .select("id, quantity, price")
        .eq("product_id", cartItem.productId)
        .eq("size_id", cartItem.sizeId) 
        .eq("user_id", userId)
        .maybeSingle();

    let updatedTotalPrice = cartData?.total_price || 0;

    if (existingCartItem) {
        // Update quantity and price if item exists
        const updatedQuantity = existingCartItem.quantity + cartItem.quantity;   

        const { error: updateItemError } = await supabase
            .from("cart_items")
            .update({ quantity: updatedQuantity })
            .eq("id", existingCartItem.id);

        if (updateItemError) {
            throw new Error("Error updating cart item: " + updateItemError.message);
        }

        updatedTotalPrice += cartItem.price * cartItem.quantity;
    } else {
        // Insert new item
        const { error: cartItemError } = await supabase.from("cart_items").insert({
            product_id: cartItem.productId,
            quantity: cartItem.quantity,
            user_id: userId,
            price: cartItem.price,
            size_id: cartItem.sizeId,
            cart_id: cartId,
        });

        if (cartItemError) {
            throw new Error("Error adding item to cart: " + cartItemError.message);
        }

        updatedTotalPrice += cartItem.price * cartItem.quantity;
    }

    console.log("The total price is:", updatedTotalPrice);

    // Step 4: Update total price in the cart
    const { error: updateCartError } = await supabase
        .from("carts")
        .update({ total_price: updatedTotalPrice })
        .eq("id", cartId);

    if (updateCartError) {
        throw new Error("Error updating cart total: " + updateCartError.message);
    }

    console.log(`Cart updated successfully. Total price: ${updatedTotalPrice}`);
};

export default addItemToUserCart;
