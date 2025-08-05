"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

interface SaveProductItem {
    variantId: string;
    size: string;
    isAnonymous: boolean; // Changed to boolean for type safety
    userId: string;
    path: string;
}

export const saveProduct = async ({
    variantId,
    size,
    isAnonymous,
    userId, 
    path
}: SaveProductItem) => {
    const supabase = await createClient();
    
    if (!userId) {
        return { 
            success: false, 
            error: "User ID is required to save a product."
        };
    }

    try {
        // Step 1: Get or create the parent saved list
        const { data: savedId, error: savedIdError } = await supabase
            .from('saved_list')
            .select('id')
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .maybeSingle();

        if (savedIdError) {
            throw new Error("Error getting saved list id: " + savedIdError.message);
        }
        let sId = savedId?.id;

        if (!sId) {
            const { data: newSavedId, error: newSavedIdError } = await supabase
                .from('saved_list')
                .insert({
                    [isAnonymous ? 'anonymous_id' : 'user_id']: userId,
                })
                .select('id')
                .single();

            if (newSavedIdError) {
                throw new Error("Error creating Saved list: " + newSavedIdError.message);
            }
            sId = newSavedId.id;
        }

        // Step 2: Check if the item already exists in the saved list
        const { data: existingItem, error: existingItemError } = await supabase
            .from('saved_list_items')
            .select('id')
            .eq('saved_list_id', sId) // <-- Add this condition to scope the check to the user's list
            .eq('variant_id', variantId)
            .eq('size', size)
            .maybeSingle();

        if (existingItemError && existingItemError.code !== 'PGRST116') {
            throw new Error("Error fetching product status: " + existingItemError.message);
        }
        
        let isSaved = false;
        
        // Step 3: Add or remove the item based on its current status
        if (existingItem) {
            // The item is already saved, so delete it.
            const { error: deleteError } = await supabase
                .from('saved_list_items')
                .delete()
                .eq('id', existingItem.id);
            
            if (deleteError) {
                throw new Error("Error unsaving product: " + deleteError.message);
            }
            isSaved = false;
        } else {
            // The item is not saved, so add it.
            const { error: insertError } = await supabase
                .from('saved_list_items')
                .insert({
                    saved_list_id: sId,
                    variant_id: variantId,
                    size: size,
                });

            if (insertError) {
                throw new Error("Error saving product: " + insertError.message);
            }
            isSaved = true;
        }

        //revalidate path
        switch (path) {
            case "productsPage":
                revalidatePath(`/products/${variantId}`);
                break;
            case "savedPage":
                revalidatePath(`/saved-list`)
                break;

            default:
                break;
        }
        return {
            success: true,
            id: variantId,
            isSaved,
        };

    } catch (error) {
        console.error("Save product error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to save product' 
        };
    }
}