

export async function createMaterial( supabase: any, material: string ) {
    try {
        const { data: materialData, error: materialError } = await supabase
            .from("materials")
            .select("id, name")
            .eq("name", material)
            .maybeSingle();

        console.log(materialData);
        console.log(materialError);

        if (materialError) {
            throw new Error(materialError.message);
        }

        if (materialData) {
            return materialData.id;
        } else {
            const { data: newMaterialData, error: newMaterialError } = await supabase
                .from("materials")
                .insert({name: material})
                .select()
                .single();

            if (newMaterialError) {
                throw new Error(newMaterialError.message);
            }
            return newMaterialData.id;
        }
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
}