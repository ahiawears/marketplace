// hooks/useShippingConfig.ts
import { useState, useEffect, useCallback } from 'react';
import type { ShippingConfigDataProps } from '@/lib/types';
import { DEFAULT_SHIPPING_CONFIG, DeliveryZone, ShippingDetails } from '@/app/dashboard/shipping-configuration/page';

// --- Raw API Data Interfaces ---
interface RawShippingConfigurations {
    id: string;
    brand_id: string;
    handling_time_from: number;
    handling_time_to: number;
    created_at: string;
    updated_at: string;
}

interface RawShippingMethod {
    id: string;
    config_id: string;
    method_type: "same_day" | "standard" | "express" | string; // Allow string for flexibility if API adds more
    available: boolean;
    created_at: string;
    updated_at: string;
    cut_off_time?: string | null; // "HH:MM"
    time_zone?: string | null;
}

interface RawShippingMethodDelivery {
    id: string;
    created_at: string;
    zone_type: "domestic" | "regional" | "sub_regional" | "global" | string; // Allow string
    delivery_from: number;
    delivery_to: number;
    fee: number;
    config_id: string;
    method_type: "same_day" | "standard" | "express" | string; // Allow string
}

interface RawShippingZone {
    id: string;
    config_id: string;
    zone_type: "domestic" | "regional" | "sub_regional" | "global" | string; // Allow string
    available: boolean;
    created_at: string;
    updated_at: string;
}

interface RawZoneExclusion {
    id: string;
    zone_type: string;
    exclusion_type: "country" | "city";
    value: string;
    config_id: string;
}

interface RawFreeShippingRule {
    id: string;
    config_id: string;
    available?: boolean; // This field might not exist; presence of rule implies available
    threshold?: number;
    applicable_methods?: string[]; // e.g., ["standard", "express"]
    excluded_countries?: string[];
    method_type: string;
    // Add other fields if present in your actual API response for free_shipping_rules
}

interface RawSameDayApplicableCity {
    city_name: string;
}

interface RawApiData {
    shipping_configurations: RawShippingConfigurations | null;
    shipping_methods: RawShippingMethod[] | null;
    shipping_method_delivery: RawShippingMethodDelivery[] | null;
    shipping_zones: RawShippingZone[] | null;
    zone_exclusions: RawZoneExclusion[] | null;
    same_day_applicable_cities: RawSameDayApplicableCity[] | null;
    free_shipping_rules: RawFreeShippingRule[] | null;
}

// --- Transformation Function ---
const transformApiDataToShippingDetails = (apiData?: RawApiData): ShippingConfigDataProps => {
    const newConfig = JSON.parse(JSON.stringify(DEFAULT_SHIPPING_CONFIG)) as ShippingDetails;

    if (!apiData) {
        return newConfig;
    }

    const {
        shipping_configurations,
        shipping_methods,
        shipping_method_delivery,
        shipping_zones,
        zone_exclusions,
        free_shipping_rules,
        same_day_applicable_cities,
    } = apiData;

    // 1. Handling Time
    if (shipping_configurations) {
        newConfig.handlingTime.from = shipping_configurations.handling_time_from ?? newConfig.handlingTime.from;
        newConfig.handlingTime.to = shipping_configurations.handling_time_to ?? newConfig.handlingTime.to;
    }

    // 2. Shipping Zones (availability and exclusions)
    const zonesMap: Record<string, keyof ShippingConfigDataProps['shippingZones']> = {
        domestic: 'domestic',
        regional: 'regional',
        sub_regional: 'sub_regional',
        global: 'global',
    };

    shipping_zones?.forEach(zoneApi => {
        const frontendZoneKey = zonesMap[zoneApi.zone_type];
        if (frontendZoneKey && newConfig.shippingZones[frontendZoneKey]) {
            newConfig.shippingZones[frontendZoneKey]!.available = zoneApi.available;

            if (frontendZoneKey === 'domestic') {
                newConfig.shippingZones.domestic.excludedCities = zone_exclusions
                    ?.filter(ex => ex.zone_type === zoneApi.zone_type && ex.exclusion_type === 'city')
                    .map(ex => ex.value) ?? [];
            } else if (newConfig.shippingZones[frontendZoneKey]) {
                (newConfig.shippingZones[frontendZoneKey] as any).excludedCountries = zone_exclusions
                    ?.filter(ex => ex.zone_type === zoneApi.zone_type && ex.exclusion_type === 'country')
                    .map(ex => ex.value) ?? [];
            }
        }
    });

    // 3. Shipping Methods
    // Same Day Delivery
    const sameDayMethodApi = shipping_methods?.find(m => m.method_type === 'same_day');
    if (sameDayMethodApi) {
        newConfig.shippingMethods.sameDayDelivery.available = sameDayMethodApi.available;
        if (!newConfig.shippingMethods.sameDayDelivery.estimatedDelivery) { // Should exist from default
            newConfig.shippingMethods.sameDayDelivery.estimatedDelivery = { cutOffTime: "12:00", timeZone: "" };
        }
        if (!newConfig.shippingMethods.sameDayDelivery.conditions) { // Ensure conditions object exists
            newConfig.shippingMethods.sameDayDelivery.conditions = { applicableCities: [], excludePublicHolidays: false };
        }
        newConfig.shippingMethods.sameDayDelivery.estimatedDelivery.cutOffTime =
            sameDayMethodApi.cut_off_time ? sameDayMethodApi.cut_off_time.substring(0, 5) : "12:00";
        newConfig.shippingMethods.sameDayDelivery.estimatedDelivery.timeZone = sameDayMethodApi.time_zone || "";

        newConfig.shippingMethods.sameDayDelivery.conditions.applicableCities =
            same_day_applicable_cities?.map(c => c.city_name) ?? [];

        const sameDayFeeInfo = shipping_method_delivery?.find(
            d => d.method_type === 'same_day' && d.zone_type === 'domestic' // Assuming same-day fee is for domestic
        );
        if (sameDayFeeInfo) {
            newConfig.shippingMethods.sameDayDelivery.fee = sameDayFeeInfo.fee ?? newConfig.shippingMethods.sameDayDelivery.fee;
        }
        // Note: `conditions.applicableCities` and `conditions.excludePublicHolidays` for sameDayDelivery
        // are not in the provided API structure. They will retain default values unless API provides them.
    }

    // Standard and Express Shipping
    const processDeliveryDetails = (
        methodTypeApi: 'standard' | 'express',
        frontendMethodKey: 'standardShipping' | 'expressShipping'
    ) => {
        const methodApi = shipping_methods?.find(m => m.method_type === methodTypeApi);

        if (methodApi) {
            newConfig.shippingMethods[frontendMethodKey].available = methodApi.available;

            const deliveryZoneKeys: DeliveryZone[] = ['domestic', 'regional', 'sub_regional', 'global'];
            deliveryZoneKeys.forEach(zoneKey => {
                const deliveryDetailApi = shipping_method_delivery?.find(
                    d => d.method_type === methodTypeApi && d.zone_type === zoneKey
                );
                
                if (newConfig.shippingMethods[frontendMethodKey].estimatedDelivery[zoneKey]) {
                    if (deliveryDetailApi) {
                        newConfig.shippingMethods[frontendMethodKey].estimatedDelivery[zoneKey] = {
                            from: deliveryDetailApi.delivery_from ?? newConfig.shippingMethods[frontendMethodKey].estimatedDelivery[zoneKey]!.from,
                            to: deliveryDetailApi.delivery_to ?? newConfig.shippingMethods[frontendMethodKey].estimatedDelivery[zoneKey]!.to,
                            fee: deliveryDetailApi.fee ?? newConfig.shippingMethods[frontendMethodKey].estimatedDelivery[zoneKey]!.fee,
                        };
                    }
                    // If deliveryDetailApi is not found for a zone, it retains default values.
                }
            });
        }
        // If methodApi (standard/express) itself is not found, it retains default values.
    };

    processDeliveryDetails('standard', 'standardShipping');
    processDeliveryDetails('express', 'expressShipping');

    // 4. Free Shipping
    if (free_shipping_rules && free_shipping_rules.length > 0) {
        const rule = free_shipping_rules[0]; // Assuming one rule for simplicity
        newConfig.freeShipping = {
            available: rule.available !== undefined ? rule.available : true, // If rule exists, default to true
            threshold: rule.threshold ?? 0,
            applicableMethods: rule.method_type ? [rule.method_type as "standard" | "express"] : [],
            excludedCountries: rule.excluded_countries ?? [],
        };
    } else {
        // No free shipping rules from API, ensure it's set to not available (already default, but explicit)
        newConfig.freeShipping = {
            available: false,
            threshold: 0,
            applicableMethods: [],
            excludedCountries: [],
        };
    }

    return newConfig;
};

// --- Custom Hook ---
export const useShippingConfig = (userId?: string, accessToken?: string) => {
    const [config, setConfig] = useState<ShippingConfigDataProps>(DEFAULT_SHIPPING_CONFIG);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        if (!userId || !accessToken) {
            setLoading(false);
            // Optionally set an error or just return if critical info is missing
            // setError("User ID or access token is missing."); 
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Ensure this endpoint is correct
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-shipping-config?userId=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                throw new Error(errorData.message || `Error fetching shipping config: ${response.statusText}`);
            }

            const apiResponse = await response.json();
            
            // The API response has a `data` field which contains the actual shipping data object
            if (apiResponse.data) {
                console.log("Raw Shipping Data from API (data.data):", apiResponse.data);
                const transformedConfig = transformApiDataToShippingDetails(apiResponse.data as RawApiData);
                setConfig(transformedConfig);
            } else {
                console.log("No shipping data found in API response, using default configuration.");
                setConfig(DEFAULT_SHIPPING_CONFIG); // Fallback to default if data key is missing or null
            }
        } catch (e: any) {
            console.error("Failed to fetch or transform shipping config:", e);
            setError(e.message || "An unexpected error occurred.");
            setConfig(DEFAULT_SHIPPING_CONFIG); // Fallback to default on any error
        } finally {
            setLoading(false);
        }
    }, [userId, accessToken]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return { config, loading, error, refetch: fetchConfig };
};
