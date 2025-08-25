"use client";

import { ValidateShippingConfig } from "@/lib/shippingConfigValidation";
import { ShippingDetails, DeliveryZone, DEFAULT_SHIPPING_CONFIG } from "@/lib/types";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import ZoneToggle from "../brand-shipping-config/zone-toggle";
import MethodToggle from "../brand-shipping-config/shipping-methods";
import FreeShippingSection from "../brand-shipping-config/free-shipping-section";
import { Button } from "../ui/button";
import { updateBrandShippingConfig } from "@/actions/edit-brand-details/update-brand-shipping-config";


// Define the type for the fields within same-day delivery
type SameDayField = 'cutOffTime' | 'timeZone';

/**
 * Performs a deep comparison of two objects of ShippingDetails.
 * @param {ShippingDetails} obj1 The first object to compare.
 * @param {ShippingDetails} obj2 The second object to compare.
 * @returns {boolean} True if the objects are identical, false otherwise.
 */
function areShippingConfigsEqual(obj1: ShippingDetails, obj2: ShippingDetails): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null) {
        return false;
    }
    
    // Check handling time
    if (obj1.handlingTime.from !== obj2.handlingTime.from || obj1.handlingTime.to !== obj2.handlingTime.to) {
        return false;
    }

    // Check shipping methods
    const methods: (keyof ShippingDetails['shippingMethods'])[] = ['sameDayDelivery', 'standardShipping', 'expressShipping'];
    for (const method of methods) {
        if (obj1.shippingMethods[method].available !== obj2.shippingMethods[method].available) {
            return false;
        }
    }
    
    // Explicitly compare Same Day Delivery details
    if (obj1.shippingMethods.sameDayDelivery.fee !== obj2.shippingMethods.sameDayDelivery.fee) {
        return false;
    }
    if (obj1.shippingMethods.sameDayDelivery.estimatedDelivery?.cutOffTime !== obj2.shippingMethods.sameDayDelivery.estimatedDelivery?.cutOffTime ||
        obj1.shippingMethods.sameDayDelivery.estimatedDelivery?.timeZone !== obj2.shippingMethods.sameDayDelivery.estimatedDelivery?.timeZone) {
        return false;
    }
    if (obj1.shippingMethods.sameDayDelivery.conditions?.excludePublicHolidays !== obj2.shippingMethods.sameDayDelivery.conditions?.excludePublicHolidays ||
        JSON.stringify(obj1.shippingMethods.sameDayDelivery.conditions?.applicableCities) !== JSON.stringify(obj2.shippingMethods.sameDayDelivery.conditions?.applicableCities)) {
        return false;
    }

    // Explicitly compare Standard and Express shipping details
    const zones: DeliveryZone[] = ['domestic', 'regional', 'sub_regional', 'global'];
    const complexMethods: ('standardShipping' | 'expressShipping')[] = ['standardShipping', 'expressShipping'];
    for (const method of complexMethods) {
        for (const zone of zones) {
            const zoneDetails1 = obj1.shippingMethods[method].estimatedDelivery[zone];
            const zoneDetails2 = obj2.shippingMethods[method].estimatedDelivery[zone];
            if (zoneDetails1?.from !== zoneDetails2?.from ||
                zoneDetails1?.to !== zoneDetails2?.to ||
                zoneDetails1?.fee !== zoneDetails2?.fee) {
                return false;
            }
        }
    }
    
    // Check shipping zones
    const zoneKeys: (keyof ShippingDetails['shippingZones'])[] = ['domestic', 'regional', 'sub_regional', 'global'];
    for (const zone of zoneKeys) {
        if (obj1.shippingZones[zone].available !== obj2.shippingZones[zone].available) {
            return false;
        }
        if ('excludedCities' in obj1.shippingZones[zone] && 'excludedCities' in obj2.shippingZones[zone]) {
            if (JSON.stringify(obj1.shippingZones[zone].excludedCities) !== JSON.stringify(obj2.shippingZones[zone].excludedCities)) {
                return false;
            }
        }
        if ('excludedCountries' in obj1.shippingZones[zone] && 'excludedCountries' in obj2.shippingZones[zone]) {
             if (JSON.stringify(obj1.shippingZones[zone].excludedCountries) !== JSON.stringify(obj2.shippingZones[zone].excludedCountries)) {
                return false;
            }
        }
    }
    
    // Check free shipping
    if (obj1.freeShipping?.available !== obj2.freeShipping?.available ||
        obj1.freeShipping?.threshold !== obj2.freeShipping?.threshold ||
        JSON.stringify(obj1.freeShipping?.applicableMethods) !== JSON.stringify(obj2.freeShipping?.applicableMethods) ||
        JSON.stringify(obj1.freeShipping?.excludedCountries) !== JSON.stringify(obj2.freeShipping?.excludedCountries)) {
        return false;
    }

    return true;
}

interface ShippingConfigurationProps {
    userId: string;
    data: ShippingDetails;
    brandCountry: string;
    brandCurrency: string;
}

const ShippingConfigurationForm: FC<ShippingConfigurationProps> = ({ userId, data, brandCountry, brandCurrency }) => {
    const [config, setConfig] = useState<ShippingDetails>(DEFAULT_SHIPPING_CONFIG);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);


    useEffect(() => {
        if (data === null) {
            setConfig(DEFAULT_SHIPPING_CONFIG);
        } else {
            setConfig(data);
        }

    }, [data, DEFAULT_SHIPPING_CONFIG]);

    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const validateConfigAndUpdateButton = () => {
        const validationErrors = ValidateShippingConfig(config);
        setIsButtonDisabled(validationErrors.length > 0);
    };

    const hasChanges = !areShippingConfigsEqual(config, data);

    const getCombinedExcludedCountries = (zones: ShippingDetails['shippingZones']) => {
        const combined = new Set<string>();
        zones.regional?.excludedCountries?.forEach(c => combined.add(c));
        zones.sub_regional?.excludedCountries?.forEach(c => combined.add(c));
        zones.global?.excludedCountries?.forEach(c => combined.add(c));
        return Array.from(combined);
    };

    useEffect(() => {
        const validationErrors: string[] = ValidateShippingConfig(config);
        setIsFormValid(validationErrors.length === 0);
    }, [config]);

    const handleMethodToggle = (method: keyof ShippingDetails['shippingMethods'], checked: boolean) => {
        const methodDbKeyMap: { [key in keyof ShippingDetails['shippingMethods']]?: string } = {
            sameDayDelivery: 'same_day',
            standardShipping: 'standard',
            expressShipping: 'express',
        };
        const dbKey = methodDbKeyMap[method]; 
        setConfig(prev => {
            const newState = {
                ...prev,
                shippingMethods: {
                    ...prev.shippingMethods,
                    [method]: {
                        ...prev.shippingMethods[method],
                        available: checked
                    }
                }
            }
            return newState;
        })
    }

    const handleZoneToggle = (zone: keyof ShippingDetails['shippingZones'], checked: boolean) => {
        setConfig(prev => {
            const newState = {
                ...prev,
                shippingZones: {
                    ...prev.shippingZones,
                    [zone]: {
                        ...prev.shippingZones[zone],
                        available: checked
                    }
                }
            }
            return newState;
        })
    }

    const handleFreeShippingToggle = (checked: boolean) => {
        setConfig(prev => {
            const combinedExcluded = checked ? getCombinedExcludedCountries(prev.shippingZones) : [];
            return {
                ...prev,
                freeShipping: {
                    ...(prev.freeShipping ?? { threshold: 0, applicableMethods: [], excludedCountries: [] }),
                    available: checked,
                    threshold: checked ? (prev.freeShipping?.threshold ?? 0) : 0,
                    applicableMethods: checked ? (prev.freeShipping?.applicableMethods ?? []) : [],
                    excludedCountries: combinedExcluded
                }
            };
        });
    };

    const handleFreeShippingThresholdChange = (value: number) => {
        setConfig(prev => ({
            ...prev,
            freeShipping: {
                ...(prev.freeShipping ?? { available: false, applicableMethods: [], excludedCountries: [] }), 
                threshold: value 
            }
        }));
    };

    const handleFreeShippingMethodsChange = (methods: ("standard" | "express")[]) => {
        setConfig(prev => ({
            ...prev,
            freeShipping: {
                ...(prev.freeShipping ?? { available: false, threshold: 0, excludedCountries: [] }),
                applicableMethods: methods
            }
        }));
    };
    const handleSameDayFeeChange = (value: number) => {
        setConfig(prev => ({
            ...prev,
            shippingMethods: {
                ...prev.shippingMethods,
                sameDayDelivery: {
                    ...prev.shippingMethods.sameDayDelivery,
                    fee: value
                }
            }
        }))
    }

    const handleZoneFeeChange = (
        method: 'standardShipping' | 'expressShipping',
        zone: DeliveryZone,
        value: number
    ) => {
        setConfig(prev => ({
            ...prev,
            shippingMethods: {
                ...prev.shippingMethods,
                [method]: {
                    ...prev.shippingMethods[method],
                    estimatedDelivery: {
                        ...prev.shippingMethods[method].estimatedDelivery,
                        [zone]: { ...prev.shippingMethods[method].estimatedDelivery[zone], fee: value }
                    }
                }
            }
        }));
    };

    const handleSameDayInputChange = (field: SameDayField, value: string) => {
        setConfig(prev => {
            const currentSameDay = prev.shippingMethods.sameDayDelivery;
            const estimatedDelivery = currentSameDay.estimatedDelivery ?? { cutOffTime: '', timeZone: '' }; // Provide default if null/undefined

            return {
                ...prev,
                shippingMethods: {
                    ...prev.shippingMethods,
                    sameDayDelivery: {
                        ...currentSameDay,
                        estimatedDelivery: {
                            ...estimatedDelivery,
                            [field]: value
                        }
                    }
                }
            };
        });
    };

    const handleDeliveryTimeChange = (
        method: keyof ShippingDetails['shippingMethods'],
        zone: DeliveryZone,
        field: 'from' | 'to',
        value: number
    ) => {
        setConfig(prev => {
            if (!prev.shippingMethods[method]?.estimatedDelivery) {
                toast.error(`Estimated delivery not configured for method: ${method}`);
                return prev; 
            }
            if (!(zone in prev.shippingMethods[method].estimatedDelivery!)) {
                toast.error(`Estimated delivery not configured for zone: ${zone}`); 
                return prev;
            }

            return {
                ...prev,
                shippingMethods: {
                    ...prev.shippingMethods,
                    [method]: {
                        ...prev.shippingMethods[method],
                        estimatedDelivery: {
                            ...prev.shippingMethods[method].estimatedDelivery,
                            [zone]: {
                                ...(prev.shippingMethods[method].estimatedDelivery as any)[zone], // Cast to any to bypass strict typing here if needed, or use a more specific type guard
                                [field]: value
                            }
                        }
                    }
                }
            };
        });
    };

    const handleSave = async () => {
        setErrorMessage("");

        const validationErrors = ValidateShippingConfig(config);
    
        if (validationErrors.length > 0) {
            setErrorMessage(validationErrors.join('\n'));
            setIsSaving(false);
            return;
        }

        try {
            setIsSaving(true);
            const response = await updateBrandShippingConfig(config, userId);

            if (response.success) {
                toast.success(response.message);
            } else {
                const errorMessage = response.message || "An error occurred while saving the configuration.";
                toast.error(errorMessage);
                setErrorMessage(errorMessage);
            }
           
        } catch (error) {
            let uploadErrorMessage;
            if (error instanceof Error) {
                uploadErrorMessage = error.message;
            }
            toast.error(uploadErrorMessage || "An unexpected error occurred while saving the configuration.");
            setErrorMessage(uploadErrorMessage || "An unexpected error occurred while saving the configuration.");
        } finally {
            setIsSaving(false);
        }
    }


    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 border-2">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                    Shipping & Fulfillment Settings
                </h2>
                <p className="subtitle text-gray-500">
                    Configure how your orders are delivered — set shipping methods, fees, and delivery zones.
                </p>
            </div>

            {/* Handling time selection */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                <div className="space-y-2 my-2">
                    <h3 className="text-lg font-semibold">
                        Handling Time
                    </h3>
                    <p className="subtitle text-gray-500">
                        Specify the time (in days) it takes to prepare an order for shipment after it's placed. This does <span className="font-extrabold text-black">NOT</span> include delivery time.
                    </p>
                </div>
                <div className="flex items-center space-x-2 w-full">
                    <div className="w-full">
                        <Input
                            name="handlingTimeFrom"
                            type="number"
                            className="border-2 w-full"
                            value={config.handlingTime.from === 0 ? 0 : config.handlingTime.from}
                            onChange={(e) => setConfig(prev => ({
                                ...prev,
                                handlingTime: {
                                    ...prev.handlingTime,
                                    from: Number(e.target.value)
                                }
                            }))}
                        />
                        <label htmlFor="handlingTimeFrom" className="block text-sm font-medium text-gray-700 my-2">From:</label>
                    </div>
                    <div className="w-full">
                        <Input
                            name="handlingTimeTo"
                            type="number"
                            value={config.handlingTime.to === 0 ? 0 : config.handlingTime.to}
                            onChange={(e) => setConfig(prev => ({
                                ...prev,
                                handlingTime: {
                                    ...prev.handlingTime,
                                    to: Number(e.target.value),
                                }
                            }))}
                            className="border-2 w-full"
                        />
                        <label htmlFor="handlingTimeTo" className="block text-sm font-medium text-gray-700 my-2">To:</label>
                    </div>
                </div>
            </div>
            {/* Shipping Zones Section */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                <div className="space-y-2 my-2">
                    <h3 className="text-lg font-semibold">
                        Shipping Zones
                    </h3>
                    <p className="subtitle text-gray-500">
                        Choose your shipping options. For each method you enable, specify the customer fee and the typical delivery timeframe (in days).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ZoneToggle
                        label={`Domestic`}
                        checked={config.shippingZones.domestic.available}
                        onToggle={(checked) => handleZoneToggle('domestic', checked)}
                        country={brandCountry}
                         // Pass the selected cities for Same Day Delivery
                        selectedCities={config.shippingZones.domestic.excludedCities}
                        // Pass the handler to update the selected cities in the parent state
                        onCitiesChange={(cities) => {
                            setConfig(prev => ({
                                ...prev,
                                shippingZones: {
                                    ...prev.shippingZones,
                                    domestic: { ...prev.shippingZones.domestic, excludedCities: cities }
                                }
                            }));
                         }}
                    />

                    <ZoneToggle
                        label={`Sub-Region`}
                        checked={config.shippingZones.sub_regional.available}
                        onToggle={(checked) => handleZoneToggle('sub_regional', checked)}
                        country={brandCountry}
                        // Pass excluded countries and handler
                        excludedCountries={config.shippingZones.sub_regional.excludedCountries}
                        onExcludedCountriesChange={(countries) => {
                            setConfig(prev => ({
                                ...prev,
                                shippingZones: {
                                    ...prev.shippingZones,
                                    sub_regional: { ...prev.shippingZones.sub_regional, excludedCountries: countries }
                                }
                            }));
                        }}
                    />

                     <ZoneToggle
                        label={`Continental`}
                        checked={config.shippingZones.regional.available}
                        onToggle={(checked) => handleZoneToggle('regional', checked)}
                        country={brandCountry}
                        // Pass excluded countries and handler
                        excludedCountries={config.shippingZones.regional.excludedCountries}
                        onExcludedCountriesChange={(countries) => {
                            setConfig(prev => ({
                                ...prev,
                                shippingZones: {
                                    ...prev.shippingZones,
                                    regional: { ...prev.shippingZones.regional, excludedCountries: countries }
                                }
                            }));
                        }}
                    />
                    
                     <ZoneToggle
                        label="International"
                        checked={config.shippingZones.global.available}
                        onToggle={(checked) => handleZoneToggle('global', checked)}
                        country={brandCountry}
                        // Pass excluded countries and handler
                        excludedCountries={config.shippingZones.global.excludedCountries}
                        onExcludedCountriesChange={(countries) => {
                            setConfig(prev => ({
                                ...prev,
                                shippingZones: {
                                    ...prev.shippingZones,
                                    global: { ...prev.shippingZones.global, excludedCountries: countries }
                                }
                            }));
                        }}
                    />
                </div>
            </div>
            {/* Shipping Methods Section */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                {(() => {
                    //determine which areas are zones are applicable
                    const availableAreas: ("domestic" | "regional" | "sub_regional" |"global")[] = [];
                    if (config.shippingZones.domestic.available) {
                        availableAreas.push("domestic");
                    }

                    if (config.shippingZones.sub_regional.available) {
                        availableAreas.push("sub_regional");
                    } 

                    if (config.shippingZones.regional.available) {
                        availableAreas.push("regional");
                    } 

                    if (config.shippingZones.global.available) {
                        availableAreas.push("global");
                    } 
                        
                    return (
                        <div>
                            <div className="space-y-2 my-2">
                                <h3 className="text-lg font-semibold">
                                    Shipping Methods
                                </h3>
                                <p className="subtitle text-gray-500">
                                    Choose your shipping options. For each method you enable, specify the customer fee and the typical delivery timeframe (in days).
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Same Day Delivery */}
                                <MethodToggle
                                    label="Same Day Delivery"
                                    checked={config.shippingMethods.sameDayDelivery.available}
                                    fee={config.shippingMethods.sameDayDelivery.fee}
                                    onToggle={(checked) => handleMethodToggle('sameDayDelivery', checked)}
                                    onFeeChange={handleSameDayFeeChange} // Use the specific handler for same-day fee
                                    currency={brandCurrency}
                                    country={brandCountry}
                                    cutOffTimeValue={config.shippingMethods.sameDayDelivery.estimatedDelivery?.cutOffTime}
                                    timeZoneValue={config.shippingMethods.sameDayDelivery.estimatedDelivery?.timeZone}
                                    onSameDayInputChange={handleSameDayInputChange}
                                    estimatedDelivery={{}} // Pass empty object or adjust type
                                    onDeliveryTimeChange={() => {}} // Dummy function
                                    onCitiesChange={(cities) => {
                                        setConfig(prev => ({
                                            ...prev, // Keep the rest of the config
                                            shippingMethods: {
                                                ...prev.shippingMethods,
                                                sameDayDelivery: {
                                                    ...prev.shippingMethods.sameDayDelivery, // Keep its other properties
                                                    conditions: { // Target the conditions object
                                                        ...(prev.shippingMethods.sameDayDelivery.conditions ?? { excludePublicHolidays: false }), // Keep other conditions, provide default if needed
                                                        applicableCities: cities // Update the applicableCities array
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    onZoneFeeChange={() => {}} // Dummy function for zone fee
                                    selectedCities={config.shippingMethods.sameDayDelivery.conditions?.applicableCities}
                                />

                                {/* Standard Shipping */}
                                <MethodToggle
                                    label="Standard Shipping"
                                    checked={config.shippingMethods.standardShipping.available}
                                    fee={0} // Pass a dummy fee, it won't be used/rendered
                                    onToggle={(checked) => handleMethodToggle('standardShipping', checked)}
                                    onFeeChange={() => {}} 
                                    currency={brandCurrency}
                                    enabledZones={availableAreas}
                                    country={brandCountry}
                                    estimatedDelivery={config.shippingMethods.standardShipping.estimatedDelivery}
                                    onDeliveryTimeChange={(zone, field, value) => handleDeliveryTimeChange('standardShipping', zone as DeliveryZone, field, value)}
                                    onZoneFeeChange={(zone, value) => handleZoneFeeChange('standardShipping', zone as DeliveryZone, value)} // Pass zone fee handler
                                    onSameDayInputChange={() => {}}
                                />

                                {/* Express Shipping */}
                                <MethodToggle
                                    label="Express Shipping"
                                    checked={config.shippingMethods.expressShipping.available}
                                    fee={0}
                                    onToggle={(checked) => handleMethodToggle('expressShipping', checked)}
                                    onFeeChange={() => {}} 
                                    currency={brandCurrency}
                                    enabledZones={availableAreas}
                                    country={brandCountry}
                                    estimatedDelivery={config.shippingMethods.expressShipping.estimatedDelivery}
                                    onDeliveryTimeChange={(zone, field, value) => handleDeliveryTimeChange('expressShipping', zone as DeliveryZone, field, value)}
                                    onZoneFeeChange={(zone, value) => handleZoneFeeChange('expressShipping', zone as DeliveryZone, value)} // Pass zone fee handler
                                    onSameDayInputChange={() => {}}
                                />
                            </div>
                        </div>
                    );
                })()}
            </div>
            {/* Free Shipping Section */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                {(() => {
                    // Determine which methods (standard/express) are currently available overall
                    const availableMethodsForFreeShipping: ("standard" | "express")[] = [];
                    if (config.shippingMethods.standardShipping.available) {
                        availableMethodsForFreeShipping.push("standard");
                    }
                    if (config.shippingMethods.expressShipping.available) {
                        availableMethodsForFreeShipping.push("express");
                    }

                    // Get combined excluded countries from zones
                    const combinedExcludedCountries = getCombinedExcludedCountries(config.shippingZones);

                    return (
                        <div>
                             <div className="space-y-2 my-2">
                                <h3 className="text-lg font-semibold">
                                    Free Shipping Settings
                                </h3>
                                <p className="subtitle text-gray-500">
                                    Configure free shipping eligibility by setting a minimum order threshold and selecting the applicable shipping methods.
                                </p>
                            </div>
                            <FreeShippingSection
                                label="Free Shipping"
                                checked={config.freeShipping?.available ?? false}
                                onToggle={handleFreeShippingToggle}
                                threshold={config.freeShipping?.threshold ?? 0} // Provide 0 as default if undefined
                                onThresholdChange={(threshold) => handleFreeShippingThresholdChange(threshold)}
                                availableMethods={availableMethodsForFreeShipping} // Pass the *possible* methods
                                selectedMethods={config.freeShipping?.applicableMethods ?? []} // Pass the *currently selected* methods
                                onSelectedMethodsChange={handleFreeShippingMethodsChange}
                                excludedCountries={combinedExcludedCountries} // Pass the combined list
                                currency={brandCurrency} // Pass currency for threshold input
                            />
                        </div>
                        
                    );
                })()}
            </div>
            {errorMessage && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded whitespace-pre-line">
                    {errorMessage}
                </div>
            )}

            {/* Save Configuration */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isButtonDisabled || isSaving}
                    className="px-6 py-2"
                >
                    {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
            </div>
        </div>
    )
}
export default ShippingConfigurationForm;