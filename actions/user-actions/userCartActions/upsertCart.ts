"use server";

import { createClient } from "@/supabase/server";
import { getPreferredStorefrontCurrency } from "@/lib/storefront-currency.server";
import { GetExchangeRates } from "@/hooks/get-exchange-rate";
import { convertBaseCurrencyPrice } from "@/lib/storefront-pricing";

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
    const selectedCurrency = await getPreferredStorefrontCurrency();

    // Step 1: Get or create cart
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('id, total_price, currency_code, exchange_rate_used, subtotal_base, subtotal_customer_currency')
      .eq(data.isAnonymous ? 'anonymous_id' : 'user_id', data.userId)
      .maybeSingle();

    if (cartError) {
      console.error("Supabase Error (cart fetch):", cartError.message);
      return { success: false, error: "Error fetching cart: " + cartError.message };
    }
    let cartId = cartData?.id;
    let currentTotal = Number(cartData?.total_price || 0);
    let currentSubtotalBase = Number(cartData?.subtotal_base || 0);
    let cartCurrencyCode = cartData?.currency_code || selectedCurrency;
    let cartExchangeRate = Number(
      cartData?.exchange_rate_used ||
      (cartCurrencyCode === "USD" ? 1 : await GetExchangeRates("USD", cartCurrencyCode))
    );

    // Create new cart if it doesn't exist
    if (!cartId) {
      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert({
          [data.isAnonymous ? 'anonymous_id' : 'user_id']: data.userId,
          total_price: 0,
          currency_code: cartCurrencyCode,
          exchange_rate_used: cartExchangeRate,
          subtotal_base: 0,
          subtotal_customer_currency: 0,
        })
        .select('id, total_price, currency_code, exchange_rate_used, subtotal_base, subtotal_customer_currency')
        .single();

      if (newCartError) {
        console.error("Supabase Error (cart create):", newCartError.message);
        return { success: false, error: "Error creating cart: " + newCartError.message };
      }
      cartId = newCart.id;
      currentTotal = 0;
      currentSubtotalBase = 0;
      cartCurrencyCode = newCart.currency_code || cartCurrencyCode;
      cartExchangeRate = Number(newCart.exchange_rate_used || cartExchangeRate);
    }

    // Step 2: Get product + snapshot details
    const { data: productData, error: productError } = await supabase
      .from('product_variants')
      .select(`
        id,
        name,
        sku,
        base_currency_price,
        main_product_id(name),
        product_images(image_url, is_main)
      `)
      .eq('id', data.variantId)
      .single();

    if (productError) {
      console.error("Supabase Error (product price):", productError.message);
      return { success: false, error: "Error fetching product data: " + productError.message };
    }

    const { data: sizeData, error: sizeError } = await supabase
      .from("product_sizes")
      .select("id, size_id(name)")
      .eq("id", data.sizeId)
      .single();

    if (sizeError || !sizeData) {
      console.error("Supabase Error (size snapshot):", sizeError?.message);
      return { success: false, error: "Error fetching size details: " + (sizeError?.message || "Size not found.") };
    }

    const normalizedProductName = Array.isArray(productData.main_product_id)
      ? productData.main_product_id[0]?.name
      : productData.main_product_id?.name;
    const normalizedSizeName = Array.isArray(sizeData.size_id)
      ? sizeData.size_id[0]?.name
      : sizeData.size_id?.name;
    const mainImage =
      (productData.product_images || []).find((image: { image_url: string | null; is_main: boolean | null }) => image.is_main)?.image_url ||
      productData.product_images?.[0]?.image_url ||
      null;

    const unitPriceBase = Number(productData.base_currency_price || 0);
    const unitPriceCustomerCurrency = convertBaseCurrencyPrice(unitPriceBase, cartExchangeRate) || 0;
    const price = unitPriceCustomerCurrency;
    const priceChange = price * data.quantity;
    const basePriceChange = unitPriceBase * data.quantity;

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
          price,
          unit_price_base: unitPriceBase,
          unit_price_customer_currency: unitPriceCustomerCurrency,
          customer_currency: cartCurrencyCode,
          exchange_rate_used: cartExchangeRate,
          product_name_snapshot: normalizedProductName || null,
          variant_name_snapshot: productData.name || null,
          sku_snapshot: productData.sku || null,
          size_name_snapshot: normalizedSizeName || null,
          image_url_snapshot: mainImage,
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
          unit_price_base: unitPriceBase,
          unit_price_customer_currency: unitPriceCustomerCurrency,
          customer_currency: cartCurrencyCode,
          exchange_rate_used: cartExchangeRate,
          product_name_snapshot: normalizedProductName || null,
          variant_name_snapshot: productData.name || null,
          sku_snapshot: productData.sku || null,
          size_name_snapshot: normalizedSizeName || null,
          image_url_snapshot: mainImage,
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
    const newSubtotalBase = currentSubtotalBase + basePriceChange;
    const { error: updateCartError } = await supabase
      .from('carts')
      .update({
        total_price: newTotal,
        currency_code: cartCurrencyCode,
        exchange_rate_used: cartExchangeRate,
        subtotal_base: newSubtotalBase,
        subtotal_customer_currency: newTotal,
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
