export async function FetchBrandProducts(supabase: any, brandId: string) {
    try {
        const { data, error } = await supabase
            .from('products_list')
            .select('id, name, category_id(name), subcategory_id(name), season_id(name)')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            console.log("No products found for the brand.");
            return [];
        }

        console.log("Products fetched successfully:", data);
        return data;
    } catch (error) {
        console.error("Error fetching brand products:", error);
        throw new Error(`Error fetching brand products: ${error}`);
    }
}