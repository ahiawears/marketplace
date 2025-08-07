import { createClient } from "@/supabase/server";

interface SizeData {
    product_id: string;
    size_id: { name: string };
    quantity: number;
    product_measurements?: Array<{
        measurement_type_id: { name: string };
        value: number;
        measurement_unit: string;
    }>;
}

export const getSavedItems = async (userId: string, isAnonymous: boolean) => {
    const supabase = await createClient();

    try {
        // Get the user's saved_list
        const { data: savedList, error: savedListError } = await supabase
            .from('saved_list')
            .select('id')
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .single();

        if (savedListError) {
            if (savedListError.code === 'PGRST116') {
                return { productsWithImages: [] };
            }
            console.error("Error finding user saved list id:", savedListError);
            throw new Error(savedListError.message || "Failed to find user saved list id");
        }

        if (!savedList) {
            console.log("No saved items found for user:", userId);
            return { productsWithImages: [] };
        }

        const savedListId = savedList.id;

        // Fetch the saved list items
        const { data: savedItems, error: savedItemsError } = await supabase
            .from('saved_list_items')
            .select('id, size, variant_id(id, name, base_currency_price)')
            .eq('saved_list_id', savedListId);

        if (savedItemsError) {
            if (savedItemsError.code === 'PGRST116') {
                return { productsWithImages: [] };
            }
            console.error("Error fetching saved list items:", savedItemsError)
            throw new Error(savedItemsError.message || "Failed to fetch saved list items");
        }

        if (!savedItems || savedItems.length === 0) {
            return { productsWithImages: [] };
        }

        const variantIds = savedItems.map((item: any) => item.variant_id.id);

        // Fetch variant colors
        const { data: variantColors, error: variantColorsError } = await supabase
            .from('product_variants')
            .select('id, color_id(name, hex_code)')
            .in('id', variantIds);

        if (variantColorsError) {
            throw new Error(variantColorsError.message || "Failed to fetch variant colors");
        }
        const colorMap = new Map(variantColors.map((color: any) => [
            color.id,
            color.color_id ? { name: color.color_id.name, hex: color.color_id.hex_code } : null
        ]));

        // Fetch the main images of each variant
        const { data: variantImages, error: variantImagesError } = await supabase
            .from('product_images')
            .select('image_url, product_variant_id')
            .in('product_variant_id', variantIds)
            .eq('is_main', true);

        if (variantImagesError) {
            throw new Error(variantImagesError.message || "Failed to fetch variant images");
        }
        const imageMap = new Map(variantImages.map((image) => [image.product_variant_id, image.image_url]));

        // --- CORRECTED SECTION ---
        // Fetch all sizes for the variants
        const { data: sizes, error: sizesError } = await supabase
            .from('product_sizes')
            .select(`
                product_id,
                size_id(name),
                quantity,
                product_measurements(
                    measurement_type_id(name),
                    value,
                    measurement_unit
                )
            `)
            .in('product_id', variantIds);

        if (sizesError) {
            throw new Error(sizesError.message || "Failed to fetch product sizes");
        }

        const typedSizes = sizes as unknown as SizeData[];

        // Create a map to group sizes by their product_variant_id
        const sizesMap = new Map<string, Record<string, { quantity: number; measurements: any[] }>>();
        
        typedSizes?.forEach(size => {
            if (!sizesMap.has(size.product_id)) {
                sizesMap.set(size.product_id, {});
            }
            const sizeName = size.size_id.name;
            const variantSizes = sizesMap.get(size.product_id)!;
            variantSizes[sizeName] = {
                quantity: size.quantity,
                measurements: size.product_measurements?.map(m => ({
                    type: m.measurement_type_id.name,
                    value: m.value,
                    unit: m.measurement_unit
                })) || []
            };
        });

        const productsWithImages = savedItems.map((item: any) => {
            const variantId = item.variant_id.id;
            return {
                ...item,
                color: colorMap.get(variantId),
                image: imageMap.get(variantId),
                // Correctly get the sizes for the specific variant from the map
                sizes: sizesMap.get(variantId) || {}
            };
        });

        return { productsWithImages };

    } catch (error) {
        console.error(error instanceof Error ? error.message : "Failed to fetch saved items");
        throw error;
    }
}
