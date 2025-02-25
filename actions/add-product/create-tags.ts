export async function createTags(supabase: any, tags: string[], productId: string) {
    try {
        const tagData = [];

        for (const tag of tags) {
            // Use UPSERT to avoid race conditions
            const { data: newTagData, error: tagError } = await supabase
                .from("tags")
                .upsert({ name: tag }, { onConflict: ["name"] }) // Ensures unique name constraint
                .select()
                .single();

            if (tagError) {
                throw new Error(`Error inserting or retrieving tag '${tag}': ${tagError.message}`);
            }

            if (newTagData) {
                tagData.push({ product_id: productId, tag_id: newTagData.id });
            }
        }

        if (tagData.length > 0) {
            const { error: tagInsertionError } = await supabase
                .from("product_tags")
                .insert(tagData);

            if (tagInsertionError) {
                throw new Error(`Error adding product tags: ${tagInsertionError.message}`);
            }
        }
    } catch (error) {
        console.error("Error creating tags: ", error);
        throw error;
    }
}
