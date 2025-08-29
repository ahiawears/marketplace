import { createClient } from "@/supabase/server.ts";
import { createColor } from "./create-color.ts";

interface Color {
    name: string;
    hexCode: string;
}

export async function createVariantColors(variantId: string, colors: Color[]) {
    if (!colors || colors.length === 0) {
        return; // Nothing to do
    }

    const supabase = await createClient();

    try {
        // 1. Get or create all color IDs by calling createColor for each one.
        const colorIds = await Promise.all(
            colors.map(color => createColor(color.name, color.hexCode))
        );

        // 2. Prepare the data for the `product_variant_colors` join table.
        const variantColorData = colorIds.map(colorId => ({
            product_variant_id: variantId,
            color_id: colorId,
        }));

        // 3. Insert all the links in a single operation.
        const { error } = await supabase
            .from("product_variant_colors")
            .insert(variantColorData);

        if (error) throw error;

    } catch (error) {
        console.error("Error in createVariantColors:", error);
        throw error;
    }
}
