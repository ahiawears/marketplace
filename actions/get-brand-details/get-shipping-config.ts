import { DEFAULT_SHIPPING_CONFIG, DeliveryZone, ShippingConfigDataProps } from "@/lib/types";
import { createClient } from "@/supabase/server"
import { RawApiData, RawApiDataSchema, RawShippingMethodDelivery, RawShippingZone, RawZoneExclusion } from "@/lib/validation-logics/shipping-config/product-shipping-config-validation";

interface ShippingConfigDataResponse {
    success: boolean;
    message: string;
    code?: "OK" | "NOT_FOUND" | "UNAUTHORIZED" | "DB_ERROR";
    data: ShippingConfigDataProps | null;
}

type InternationalZone = Exclude<DeliveryZone, 'domestic'>;

const isInternationalZone = (zone: DeliveryZone): zone is InternationalZone => {
    return zone !== 'domestic';
};

const isValidDeliveryZone = (zone: string): zone is DeliveryZone => {
    return ['domestic', 'regional', 'sub_regional', 'global'].includes(zone);
};

const createExclusionMap = (exclusions: RawZoneExclusion[] = []) => {
    const map = new Map<string, string[]>();
    exclusions.forEach(ex => {
        const key = `${ex.zone_type}:${ex.exclusion_type}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ex.value);
    });
    return map;
};

const ensureSameDayConfig = (config: ShippingConfigDataProps) => {
    config.shippingMethods.sameDayDelivery.estimatedDelivery ??= { 
        cutOffTime: "12:00", 
        timeZone: "" 
    };
    config.shippingMethods.sameDayDelivery.conditions ??= { 
        applicableCities: [], 
        excludePublicHolidays: false 
    };
};

function buildDeliveryMap(deliveries: RawShippingMethodDelivery[] | null | undefined) {
    const map = new Map<string, RawShippingMethodDelivery>();
    (deliveries ?? []).forEach((d) => {
        const key = `${d.method_type}:${d.zone_type}`;
        if (map.has(key)) {
            console.warn(`Duplicate delivery entry for ${key}, using first occurrence`);
            return;
        }
        map.set(key, d);
    });
    return map;
}


const transformApiDataToShippingDetails = (apiData?: RawApiData): ShippingConfigDataProps => {
    const newConfig = structuredClone(DEFAULT_SHIPPING_CONFIG);

    if (!apiData) return newConfig;


    // 1. Handling Time
    if (apiData.handling_time_from != null) newConfig.handlingTime.from = apiData.handling_time_from;
    if (apiData.handling_time_to != null) newConfig.handlingTime.to = apiData.handling_time_to;

    // 2. Shipping Zones (availability and exclusions)
    const zones = apiData.shipping_zones ?? [];
	const exclusionMap = createExclusionMap(apiData.zone_exclusions || []);

    zones.forEach((zoneApi) => {
		if (!isValidDeliveryZone(zoneApi.zone_type)) {
			console.warn(`Skipping invalid zone type: ${zoneApi.zone_type}`);
			return;
		}

		const zoneConfig = newConfig.shippingZones[zoneApi.zone_type];
		zoneConfig.available = zoneApi.available;

		if (zoneApi.zone_type === "domestic") {
			const citiesKey = `${zoneApi.zone_type}:city`;
			// Narrow to the domestic variant before assigning excludedCities
			(zoneConfig as { available: boolean; excludedCities: string[] }).excludedCities = exclusionMap.get(citiesKey) ?? [];
		} else if (isInternationalZone(zoneApi.zone_type)) {
			const countriesKey = `${zoneApi.zone_type}:country`;
			// Narrow to the international variant before assigning excludedCountries
			(zoneConfig as { available: boolean; excludedCountries: string[] }).excludedCountries = exclusionMap.get(countriesKey) ?? [];
		}
    });

    const deliveryMap = buildDeliveryMap(apiData.shipping_method_delivery);

    // 3. Shipping Methods
    const shippingMethods = apiData.shipping_methods ?? [];

    // Same Day Delivery
  	const sameDayApi = shippingMethods.find((m) => m.method_type === "same_day");
    if (sameDayApi) {
        ensureSameDayConfig(newConfig);
        newConfig.shippingMethods.sameDayDelivery.available = sameDayApi.available;
        
        const estimatedDelivery = newConfig.shippingMethods.sameDayDelivery.estimatedDelivery!;
        estimatedDelivery.cutOffTime = sameDayApi.cut_off_time?.substring(0, 5) ?? "12:00";
        estimatedDelivery.timeZone = sameDayApi.time_zone ?? "";

        const conditions = newConfig.shippingMethods.sameDayDelivery.conditions!;
        conditions.applicableCities = apiData.same_day_applicable_cities?.map(c => c.city_name) ?? [];

        const sameDayFeeInfo = deliveryMap.get('same_day:domestic');
        if (sameDayFeeInfo?.fee != null) {
            newConfig.shippingMethods.sameDayDelivery.fee = sameDayFeeInfo.fee;
        }
    }

    // STANDARD & EXPRESS: iterate zones and apply delivery details
    const applyMethod = (methodType: "standard" | "express", frontendKey: "standardShipping" | "expressShipping") => {
        const methodApi = shippingMethods.find((m) => m.method_type === methodType);
		if (!methodApi) {
            return;
        }
        const uiMethod = newConfig.shippingMethods[frontendKey];

        uiMethod.available = methodApi.available;

        const zoneKeys: DeliveryZone[] = ["domestic", "regional", "sub_regional", "global"];
        zoneKeys.forEach((zoneKey) => {
            const key = `${methodType}:${zoneKey}`;
            const deliveryDetail = deliveryMap.get(key);
            const existing = uiMethod.estimatedDelivery[zoneKey];

            if (existing) {
                uiMethod.estimatedDelivery[zoneKey] = {
                    from: deliveryDetail?.delivery_from ?? existing.from,
                    to: deliveryDetail?.delivery_to ?? existing.to,
                    fee: deliveryDetail?.fee ?? existing.fee,
                };
            }
        });
    };

    applyMethod("standard", "standardShipping");
    applyMethod("express", "expressShipping");

    // 4. Free Shipping
    const freeRules = apiData.free_shipping_rules ?? [];
    if (freeRules.length > 0) {
        // Take the first rule (you might want to handle multiple rules differently)
        const rule = freeRules[0];
        newConfig.freeShipping = {
            available: rule.available ?? true,
            threshold: rule.threshold ?? 0,
            applicableMethods: rule.method_type ? [rule.method_type as "standard" | "express"] : [],
        };
    }

    return newConfig;
};

export async function GetShippingConfig(brandId?: string): Promise<ShippingConfigDataResponse> {
	const supabase = await createClient();

	let actualBrandId = brandId;
	if (!actualBrandId) {
		const { data: userData } = await supabase.auth.getUser();
		if (!userData?.user) {
			return { success: false, message: "Unauthorized", code: "UNAUTHORIZED", data: null };
		}
		actualBrandId = userData.user.id;
	}

	try {
		
		const { data, error } = await supabase
			.from("shipping_configurations")
			.select(
				[
					"id",
					"brand_id",
					"handling_time_from",
					"handling_time_to",
					"shipping_methods(id,method_type,available,cut_off_time,time_zone)",
					"shipping_method_delivery(id,method_type,zone_type,delivery_from,delivery_to,fee)",
					"shipping_zones(id,zone_type,available)",
					"zone_exclusions(id,zone_type,exclusion_type,value)",
					"free_shipping_rules(id,available,threshold,method_type)",
					"same_day_applicable_cities(city_name)",
				].join(",")
			)
			.eq("brand_id", actualBrandId)
			.single<RawApiData>();

		if (error) {
			const errMsg = error.message ?? "Database error";
			// Distinguish common cases (PostgREST error codes vary by host/version)
			if (errMsg.toLowerCase().includes("permission") || errMsg.toLowerCase().includes("forbidden")) {
				return { success: false, message: "Permission denied", code: "UNAUTHORIZED", data: null };
			}
			if (errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("no rows")) {
				return { success: false, message: "No shipping configuration found", code: "NOT_FOUND", data: null };
			}
			return { success: false, message: errMsg, code: "DB_ERROR", data: null };
		}

		if (!data) {
			return { success: false, message: "No shipping configuration found", code: "NOT_FOUND", data: null };
		}

		// Runtime validate shape
		const parseResult = RawApiDataSchema.safeParse(data);
		if (!parseResult.success) {
			const issues = parseResult.error.format();
			console.warn("GetShippingConfig: DB shape mismatch", issues);
			return { success: false, message: "Invalid shipping configuration format", code: "DB_ERROR", data: null };
		}

		const validated = parseResult.data as RawApiData;
		const shippingDetails = transformApiDataToShippingDetails(validated);

		return { success: true, message: "Shipping config fetched", code: "OK", data: shippingDetails };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error occurred";
		console.error("GetShippingConfig error:", message);
		return { success: false, message, code: "DB_ERROR", data: null };
	}
}