import { createClient } from "@/supabase/server"

export const getOrderItems = async (brandID: string) => {
    const supabase = await createClient();

    const { data: orderData, error: orderError } = await supabase
        .from('order_items')
        .select('order_id, orders(customer_id, status)')
        .eq('brand_id', brandID);

    console.log("Fetched Data:", orderData);
    console.log("Fetch Error:", orderError); 

    if (orderError) {
        console.error("Error fetching order items:", orderError);
        throw new Error('Failed to fetch order items');
    }

    if (!orderData || orderData.length === 0) { 
        console.log("No products items found for user:", brandID);
        return []; 
    }

    return orderData;
}

