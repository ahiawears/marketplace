/**
 * This action assumes you have:
 * 1. A `tags` table with `id`, `name` (unique), and `type` ('marketing', 'sustainability', 'craftsmanship') columns.
 * 2. A `product_variant_tags` join table with `product_variant_id` and `tag_id`.
 */

import { createClient } from "@/supabase/server";

interface TagInput {
    [type: string]: string[];
}

export async function createVariantTags(variantId: string, tagsByType: TagInput) {
    const supabase = await createClient();
    const allTags = [];
    for (const type in tagsByType) {
        for (const tagName of tagsByType[type]) {
            allTags.push({ name: tagName, type: type });
        }
    }

    if (allTags.length === 0) return;

    try {
        // 1. Upsert all tags to get their IDs
        const tagUpserts = allTags.map(tag => 
            supabase.from('tags').upsert(tag, { onConflict: 'name' }).select('id').single()
        );
        const tagResults = await Promise.all(tagUpserts);

        // 2. Prepare data for the join table
        const variantTagData = tagResults.map(result => {
            if (!result.data?.id) throw new Error(`Failed to get ID for a tag.`);
            return { product_variant_id: variantId, tag_id: result.data.id };
        });

        // 3. Insert into the join table
        const { error } = await supabase.from('product_variant_tags').insert(variantTagData);
        if (error) throw error;

    } catch (error) {
        console.error("Error in createVariantTags:", error);
        throw error;
    }
}
