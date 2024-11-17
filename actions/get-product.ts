import { Product } from "@/lib/types";
import { createClient } from "@/supabase/server";

export const getProduct = async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products_list")
    .select("*")
    .eq("id", id)
    .single<Product>();

  return {
    data,
    error,
  };
};
