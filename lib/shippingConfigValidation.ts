import { ShippingConfigDataProps } from "./types";

type DeliveryZone = 'domestic' | 'sub_regional' | 'regional' | 'global'

const isValidTimeFormat = (time: string): boolean => {
    if (typeof time !== 'string') return false;
    return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
};

// Map internal zone keys to user-friendly display names
const zoneDisplayNames: Record<DeliveryZone, string> = {
    domestic: "Domestic",
    sub_regional: "Sub-Regional",
    regional: "Regional",
    global: "International"
};

export const ValidateShippingConfig = (config: ShippingConfigDataProps): string[] => {
    const errors: string[] = [];

    // --- 1. Handling Time Validation ---
    const { from: handlingFrom, to: handlingTo } = config.handlingTime;
    if (handlingFrom === undefined || handlingFrom === null || isNaN(handlingFrom) || handlingFrom < 0) {
        errors.push("Handling Time 'From' must be a non-negative number.");
    }
    if (handlingTo === undefined || handlingTo === null || isNaN(handlingTo) || handlingTo < 1) {
        errors.push("Handling Time 'To' must be a greater than '0'.");
    }
    if (!isNaN(handlingFrom) && !isNaN(handlingTo) && handlingFrom >= 0 && handlingTo >= 0) {
        if (handlingTo < handlingFrom) {
            errors.push("Handling Time 'To' cannot be less than 'From'.");
        }
    }

    // 2. Shipping Methods Validation
    const { sameDayDelivery, standardShipping, expressShipping } = config.shippingMethods;

    // 2a. Same Day Delivery
    if (sameDayDelivery.available) {
        if (sameDayDelivery.fee === undefined || sameDayDelivery.fee === null || isNaN(sameDayDelivery.fee) || sameDayDelivery.fee <= 0) {
            errors.push("Same Day Delivery fee must be greater than 0.");
        }
        if (!sameDayDelivery.estimatedDelivery?.cutOffTime || !/^\d{2}:\d{2}$/.test(sameDayDelivery.estimatedDelivery.cutOffTime)) {
            errors.push("Same Day Delivery requires a valid Cut-off Time (HH:MM format).");
        }
        if (!sameDayDelivery.estimatedDelivery?.timeZone || sameDayDelivery.estimatedDelivery.timeZone.trim() === "") {
            errors.push("Same Day Delivery requires a selected Time Zone.");
        }
        if (!sameDayDelivery.conditions?.applicableCities || sameDayDelivery.conditions.applicableCities.length === 0) {
            errors.push("Same Day Delivery requires at least one applicable city/zone to be selected.");
        }
    }

    // 2b. Standard & Express Shipping (Iterate through zones)
    const methodsToCheck = [
        { method: standardShipping, name: "Standard Shipping", key: 'standardShipping' as const },
        { method: expressShipping, name: "Express Shipping", key: 'expressShipping' as const }
    ];

    methodsToCheck.forEach(({ method, name }) => {
        if (method.available) {
            const zones: DeliveryZone[] = ['domestic', 'sub_regional', 'regional', 'global'];
            let hasEnabledZones = false;
            let hasValidFees = true;
            
            zones.forEach(zone => {
                const zoneNameForError = zoneDisplayNames[zone];

                // Check only if the corresponding *shipping zone* is also enabled
                if (config.shippingZones[zone]?.available) {
                    hasEnabledZones = true;
                    const deliveryInfo = method.estimatedDelivery[zone];
                    
                    if (!deliveryInfo) {
                        errors.push(`${name}: Missing delivery details for the enabled ${zoneNameForError} zone.`);
                        hasValidFees = false;
                        return;
                    }

                    const { from, to, fee } = deliveryInfo;

                    // Delivery Time Validation
                    if (from === undefined || from === null || isNaN(from) || from < 0 || from === 0) {
                        errors.push(`${name} (${zoneNameForError}): 'From' delivery time must be greater than 0.`);
                    }
                    if (to === undefined || to === null || isNaN(to) || to < 0 || to === 0) {
                        errors.push(`${name} (${zoneNameForError}): 'To' delivery time must be greater than 0.`);
                    }
                    if (!isNaN(from) && !isNaN(to) && from >= 0 && to >= 0 && to < from) {
                        errors.push(`${name} (${zoneNameForError}): 'To' delivery time cannot be less than 'From'.`);
                    }

                    // Fee Validation (Allow 0 for free shipping per zone)
                    if (fee === undefined || fee === null || isNaN(fee) || fee < 0) {
                        errors.push(`${name} (${zoneNameForError}): Fee must be a non-negative number.`);
                        hasValidFees = false;
                    }
                }
            });
            
            // NEW VALIDATION: Check if method is enabled but has no enabled zones with valid fees
            if (hasEnabledZones && !hasValidFees) {
                errors.push(`${name} is enabled but doesn't have valid fees set for any of its enabled zones.`);
            }
            
            // NEW VALIDATION: Check if method is enabled but has no enabled zones at all
            if (method.available && !hasEnabledZones) {
                errors.push(`${name} is enabled but no shipping zones are enabled for this method.`);
            }
        }
    });

    // --- 3. Shipping Zones Validation ---
    if (config.shippingZones.domestic.available) {
        if (!Array.isArray(config.shippingZones.domestic.excludedCities)) {
            errors.push("Domestic zone 'excludedCities' must be an array.");
        }
    }
    if (config.shippingZones.sub_regional.available) {
        if (!Array.isArray(config.shippingZones.sub_regional.excludedCountries)) {
            errors.push("Sub-Regional zone 'excludedCountries' must be an array.");
        }
    }
    if (config.shippingZones.regional.available) {
        if (!Array.isArray(config.shippingZones.regional.excludedCountries)) {
            errors.push("Regional zone 'excludedCountries' must be an array.");
        }
    }
    if (config.shippingZones.global.available) {
        if (!Array.isArray(config.shippingZones.global.excludedCountries)) {
            errors.push("International zone 'excludedCountries' must be an array.");
        }
    }

    // --- 4. Free Shipping Validation ---
    if (config.freeShipping?.available) {
        const threshold = config.freeShipping.threshold;
        const methods = config.freeShipping.applicableMethods;

        if (threshold === undefined || threshold === null || isNaN(threshold) || threshold <= 0) {
            errors.push("Free Shipping threshold must be greater than 0 when free shipping is enabled.");
        }

        if (!methods || !Array.isArray(methods) || methods.length === 0) {
            errors.push("At least one shipping method (Standard or Express) must be selected for Free Shipping when it's enabled.");
        } else {
            // Check if selected free shipping methods are actually available
            methods.forEach(methodKey => {
                if (methodKey === 'standard' && !standardShipping.available) {
                    errors.push("Free Shipping is set for Standard Shipping, but Standard Shipping is not enabled.");
                }
                if (methodKey === 'express' && !expressShipping.available) {
                    errors.push("Free Shipping is set for Express Shipping, but Express Shipping is not enabled.");
                }
            });
        }
    }

    // --- Final Check: At least one shipping zone enabled if standard/express is enabled? ---
    const anyZoneEnabled = config.shippingZones.domestic.available || 
                           config.shippingZones.sub_regional.available || 
                           config.shippingZones.regional.available || 
                           config.shippingZones.global.available;
    
    if ((standardShipping.available || expressShipping.available) && !anyZoneEnabled) {
        errors.push("If Standard or Express shipping is enabled, at least one Shipping Zone (Domestic, Sub-Regional, etc.) must also be enabled.");
    }
    
    return errors;
}