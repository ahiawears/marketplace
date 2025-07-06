import { ProductShippingDeliveryType, DeliveryZoneKey } from "../../lib/types.ts";

export async function createProductShippingDetails(supabase: any, productShippingConfig: ProductShippingDeliveryType) {
    try {
        const { data: productShippingConfigData, error: productShippingConfigError } = await supabase
            .from("product_shipping_details")
            .upsert({
                product_id: productShippingConfig.productId,
                weight: productShippingConfig.weight,
                height: productShippingConfig.dimensions.height,
                width: productShippingConfig.dimensions.width,
                length: productShippingConfig.dimensions.length,
            }, {
                onConflict: "product_id",
            })
            .select('id')
            .single();

        if (productShippingConfigError) {
            throw productShippingConfigError;
        }

        if (!productShippingConfigData) {
            throw new Error("Failed to create or retrieve product shipping details ID.");
        }

        const productShippingDetailsId = productShippingConfigData.id;

        // 2. Flatten the nested 'methods' object into an array for insertion.
        const methodFeesToInsert: any[] = [];
        if (productShippingConfig.methods) {

             // Handle Same Day Delivery, which has a unique structure
            const sameDayMethod = productShippingConfig.methods.sameDay;
            if (sameDayMethod && sameDayMethod.available && sameDayMethod.fee && sameDayMethod.fee > 0) {
                methodFeesToInsert.push({
                    product_shipping_id: productShippingDetailsId,
                    method_type: 'same_day', // Use 'same_day' for DB consistency
                    zone_type: 'domestic', // Same Day is always domestic
                    available: sameDayMethod.available,
                    fee: sameDayMethod.fee,
                });
            }
            
            for (const methodKey of ["standard", "express"] as const) {
                const method = productShippingConfig.methods[methodKey];
                if (method) {
                    for (const zoneKey of Object.keys(method) as DeliveryZoneKey[]) {
                        const zoneConfig = method[zoneKey];
                        if (zoneConfig && zoneConfig.available) {
                            methodFeesToInsert.push({
                                product_shipping_id: productShippingDetailsId,
                                method_type: methodKey,
                                zone_type: zoneKey,
                                available: zoneConfig.available,
                                fee: zoneConfig.fee,
                            });
                        }
                    }
                }
            }
        }
        // 3. Delete old method fees to ensure no stale data remains.
        const { error: deleteError } = await supabase
            .from("product_shipping_fees")
            .delete()
            .eq("product_shipping_id", productShippingDetailsId);

        if (deleteError) throw deleteError;

        // 4. Insert the new, flattened method fees if there are any.
        if (methodFeesToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from("product_shipping_fees")
                .insert(methodFeesToInsert);

            if (insertError) throw insertError;
        }

        console.log("Product shipping details and method fees updated successfully for ID:", productShippingDetailsId);
        return productShippingDetailsId;
    } catch (error) {
        console.error("Error creating/updating product shipping details:", error);
        throw error;
    }
}