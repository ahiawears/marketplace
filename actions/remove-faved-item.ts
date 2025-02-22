"use server";

import { createClient } from "@/supabase_change/server"

const removeFavedItem = async (id: string) => {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if(authError) {
        throw new Error(`Authentication error: ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
        throw new Error("User is not authenticated");
    }

    try {
        const { error: deleteError } = await supabase   
            .from("user_saved_item")
            .delete()
            .eq("product_id", id)
            .eq("user_id", userId);

        if (deleteError) {
            throw new Error(`Failed to remove saved item: ${deleteError.message}`);
        }

        console.log(`Removed product id: `, id);
    } catch (error) {
        throw error;
    }
} 

export default removeFavedItem;