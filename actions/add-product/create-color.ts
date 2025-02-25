export async function createColor(supabase: any, colorName: string, colorHex: string) {
    try {
        const { data: colorHexExists, error: colorHexError } = await supabase
            .from("colors")
            .select("id, name, hex_code")
            .eq("hex_code", colorHex)
            .maybeSingle();

        //check for error
        if (colorHexError) {
            throw new Error("Failed to search for color hex: ", colorHexError.message);
        }

        //check if the colorHex already exists in the table, if not, add it
        if (colorHexExists) {
            //check if the colorName is the same, if not update hex color name
            if (colorName !== colorHexExists.name) {
                const { error: updateColorNameError } = await supabase
                    .from("colors")
                    .update({ name: colorName })
                    .eq("hex_code", colorHex);

                if (updateColorNameError) {
                    throw new Error(`Failed to update color name: ${updateColorNameError.message}`);
                }

                console.log(`Color name "${colorHexExists.name}" in hex ${colorHex} has been updated to "${colorName}".`);
            }
            return colorHexExists.id;
        } else {
            const { data: newColorAdded, error: newColorError } = await supabase
                .from("colors")
                .insert({ hex_code: colorHex, name: colorName })
                .select()
                .single();

            if (newColorError) {
                throw new Error(`Failed to insert new color: ${newColorError.message}`);
            }
            return newColorAdded.id;
        }


    } catch (error) {
        console.error("Error creating color: ", error);
        throw error;
    }
}