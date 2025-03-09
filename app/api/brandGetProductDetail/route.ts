import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid product ID" });
  } 

  const supabase = await createClient();
  const { data: productData, error } = await supabase
    .from("products_list")
    .select("*")
    .eq("product_id", id); 

  if (error) {
    return res.status(500).json({ error: "Failed to fetch product data" });
  }

  res.status(200).json(productData);
}
