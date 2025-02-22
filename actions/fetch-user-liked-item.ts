"use server";

import { createClient } from "@/supabase_change/server";

export const fetchUserLikedItems = async () => {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
        throw new Error("User is not authenticated");
    }

    const { data: savedItems, error: savedItemsError } = await supabase
        .from("user_saved_item")
        .select("product_id")
        .eq("user_id", userId);

    if (savedItemsError) {
        throw new Error(`Error fetching saved items: ${savedItemsError.message}`);
    }

    return savedItems || [];
};
