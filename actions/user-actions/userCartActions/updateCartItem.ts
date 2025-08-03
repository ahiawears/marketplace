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

