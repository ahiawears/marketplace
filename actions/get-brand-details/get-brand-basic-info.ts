export async function GetBrandBasicInfo(supabase: any, userId: string) {
    try {
        const { data, error } = await supabase
            .from('brands_list')
            .select('name, description')
            .eq('id', userId)
            .single();
        if (error) {
            console.error("Error getting brand basic info: ", error);
            throw new Error(`Error getting brand basic info: ${error}`);
        }
        return data;
    } catch (error) {
        throw new Error(`Error getting brand Details: ${error}`)
    }
}