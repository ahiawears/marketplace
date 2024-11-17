"use server";

import { Product } from "@/lib/types";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const editProduct = async (formData: FormData) => {

	try {
		const supabase = await createClient();

		const data: Partial<Product> = {
			id: formData.get("id") as string,
			name: formData.get("name") as string,
			description: formData.get("description") as string,
			price: parseFloat(formData.get("price") as string),
			quantity: parseInt(formData.get("quantity") as string, 10),
			weight: parseFloat(formData.get("weight") as string),
		};

		if (!data.id) {
			console.error("Product ID is missing");
			redirect("/dashboard?error=missing_id");
			return;
		}

		console.log("Updating products with data : ",data);

		const { error } = await supabase
			.from("products_list")
			.update({
			name: data.name,
			description: data.description, 
			price: data.price,
			quantity: data.quantity,
			weight: data.weight,
			})
			.eq("id", data.id);

		if (error) {
			console.error("Supabase update error:", error);
			redirect("/dashboard/edit-product/" + data.id + "?error=" + error.code);
			return;
		}
		
		console.log("Product updated successfully");
	
		revalidatePath("/dashboard/edit-product/" + data.id);
	} catch (err) {
		console.error("Error updating product:", err);
    	redirect("/dashboard/edit-product?error=server_error");
	}

};
