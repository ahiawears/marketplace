"use server";

import { createClient } from "@/supabase/server";

export const updateCartItemQuantity = async (qty: number, mainCartId: string, cart_item_id: string, cartItemPrice: number) => {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
        throw new Error("User is not authenticated");
    }

    //get the item price and quantity
    const { data: itemPxQ, error: itemPxQError } = await supabase
        .from("cart_items")
        .select('quantity, price')
        .eq('id', cart_item_id)
        .single();

    if (itemPxQError || !itemPxQ) {
        console.error("Error fetching item details:", itemPxQError);
        return;
    }

    const { quantity, price } = itemPxQ;

    const itemPriceData = quantity * price;

    console.log(itemPriceData);

    const { error: quantityError } = await supabase
        .from("cart_items")
        .update({
            quantity: qty,
        })
        .eq("id", cart_item_id)
        .eq("user_id", userId)
        .single();

    if (quantityError) {
        return quantityError;
    }


    const { data: totalPrice, error: totalPriceError } = await supabase
        .from("carts")
        .select('total_price')
        .eq('id', mainCartId)
        .single();

    if (totalPriceError || !totalPrice) {
        console.error("Error fetching cart total price:", totalPriceError);
        return;
    }

    const { total_price } = totalPrice;

    const holdingTotalPrice = total_price - itemPriceData;

    const newItemPriceData = qty * price;

    const newTotalPrice = holdingTotalPrice + newItemPriceData;

    const { error: updateTotalPriceError } = await supabase
        .from("carts")
        .update({ total_price: newTotalPrice})
        .eq('id', mainCartId)
        .single();

    if (updateTotalPriceError) {
        console.error("Error updating total price:", updateTotalPriceError);
        return;
    }
}




export const deleteCartItem = async (cartId: string, id: string) => {
    const supabase = await createClient();

    try {
        // Step 1: Get the item details (quantity and price) before deletion
        const { data: item, error: fetchError } = await supabase
            .from('cart_items')
            .select('quantity, price')
            .eq('id', id)
            .single();

        if (fetchError || !item) {
            console.error("Error fetching item details:", fetchError);
            return;
        }

        const { quantity, price } = item;

        // Step 2: Delete the item
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id)
            .eq('cart_id', cartId);

        if (deleteError) {
            console.error("Error deleting item:", deleteError);
            return;
        }

        // Step 3: Fetch the current total price from the carts table
        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('total_price')
            .eq('id', cartId)
            .single();

        if (cartError || !cart) {
            console.error("Error fetching cart details:", cartError);
            return;
        }

        const currentTotalPrice = cart.total_price;

        // Step 4: Calculate the updated total price
        const adjustment = quantity * price;
        const updatedTotalPrice = currentTotalPrice - adjustment;

        // Step 5: Update the total_price in the carts table
        const { error: updateError } = await supabase
            .from('carts')
            .update({ total_price: updatedTotalPrice })
            .eq('id', cartId);

        if (updateError) {
            console.error("Error updating total price:", updateError);
            return;
        }

        console.log("Item deleted and total price updated successfully.");

    } catch (err) {
        console.error("Unexpected error:", err);
    }
};

