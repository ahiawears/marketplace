// actions/user-actions/userCartActions/checkVariantStock.ts
"use server";

import { createClient } from "@/supabase/server";

interface StockCheckResult {
  success: boolean;
  sizeId: string | null;
  error?: string;
}

export const checkVariantStock = async (
  variantId: string,
  size: string,
  quantity: number
): Promise<StockCheckResult> => {
  try {
    const supabase = await createClient();

    // Get size ID
    const { data: sizeData, error: sizeError } = await supabase
      .from('sizes')
      .select('id')
      .eq('name', size)
      .single();

    if (sizeError) {
      console.error("Supabase Error (size fetch):", sizeError.message);
      return { success: false, sizeId: null, error: "Error fetching size data." };
    }
    if (!sizeData) {
      return { success: false, sizeId: null, error: "Size not found." };
    }

    // Check stock
    const { data: variantData, error: variantError } = await supabase
      .from('product_sizes')
      .select('quantity')
      .eq('product_id', variantId)
      .eq('size_id', sizeData.id)
      .single();

    if (variantError) {
      console.error("Supabase Error (stock fetch):", variantError.message);
      return { success: false, sizeId: null, error: "Error checking stock." };
    }
    
    if (!variantData || variantData.quantity < quantity) {
      return { success: false, sizeId: null, error: "Insufficient stock." };
    }

    return { success: true, sizeId: sizeData.id };
    
  } catch (error) {
    console.error("Internal server error in checkVariantStock:", error);
    return {
      success: false,
      sizeId: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred.'
    };
  }
};