"use server";

import { createClient } from "@/supabase/server";

interface SavedProductResponse {
    success: boolean;
    error: string | null;
    id: string | null;
    isSaved: boolean;
}

export const getSavedProductById = async (
    variantId: string,
    userId: string,
    isAnonymous: boolean,
    size?: string // Make size optional for the initial check on the server component
): Promise<SavedProductResponse> => {
    const supabase = await createClient();

    try {
        // Step 1: Get the user's saved list ID.
        const { data: userSaved, error: userSavedError } = await supabase
            .from('saved_list')
            .select('id')
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .single();

        if (userSavedError && userSavedError.code !== 'PGRST116') {
            console.error("Supabase Error (saved_list fetch):", userSavedError.message);
            return { success: false, error: "Error fetching saved list: " + userSavedError.message, id: null, isSaved: false };
        }
        console.log("The userSaved is: ", userSaved?.id);
        
        if (!userSaved?.id) {
            return { success: true, error: null, id: variantId, isSaved: false };
        }
        console.log("The userSaved is: ", userSaved);
        // Step 2: Check for the specific variant in the user's saved list.
        let query = supabase
            .from('saved_list_items')
            .select('id')
            .eq('saved_list_id', userSaved.id)
            .eq('variant_id', variantId);

        // If a size is provided, add it to the query for a precise check.
        if (size) {
            query = query.eq('size', size);
        }

        // Use .limit(1) to prevent errors if multiple sizes of the same product are saved.
        const { data: savedItem, error: savedItemError } = await query.maybeSingle();

        if (savedItemError && savedItemError.code !== 'PGRST116') {
            console.error("Supabase Error (saved_list_items fetch):", savedItemError.message);
            return { success: false, error: "Error fetching saved item: " + savedItemError.message, id: null, isSaved: false };
        }
        
        const isSaved = !!savedItem;

        return { success: true, error: null, id: variantId, isSaved };

    } catch (error) {
        console.error("Unexpected error in getSavedProductById:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred", id: null, isSaved: false };
    }
};
