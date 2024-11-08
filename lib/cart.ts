import { createClient } from "@/supabase/server";

export const getCartItems = async (userId: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
                                .from('cart_items')
                                .select('*')
                                .eq('user_id', userId);   

    console.log("Fetched Data:", data);
    console.log("Fetch Error:", error);

    if (error) {
        console.error("Error fetching cart items:", error);
        throw new Error('Failed to fetch cart items');
    }

    if (!data || data.length === 0) {
        console.log("No cart items found for user:", userId);
        return []; // Return an empty array if no items are found
    }

    return data; // Return fetched data
}
