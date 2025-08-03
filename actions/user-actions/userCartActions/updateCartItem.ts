"use server";

import { createClient } from "@/supabase/server";

export const updateCartItemQuantity = async (
  qty: number, 
  cartItemId: string, 
  userId: string, 
  isAnonymous: boolean
) => {
    const supabase = await createClient();
    
    try {
        // 1. Get the cart with explicit type
        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('id, total_price')
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .single();

        if (cartError || !cart) {
            throw new Error(cartError?.message || 'Cart not found');
        }

        // 2. Get current item details - now we expect price to be unit price
        const { data: item, error: itemError } = await supabase
            .from('cart_items')
            .select('quantity, price')
            .eq('id', cartItemId)
            .eq('cart_id', cart.id)
            .single();

        if (itemError || !item) {
            throw new Error(itemError?.message || 'Item not found');
        }

        // 3. Calculate new values - simpler now since price is unit price
        const unitPrice = item.price; // Now price is already the unit price
        const previousItemTotal = unitPrice * item.quantity;
        const newItemTotal = unitPrice * qty;
        const totalDifference = newItemTotal - previousItemTotal;
        const newCartTotal = (cart.total_price || 0) + totalDifference;

        // 4. Update only quantity (price remains the unit price)
        const { error: updateError } = await supabase
            .from('cart_items')
            .update({
                quantity: qty,
                updated_at: new Date().toISOString()
            })
            .eq('id', cartItemId);

        if (updateError) throw updateError;

        // 5. Update cart total
        const { error: cartUpdateError } = await supabase
            .from('carts')
            .update({
                total_price: newCartTotal,
                updated_at: new Date().toISOString()
            })
            .eq('id', cart.id);

        if (cartUpdateError) throw cartUpdateError;

        return {
            success: true,
            newQuantity: qty,
            newTotal: newCartTotal,
            unitPrice: unitPrice // Return unit price for UI if needed
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Update failed',
            newQuantity: 0,
            newTotal: 0
        };
    }
};


export const deleteCartItem = async ( id: string, userId: string, isAnonymous: boolean ) => {
    const supabase = await createClient();
    try {
        //fetch the price, quantity and the cart id of the cart item
        const { data: itemData, error: itemDataError } = await supabase
            .from('cart_items')
            .select('quantity, price, cart_id')
            .eq('id', id)
            .single();

        if(itemDataError) {
            console.log(itemDataError instanceof Error ? itemDataError.message : "Failed to get the item details");
            throw new Error(itemDataError instanceof Error ? itemDataError.message : "Failed to get the item details");
        }

        if(!itemData) {
            console.log("No item data found");
            throw new Error("No item data found");
        }

        const { quantity, price, cart_id} = itemData;
        //get the cart total price
        const {data: cartTotalPrice, error: cartTotalPriceError} = await supabase
            .from('carts')
            .select('total_price')
            .eq('id', cart_id)
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .single();

        if(cartTotalPriceError) {
            console.log(cartTotalPriceError instanceof Error ? cartTotalPriceError.message : "Failed to get the cart total price");
            throw new Error(cartTotalPriceError instanceof Error ? cartTotalPriceError.message : "Failed to get the ccart total price");
        }

        if (!cartTotalPrice) {
            console.log("Failed to get the cart total price");
            throw new Error("Failed to get the ccart total price");
        }

        const totalPrice = cartTotalPrice.total_price;

        //calculate how much the item cost in the main cart
        const itemTotalCost = price * quantity;

        //delete the item from cart_items
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id);

        if(deleteError) {
            console.log(deleteError instanceof Error ? deleteError.message : "Failed to ddelete item details");
            throw new Error(deleteError instanceof Error ? deleteError.message : "Failed to delete item details");
        }

        //subtract the itemTotalCost from the totalPrice
        const newTotal = totalPrice - itemTotalCost;

        //update the total price
         const { error: cartUpdateError } = await supabase
            .from('carts')
            .update({
                total_price: newTotal,
                updated_at: new Date().toISOString()
            })
            .eq('id', cart_id)
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId);

        if (cartUpdateError) throw cartUpdateError;

        return {
            success: true,
            newTotal: newTotal,
            deletedId: id
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Update failed',
            newQuantity: 0,
            newTotal: 0
        };
    } 
};

