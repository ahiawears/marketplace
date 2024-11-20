"use server";

import { createClient } from "@/supabase/server";

export const updateCartItemQuantity = async (quantity: number, cart_item_id: string) => {
    const supabase = await createClient();

    const { error } = await supabase
        .from("cart_items")
        .update({
            quantity: quantity,
        })
        .eq("id", cart_item_id)
        .single();

        return {
            error,
        }
    //console.log("The quantity is: ", quantity, "The cartId is: ", cart_item_id);
}