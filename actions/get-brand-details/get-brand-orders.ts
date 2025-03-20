export async function GetBrandOrders(supabase: any, userId: string, orderStatus: string) {
    try {
        let orderQuery = supabase
            .from('brand_orders')
            .select(`
                id, 
                order_id, 
                total_price, 
                status, 
                tracking_number,
                created_at,
                orders_items: 
                    order_id(
                        product_id(
                            name,
                            product_code,
                            sku,
                            
                        )
                    )
            `)
    } catch (error) {
        throw new Error(`Error getting brand logo URL: ${error}`);
    }
}
