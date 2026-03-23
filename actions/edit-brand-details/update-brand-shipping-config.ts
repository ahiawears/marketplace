"use server";

import type { ShippingConfigDataProps } from "@/lib/types";
import { createClient } from "@/supabase/server";

type DeliveryEstimate = {
  config_id: string;
  method_type: "same_day" | "standard" | "express";
  zone_type: "domestic" | "regional" | "sub_regional" | "global";
  delivery_from: number;
  delivery_to: number;
  fee: number;
  additional_item_fee: number;
  calculation_strategy: "flat" | "base_incremental";
  currency_code: string;
  base_fee: number;
};

type RawDeliveryEstimate = Omit<DeliveryEstimate, "config_id" | "currency_code" | "base_fee">;

function roundCurrencyAmount(amount: number) {
  return Number(amount.toFixed(2));
}

async function convertToBaseCurrency(
  supabase: Awaited<ReturnType<typeof createClient>>,
  amount: number,
  currencyCode: string
) {
  if (currencyCode === "USD") {
    return roundCurrencyAmount(amount);
  }

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("target_currency", currencyCode)
    .single<{ rate: number }>();

  if (error || !data?.rate || data.rate <= 0) {
    throw new Error(`No valid exchange rate found for ${currencyCode}.`);
  }

  return roundCurrencyAmount(amount / data.rate);
}

export const updateBrandShippingConfig = async (
  data: ShippingConfigDataProps,
  userId: string,
  brandCurrency: string
) => {  
 	const supabase = await createClient();
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
                default_shipping_strategy: "base_incremental",
				updated_at: new Date().toISOString(),
			},
			{
				onConflict: "brand_id",
			}
			)
			.select("id")
			.single();

		if (configError) throw configError;

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
			})(),

			// Shipping method delivery estimates
			(async () => {
				// Delete existing estimates first
				await supabase
					.from("shipping_method_delivery")
					.delete()
					.eq("config_id", config.id);

				// Prepare all delivery estimates
				const rawDeliveryEstimates: RawDeliveryEstimate[] = [
					// Same day delivery (domestic only)
					{
						method_type: "same_day" as const,
						zone_type: "domestic" as const,
						delivery_from: 0,
						delivery_to: 1,
						fee: shippingMethods.sameDayDelivery.fee,
						additional_item_fee: 0,
                        calculation_strategy: "flat",
					},
				
					// Standard shipping
					...Object.entries(shippingMethods.standardShipping.estimatedDelivery).map((entry): RawDeliveryEstimate => {
                        const [zone, details] = entry;
                        return {
						method_type: "standard" as const,
						zone_type: zone as DeliveryEstimate["zone_type"],
						delivery_from: details.from,
						delivery_to: details.to,
						fee: details.fee,
						additional_item_fee: details.additionalItemFee,
                        calculation_strategy: "base_incremental",
					    };
                    }),
				
					// Express shipping
					...Object.entries(shippingMethods.expressShipping.estimatedDelivery).map((entry): RawDeliveryEstimate => {
                        const [zone, details] = entry;
                        return {
						method_type: "express" as const,
						zone_type: zone as DeliveryEstimate["zone_type"],
						delivery_from: details.from,
						delivery_to: details.to,
						fee: details.fee,
						additional_item_fee: details.additionalItemFee,
                        calculation_strategy: "base_incremental",
					    };
                    })
				];

				const deliveryEstimates: DeliveryEstimate[] = await Promise.all(
					rawDeliveryEstimates.map(async (estimate) => ({
						config_id: config.id,
						...estimate,
						currency_code: brandCurrency,
						base_fee: await convertToBaseCurrency(supabase, estimate.fee, brandCurrency),
					}))
				);

				const { error } = await supabase
					.from("shipping_method_delivery")
					.insert(deliveryEstimates);

				if (error) throw error;
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
                    const selectedMethods = freeShipping.applicableMethods;
                    const selectedZones = freeShipping.applicableZones ?? [];
                    const baseThreshold = await convertToBaseCurrency(supabase, freeShipping.threshold, brandCurrency);

					// Prepare all rules
					const rules = selectedMethods.flatMap((method) =>
                        selectedZones.map((zone) => ({
                            config_id: config.id,
                            available: true,
                            threshold: freeShipping.threshold,
                            base_threshold: baseThreshold,
                            currency_code: brandCurrency,
                            method_type: method,
                            zone_type: zone,
                        }))
                    );

					if (rules.length > 0) {
						const { error } = await supabase
							.from("free_shipping_rules")
							.insert(rules);

						if (error) throw error;
					}
				}
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
			})(),
		]);

		return { success: true, configId: config.id, message: "Shipping config updated successfully" };
	} catch (error) {
		console.error("Shipping config update error:", error);
    	return { success: false, message: (error as Error).message };
	}
};
