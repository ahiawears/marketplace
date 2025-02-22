

export async function createTags(supabase: any, tags: string[], productId: string){
    try {
        const tagData = [];
        for (const tag of tags) {
            const { data: existingTag, error: tagError } = await supabase
                .from("tags")
                .select("id")
                .eq("name", tag)
                .maybeSingle();
            
            if (tagError) {
                throw new Error(tagError.message);
            }

            if (existingTag) {
                tagData.push({ product_id: productId, tag_id: existingTag.id});
            } else {
                const { data: newtagData, error: newTagError } = await supabase
                    .from("tags")
                    .insert({ name: tag, product_id: productId })
                    .select()
                    .single();

                if (newTagError) {
                    throw new Error(newTagError.message);
                }

                tagData.push({ product_id: productId, tag_id: newtagData.id});
            }
        }

        const { error: tagInsertionError } = await supabase.from("product_tags").insert(tagData);

        if (tagInsertionError) {
            throw new Error(`Error adding product tags: ${tagInsertionError.message}`);
        }
    } catch (error) {
        console.error("Error creating tags: ", error);
        throw error;
    }
}