

export async function createMaterial( supabase: any, material: string ) {
    try {
        const { data: materialData, error: materialError } = await supabase
            .from("materials")
            .upsert({
                name: material
            }, {
                onConflict: 'name'
            })
            .select('id')
            .single();

        if (materialError) {
            throw materialError;
        }

        if (materialData) {
            console.log("The material data is: ", materialData);
            return materialData.id;
        }

        
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
}