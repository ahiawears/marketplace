"use server";

import { Product } from "@/lib/types";
import { createClient } from "@/supabase_change/server";

export const editProduct = async (data: Product) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products_list")
    .update({
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      weight: data.weight,
    })
    .eq("id", data.id)
    .single();

  return {
    error,
  };
};
