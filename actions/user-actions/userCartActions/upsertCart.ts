"use server";

import { createClient } from "@/supabase/server";

interface CartItem {
  variantId: string;
  sizeId: string;
  quantity: number;
  isAnonymous: boolean;
  userId: string;
}

export const upsertCart = async ({
  variantId,
  sizeId,
  quantity = 1,
  isAnonymous,
  userId
}: CartItem) => {
  const supabase = await createClient();

  try {
    
    // Step 1: Get or create cart
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('id, total_price')
      .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
      .maybeSingle();

    if (cartError) throw new Error("Error fetching cart: " + cartError.message);

    let cartId = cartData?.id;
    let currentTotal = cartData?.total_price || 0;

    // Create new cart if doesn't exist
    if (!cartId) {
      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert({
          [isAnonymous ? 'anonymous_id' : 'user_id']: userId,
          total_price: 0
        })
        .select('id, total_price')
        .single();

      if (newCartError) throw new Error("Error creating cart: " + newCartError.message);
      cartId = newCart.id;
      currentTotal = 0;
    }

    // Step 2: Get product price first
    const { data: productData, error: productError } = await supabase
      .from('product_variants')
      .select('price, base_currency_price')
      .eq('id', variantId)
      .single();

    if (productError) throw new Error("Error fetching product: " + productError.message);

    const price = productData.base_currency_price || 0;
    const priceChange = price * quantity;

    // Step 3: Check for existing cart item
    const { data: existingItem, error: itemError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('product_id', variantId)
      .eq('size_id', sizeId)
      .eq('cart_id', cartId)
      .maybeSingle();

    if (itemError) throw new Error("Error checking cart items: " + itemError.message);

    // Step 4: Upsert the cart item
    if (existingItem) {
      // Update existing item
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (updateError) throw new Error("Error updating item: " + updateError.message);
    } else {
      // Insert new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          product_id: variantId,
          size_id: sizeId,
          quantity,
          price,
          cart_id: cartId
        });

      if (insertError) throw new Error("Error adding item: " + insertError.message);
    }

    // Step 5: Update cart total
    const newTotal = currentTotal + priceChange;
    const { error: updateCartError } = await supabase
      .from('carts')
      .update({ 
        total_price: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId);

    if (updateCartError) throw new Error("Error updating cart total: " + updateCartError.message);

    return { success: true, cartId, newTotal };

  } catch (error) {
    console.error("Cart update error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update cart' 
    };
  }
};