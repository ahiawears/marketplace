import type { ShippingConfigType } from "@/lib/types";

export const updateBrandShippingConfig = async (supabase: any, data: ShippingConfigType, userId: string) => {
    const { 
        shippingMethods, 
        shippingZones, 
        handlingTime, 
        shippingFees, 
        freeShippingThreshold, 
        freeShippingMethod,
        estimatedDeliveryTimes, 
        defaultPackage 
    } = data;
    
    try {
        // 1. Upsert main configuration
        const { data: config, error: configError } = await supabase
            .from("shipping_configurations")
            .upsert({
                brand_id: userId,
                handling_time_from: handlingTime.from,
                handling_time_to: handlingTime.to,
                free_shipping_threshold: freeShippingThreshold,
                free_shipping_method: freeShippingMethod,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'brand_id'
            })
            .select('id')
            .single();

        if (configError) throw configError;

        // 2. Process all updates in parallel
        await Promise.all([
            // Shipping methods
            supabase.from('shipping_methods').upsert([
                {
                    config_id: config.id,
                    method_type: 'same_day',
                    is_active: shippingMethods.sameDayDelivery,
                    fee: shippingFees.sameDayFee,
                    updated_at: new Date().toISOString()
                },
                {
                    config_id: config.id,
                    method_type: 'standard',
                    is_active: shippingMethods.standardShipping,
                    fee: shippingFees.standardFee,
                    updated_at: new Date().toISOString()
                },
                {
                    config_id: config.id,
                    method_type: 'express',
                    is_active: shippingMethods.expressShipping,
                    fee: shippingFees.expressFee,
                    updated_at: new Date().toISOString()
                },
                {
                    config_id: config.id,
                    method_type: 'international',
                    is_active: shippingMethods.internationalShipping,
                    fee: shippingFees.internationalFee,
                    updated_at: new Date().toISOString()
                }
            ], {
                onConflict: 'config_id,method_type'
            }),
            
            // Shipping zones
            supabase.from('shipping_zones').upsert([
                {
                    config_id: config.id,
                    zone_type: 'domestic',
                    is_active: shippingZones.domestic,
                    delivery_time_from: estimatedDeliveryTimes.domestic.from,
                    delivery_time_to: estimatedDeliveryTimes.domestic.to,
                    updated_at: new Date().toISOString()
                },
                {
                    config_id: config.id,
                    zone_type: 'regional',
                    is_active: shippingZones.regional,
                    delivery_time_from: estimatedDeliveryTimes.regional.from,
                    delivery_time_to: estimatedDeliveryTimes.regional.to,
                    updated_at: new Date().toISOString()
                },
                {
                    config_id: config.id,
                    zone_type: 'international',
                    is_active: shippingZones.international,
                    delivery_time_from: estimatedDeliveryTimes.international.from,
                    delivery_time_to: estimatedDeliveryTimes.international.to,
                    updated_at: new Date().toISOString()
                }
            ], {
                onConflict: 'config_id,zone_type'
            }),
            
            // Default package
            supabase.from('default_shipping_config')
                .upsert({
                    config_id: config.id,
                    weight: defaultPackage.weight,
                    dimensions_unit: defaultPackage.dimensions.dimensionsUnit,
                    length: defaultPackage.dimensions.length,
                    width: defaultPackage.dimensions.width,
                    height: defaultPackage.dimensions.height,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'config_id'
                })
        ]);

        return { success: true, configId: config.id };
    } catch (error) {
        console.error('Shipping config update error:', error);
        throw error;
    }
}