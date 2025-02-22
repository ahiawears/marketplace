"use server";

import { createClient } from "@/supabase_change/server";

interface SavedItem {
    id: string;
    isLiked: boolean;
}

const addItemToUserLiked = async (savedItem: SavedItem) => {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
        throw new Error("User is not authenticated");
    }

    try {
        const { data: existingItems, error: selectError } = await supabase
            .from("user_saved_item")
            .select("id")
            .eq("user_id", userId)
            .eq("product_id", savedItem.id);

        if (selectError) {
            throw new Error(`Failed to check existing saved item: ${selectError.message}`);
        }

        if (existingItems && existingItems.length > 0) {
            const { error: deleteError } = await supabase
                .from("user_saved_item")
                .delete()
                .eq("id", existingItems[0].id);

            if (deleteError) {
                throw new Error(`Failed to remove saved item: ${deleteError.message}`);
            }

            console.log(`Removed product ID: ${savedItem.id} from saved items.`);
        } else {
            const { error: insertError } = await supabase
                .from("user_saved_item")
                .insert({
                    user_id: userId,
                    product_id: savedItem.id,
                });

            if (insertError) {
                throw new Error(`Failed to save item: ${insertError.message}`);
            }

            console.log(`Saved product ID: ${savedItem.id} to saved items.`);
        }
    } catch (error) {
        console.error("Error in addItemToUserLiked:", error);
        throw error;
    }
};

export default addItemToUserLiked;
