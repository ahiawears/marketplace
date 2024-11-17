"use server";

import { Product } from "@/lib/types";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const editProduct = async (formData: FormData) => {
  const supabase = await createClient();

  const data: Partial<Product> = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    quantity: parseInt(formData.get("quantity") as string, 10),
    weight: parseFloat(formData.get("weight") as string),
  };

  console.log(data);

  const { error } = await supabase
    .from("products_list")
    .update({
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      weight: data.weight,
      sku: data.sku,
    })
    .eq("id", data.id);

  if (error) {
    console.error(error);
    redirect("/dashboard/edit-product/" + data.id + "?error=" + error.code);
  }

  revalidatePath("/dashboard/edit-product/" + data.id, "layout");
};
