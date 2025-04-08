export async function createColor(supabase: any, colorName: string, colorHex: string) {
    try {
        const { data: colorData, error } = await supabase
            .from("colors")
            .upsert(
                { hex_code: colorHex, name: colorName },
                { onConflict: 'hex_code' }
            )
            .select('id')
            .single();

        if (error) {
            console.log("Error upserting color:", error);
            throw error;
        }

        console.log(`Color "${colorName}" with hex "${colorHex}" processed (inserted or updated).`);
        return colorData.id;

    } catch (error) {
        console.log("Error creating color: ", error);
        throw error;
    }
}