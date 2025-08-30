import { DeliveryZoneKey, ProductShippingDeliveryType } from "@/lib/types";

/**
 * This action assumes you have:
 * 1. A `product_shipping_details` table with columns like:
 *    id, product_id (unique), weight, length, width, height, measurement_unit.
 * 2. A `product_shipping_method_fees` table with columns like:
 *    id, product_shipping_details_id, method_type, zone_type, fee, available.
 */
export async function createProductShippingDetails(supabase: any, shippingDetails: ProductShippingDeliveryType) {
    try {
        // 1. Upsert the main shipping details record
        const { data: detailsData, error: detailsError } = await supabase
            .from('product_shipping_details')
            .upsert(
                {
                    product_id: shippingDetails.productId,
                    weight: shippingDetails.weight,
                    length: shippingDetails.dimensions.length,
                    width: shippingDetails.dimensions.width,
                    height: shippingDetails.dimensions.height,
                    measurement_unit: shippingDetails.measurementUnit,
                },
                { onConflict: 'product_id' }
            )
            .select('id')
            .single();

        if (detailsError) throw detailsError;
        const shippingDetailsId = detailsData.id;

        // 2. Clear out old method fees for this product to ensure a clean slate
        const { error: deleteError } = await supabase
            .from('product_shipping_fees')
            .delete()
            .eq('product_shipping_id', shippingDetailsId);

        if (deleteError) throw deleteError;

        // 3. Prepare and insert new method fees
        const feesToInsert = [];

        // Handle Same Day Delivery
        const sameDayMethod = shippingDetails.methods?.sameDay;
        if (sameDayMethod?.available && sameDayMethod.fee && sameDayMethod.fee > 0) {
            feesToInsert.push({
                product_shipping_details_id: shippingDetailsId,
                method_type: 'same_day',
                zone_type: 'domestic', // Same Day is always domestic
                fee: sameDayMethod.fee,
                available: true,
            });
        }

        // Handle Standard and Express Shipping
        for (const methodKey of ['standard', 'express'] as const) {
            const method = shippingDetails.methods?.[methodKey];
            if (method) {
                for (const zoneKey of Object.keys(method) as DeliveryZoneKey[]) {
                    const zoneConfig = method[zoneKey];
                    if (zoneConfig?.available && zoneConfig.fee && zoneConfig.fee > 0) {
                        feesToInsert.push({
                            product_shipping_id: shippingDetailsId,
                            method_type: methodKey,
                            zone_type: zoneKey,
                            fee: zoneConfig.fee,
                            available: true,
                        });
                    }
                }
            }
        }

        if (feesToInsert.length > 0) {
            const { error: insertError } = await supabase.from('product_shipping_fees').insert(feesToInsert);
            if (insertError) throw insertError;
        }

        return shippingDetailsId;

    } catch (error) {
        console.error("Error in createProductShippingDetails:", error);
        throw error;
    }
}
