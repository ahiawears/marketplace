export async function createTags(supabase: any, tags: string[], productId: string) {
    try {
        // --- Step 1: Delete all existing product_tags for this productId ---
        const { error: deleteError } = await supabase
            .from("product_tags")
            .delete()
            .eq("product_id", productId); // Delete where product_id matches

        if (deleteError) {
            throw deleteError;
        }
        // --- End Step 1 ---

        const tagData = [];

        for (const tag of tags) {
            // Use UPSERT to find or create the tag in the 'tags' lookup table
            const { data: newTagData, error: tagError } = await supabase
                .from("tags")
                .upsert({ name: tag }, { onConflict: ["name"] })
                .select()
                .single();

            if (tagError) {
                throw tagError;
            }

            if (newTagData) {
                tagData.push({ product_id: productId, tag_id: newTagData.id });
            }
        }

        if (tagData.length > 0) {
            // --- Step 2: Insert the new product_tags ---
            const { data: insertedTags, error: tagInsertionError } = await supabase
                .from("product_tags")
                .insert(tagData)
                .select();

            if (tagInsertionError) {
                throw tagInsertionError;
            }
            console.log("The inserted tags are: ", insertedTags);
        } else {
            console.log("No tags provided to insert, existing tags for product deleted.");
        }

    } catch (error) {
        console.error("Error managing product tags: ", error); // Changed error message
        throw error;
    }
}