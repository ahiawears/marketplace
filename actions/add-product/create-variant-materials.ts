import { MaterialComposition } from "@/components/brand-dashboard/add-product/variants-details-form";

/**
 * This action assumes you have:
 * 1. A `materials` table with at least `id` and `name` (unique) columns.
 * 2. A `product_variant_materials` join table with `product_variant_id`, `material_id`, and `percentage`.
 */
export async function createVariantMaterials(supabase: any, variantId: string, materials: MaterialComposition[]) {
    if (!materials || materials.length === 0) {
        return;
    } 

    try {
        // 1. Upsert all materials to get their IDs
        const materialUpserts = materials.map(m => 
            supabase.from('materials').upsert({ name: m.name }, { onConflict: 'name' }).select('id').single()
        );
        const materialResults = await Promise.all(materialUpserts);

        // 2. Prepare data for the join table
        const variantMaterialData = materials.map((material, index) => {
            const materialId = materialResults[index].data?.id;
            if (!materialId) throw new Error(`Failed to get ID for material: ${material.name}`);
            return {
                product_variant_id: variantId,
                material_id: materialId,
                percentage: material.percentage,
            };
        });

        // 3. Insert into the join table
        const { error } = await supabase.from('product_variant_materials').insert(variantMaterialData);
        if (error) throw error;

    } catch (error) {
        console.error("Error in createVariantMaterials:", error);
        throw error;
    }
}
