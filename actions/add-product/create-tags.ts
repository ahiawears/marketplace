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
                throw tagError;
            }

            if (newTagData) {
                console.log("The tag data is: ", newTagData);
                console.log("The product id is: ", productId);
                tagData.push({ product_id: productId, tag_id: newTagData.id });
            }
        }

        if (tagData.length > 0) {
            const { data: insertedTags, error: tagInsertionError } = await supabase
                .from("product_tags")
                .insert(tagData)
                .select();

            if (tagInsertionError) {
                throw tagInsertionError;
            }
            console.log("The inserted tags are: ", insertedTags);
        }
    } catch (error) {
        console.error("Error creating tags: ", error);
        throw error;
    }
}
