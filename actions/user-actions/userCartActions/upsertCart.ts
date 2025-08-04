"use server";

import { createClient } from "@/supabase/server";

// Define a more specific type for the input data
interface CartItemData {
  variantId: string;
  sizeId: string;
  quantity: number;
  isAnonymous: boolean;
  userId: string;
}

// Define the return type for better client-side type inference
interface CartResult {
  success: boolean;
  cartId?: string;
  newTotal?: number;
  error?: string;
}

export const upsertCart = async (data: CartItemData): Promise<CartResult> => {
  const supabase = await createClient();

  try {
    // Step 1: Get or create cart
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('id, total_price')
      .eq(data.isAnonymous ? 'anonymous_id' : 'user_id', data.userId)
      .maybeSingle();

    if (cartError) {
      console.error("Supabase Error (cart fetch):", cartError.message);
      return { success: false, error: "Error fetching cart: " + cartError.message };
    }
    let cartId = cartData?.id;
    let currentTotal = cartData?.total_price || 0;

    // Create new cart if it doesn't exist
    if (!cartId) {
      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert({
          [data.isAnonymous ? 'anonymous_id' : 'user_id']: data.userId,
          total_price: 0
        })
        .select('id, total_price')
        .single();

      if (newCartError) {
        console.error("Supabase Error (cart create):", newCartError.message);
        return { success: false, error: "Error creating cart: " + newCartError.message };
      }
      cartId = newCart.id;
      currentTotal = 0;
    }

    // Step 2: Get product price
    const { data: productData, error: productError } = await supabase
      .from('product_variants')
      .select('price, base_currency_price')
      .eq('id', data.variantId)
      .single();

    if (productError) {
      console.error("Supabase Error (product price):", productError.message);
      return { success: false, error: "Error fetching product data: " + productError.message };
    }
    const price = productData.base_currency_price || 0;
    const priceChange = price * data.quantity;

    // Step 3: Check for existing cart item
    const { data: existingItem, error: itemError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('product_id', data.variantId)
      .eq('size_id', data.sizeId)
      .eq('cart_id', cartId)
      .maybeSingle();

    if (itemError) {
      console.error("Supabase Error (cart item check):", itemError.message);
      return { success: false, error: "Error checking cart items: " + itemError.message };
    }

    const now = new Date().toISOString();

    // Step 4: Upsert the cart item
    if (existingItem) {
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + data.quantity,
          updated_at: now
        })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error("Supabase Error (cart item update):", updateError.message);
        return { success: false, error: "Error updating cart items: " + updateError.message };
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          product_id: data.variantId,
          size_id: data.sizeId,
          quantity: data.quantity,
          price,
          cart_id: cartId,
          created_at: now
        });

      if (insertError) {
        console.error("Supabase Error (cart item insert):", insertError.message);
        return { success: false, error: "Error adding items: " + insertError.message };
      }
    }

    // Step 5: Update cart total
    const newTotal = currentTotal + priceChange;
    const { error: updateCartError } = await supabase
      .from('carts')
      .update({
        total_price: newTotal,
        updated_at: now
      })
      .eq('id', cartId);

    if (updateCartError) {
      console.error("Supabase Error (cart total update):", updateCartError.message);
      return { success: false, error: "Error updating cart total: " + updateCartError.message };
    }
    
    // On success, return a new, explicitly constructed plain object
    return { success: true, cartId, newTotal };

  } catch (error) {
    console.error("Internal server error in upsertCart:", error);
    // On unexpected error, return a new, explicitly constructed plain error object
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update cart'
    };
  }
};