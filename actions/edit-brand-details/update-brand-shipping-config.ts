import type { ShippingConfigDataProps } from "@/lib/types";

export const updateBrandShippingConfig = async (
  supabase: any,
  data: ShippingConfigDataProps,
  userId: string
) => {
  const { shippingMethods, shippingZones, handlingTime, freeShipping } = data;

  try {
    // 1. Upsert main configuration
    const { data: config, error: configError } = await supabase
      .from("shipping_configurations")
      .upsert(
        {
          brand_id: userId,
          handling_time_from: handlingTime.from,
          handling_time_to: handlingTime.to,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "brand_id",
        }
      )
      .select("id")
      .single();

    if (configError) throw configError;
    console.log(`Main config upserted. Config ID: ${config.id}`);

    // 2. Process all updates in parallel
    await Promise.all([
      // Shipping methods upsert
      (async () => {
        const { error } = await supabase
          .from("shipping_methods")
          .upsert([
            {
              config_id: config.id,
              method_type: "same_day",
              available: shippingMethods.sameDayDelivery.available,
              //fee: shippingMethods.sameDayDelivery.fee,
              cut_off_time: shippingMethods.sameDayDelivery.estimatedDelivery?.cutOffTime,
              time_zone: shippingMethods.sameDayDelivery.estimatedDelivery?.timeZone,
              //exclude_public_holidays: shippingMethods.sameDayDelivery.conditions?.excludePublicHolidays || false,
              updated_at: new Date().toISOString(),
            },
            {
              config_id: config.id,
              method_type: "standard",
              available: shippingMethods.standardShipping.available,
              updated_at: new Date().toISOString(),
            },
            {
              config_id: config.id,
              method_type: "express",
              available: shippingMethods.expressShipping.available,
              updated_at: new Date().toISOString(),
            },
          ], {
            onConflict: "config_id,method_type",
          });

        if (error) throw error;
        console.log("Shipping methods upserted successfully");
      })(),

      // Shipping method delivery estimates
      (async () => {
        // Delete existing estimates first
        await supabase
          .from("shipping_method_delivery")
          .delete()
          .eq("config_id", config.id);

        // Prepare all delivery estimates
        const deliveryEstimates = [
          // Same day delivery (domestic only)
          {
            config_id: config.id,
            method_type: "same_day",
            zone_type: "domestic",
            delivery_from: 0,
            delivery_to: 1,
            fee: shippingMethods.sameDayDelivery.fee,
          },
          
          // Standard shipping
          ...Object.entries(shippingMethods.standardShipping.estimatedDelivery).map(([zone, details]) => ({
            config_id: config.id,
            method_type: "standard",
            zone_type: zone,
            delivery_from: details.from,
            delivery_to: details.to,
            fee: details.fee,
          })),
          
          // Express shipping
          ...Object.entries(shippingMethods.expressShipping.estimatedDelivery).map(([zone, details]) => ({
            config_id: config.id,
            method_type: "express",
            zone_type: zone,
            delivery_from: details.from,
            delivery_to: details.to,
            fee: details.fee,
          }))
        ];

        const { error } = await supabase
          .from("shipping_method_delivery")
          .insert(deliveryEstimates);

        if (error) throw error;
        console.log("Delivery estimates inserted successfully");
      })(),

      // Shipping zones
      (async () => {
        const { error } = await supabase
          .from("shipping_zones")
          .upsert([
            {
              config_id: config.id,
              zone_type: "domestic",
              available: shippingZones.domestic.available,
              updated_at: new Date().toISOString(),
            },
            {
              config_id: config.id,
              zone_type: "regional",
              available: shippingZones.regional.available,
              updated_at: new Date().toISOString(),
            },
            {
              config_id: config.id,
              zone_type: "sub_regional",
              available: shippingZones.sub_regional.available,
              updated_at: new Date().toISOString(),
            },
            {
              config_id: config.id,
              zone_type: "global",
              available: shippingZones.global.available,
              updated_at: new Date().toISOString(),
            },
          ], {
            onConflict: "config_id,zone_type",
          });

        if (error) throw error;
        console.log("Shipping zones upserted successfully");
      })(),

      // Zone exclusions
      (async () => {
        // Delete existing exclusions first
        await supabase
          .from("zone_exclusions")
          .delete()
          .eq("config_id", config.id);

        // Prepare all exclusions
        const exclusions = [
          // Domestic city exclusions
          ...(shippingZones.domestic.excludedCities?.map(city => ({
            config_id: config.id,
            zone_type: "domestic",
            exclusion_type: "city",
            value: city,
          })) || []),
          
          // Regional country exclusions
          ...(shippingZones.regional.excludedCountries?.map(country => ({
            config_id: config.id,
            zone_type: "regional",
            exclusion_type: "country",
            value: country,
          })) || []),
          
          // Sub-regional country exclusions
          ...(shippingZones.sub_regional.excludedCountries?.map(country => ({
            config_id: config.id,
            zone_type: "sub_regional",
            exclusion_type: "country",
            value: country,
          })) || []),
          
          // Global country exclusions
          ...(shippingZones.global.excludedCountries?.map(country => ({
            config_id: config.id,
            zone_type: "global",
            exclusion_type: "country",
            value: country,
          })) || [])
        ];

        if (exclusions.length > 0) {
          const { error } = await supabase
            .from("zone_exclusions")
            .insert(exclusions);

          if (error) throw error;
        }
        console.log("Zone exclusions processed successfully");
      })(),

      // Free shipping rules
      (async () => {
        // Delete existing rules first
        await supabase
          .from("free_shipping_rules")
          .delete()
          .eq("config_id", config.id);

        if (freeShipping?.available) {
          // Prepare all rules
          const rules = [
            // Applicable methods
            ...freeShipping.applicableMethods.map(method => ({
              config_id: config.id,
              available: true,
              threshold: freeShipping.threshold,
              method_type: method,
            })),
            
          ];

          if (rules.length > 0) {
            const { error } = await supabase
              .from("free_shipping_rules")
              .insert(rules);

            if (error) throw error;
          }
        }
        console.log("Free shipping rules processed successfully");
      })(),

       // Applicable cities for Same Day Delivery
       (async () => {
        // Delete existing applicable cities for this config
        await supabase
          .from("same_day_applicable_cities")
          .delete()
          .eq("config_id", config.id);

        const applicableCities = shippingMethods.sameDayDelivery.conditions?.applicableCities;
        if (applicableCities && applicableCities.length > 0) {
          const cityInserts = applicableCities.map(city => ({
            config_id: config.id,
            city_name: city,
          }));
          const { error: insertError } = await supabase
            .from("same_day_applicable_cities")
            .insert(cityInserts);
          if (insertError) throw insertError;
        }
        console.log("Applicable cities for Same Day Delivery processed successfully");
      })(),
    ]);

    return { success: true, configId: config.id };
  } catch (error) {
    console.error("Shipping config update error:", error);
    throw error;
  }
};