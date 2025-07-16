"use client";

import LoadContent from "@/app/load-content/page";
import FreeShippingSection from "@/components/brand-shipping-config/free-shipping-section";
import MethodToggle from "@/components/brand-shipping-config/shipping-methods";
import ZoneToggle from "@/components/brand-shipping-config/zone-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShippingConfig } from "@/hooks/get-brand-config";
import { useAuth } from "@/hooks/useAuth";
import { ValidateShippingConfig } from "@/lib/shippingConfigValidation";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";


export interface ShippingDetails {
    handlingTime: {
        from: number;
        to: number;
    }
    shippingMethods: {
        sameDayDelivery: {
            available: boolean;
            fee: number;
            estimatedDelivery?: {  // Only for same-day
                cutOffTime: string;  // e.g., "14:00" (2PM UTC+1)
                timeZone: string;  
            };
            conditions?: {
                applicableCities?: string[]; // e.g., ["Lagos", "Abuja"]
                excludePublicHolidays: boolean;
            };
        };
        standardShipping: {
            available: boolean;
            estimatedDelivery: { 
                domestic: { from: number; to: number; fee: number; }; 
                regional: { from: number; to: number; fee: number;  }; 
                sub_regional: { from: number; to: number; fee: number;  };
                global: { from: number; to: number; fee: number;  }; 
            };
        };
        expressShipping: {
            available: boolean;
            estimatedDelivery: {
                domestic: { from: number; to: number; fee: number; };
                regional: { from: number; to: number; fee: number; };
                sub_regional: { from: number; to: number; fee: number; };
                global: { from: number; to: number; fee: number; };
            };
        };
       
    };
    shippingZones: {
        domestic: {
            available: boolean;
            excludedCities: string[];
        };
        regional: {
            available: boolean;
            excludedCountries: string[];
        };
        sub_regional: {
            available: boolean;
            excludedCountries: string[];
        }
        global: {
            available: boolean;
            excludedCountries: string[];
        };
    }
    freeShipping?: {
        available: boolean;
        threshold: number; 
        applicableMethods: ("standard" | "express")[];
        excludedCountries?: string[];
    }
}

// Define the type for the zones within non-same-day methods
export type DeliveryZone = 'domestic' | 'sub_regional' | 'regional' | 'global';

// Define the type for the fields within same-day delivery
type SameDayField = 'cutOffTime' | 'timeZone';

export const DEFAULT_SHIPPING_CONFIG: ShippingDetails = {
    handlingTime: {
        from: 0,
        to: 1
    },
    shippingMethods: {
        sameDayDelivery: {
            available: false,
            fee: 0,
            estimatedDelivery: {
                cutOffTime: "12:00",
                timeZone: ""
            },
            conditions: {
                applicableCities: [],
                excludePublicHolidays: false
            }
        },
        standardShipping: {
            available: false,
            estimatedDelivery: {
                domestic: {
                    from: 2,
                    to: 5,
                    fee: 0
                },
                regional: {
                    from: 4,
                    to: 8,
                    fee: 0
                },
                sub_regional: {
                    from: 5,
                    to: 7,
                    fee: 0
                },
                global: {
                    from: 8,
                    to: 14,
                    fee: 0
                }
            }
        },
        expressShipping: {
            available: false,
            estimatedDelivery: {
                domestic: {
                    from: 1,
                    to: 3,
                    fee: 0
                },
                regional: {
                    from: 2,
                    to: 5,
                    fee: 0
                },
                sub_regional: {
                    from: 5,
                    to: 7,
                    fee: 0
                },
                global: {
                    from: 5,
                    to: 10,
                    fee: 0
                }
            },
        },
    },
    shippingZones: {
        domestic: {
            available: false,
            excludedCities: []
        },
        regional: {
            available: false,
            excludedCountries: []
        },
        sub_regional: {
            available: false,
            excludedCountries: []
        },
        global: {
            available: false,
            excludedCountries: []
        }
    },
    freeShipping: {
        available: false,
        threshold: 0,
        applicableMethods: [],
        excludedCountries: [],
    }
}

const ShippingConfiguration = () => {
    const { userId, userSession, loading: authLoading, error, resetError } = useAuth();
    const [ user_id, setUserId ] = useState("");
    
    useEffect(() => {
        if (userId) {
            setUserId(userId);
        }
    }, [userId]);
    const { config: shippingConfig, loading: configLoading, error: configError, refetch } = useShippingConfig(user_id, userSession?.access_token);

    const [brandCurrency, setBrandCurrency] = useState("NGN");
    const [brandCountry, setBrandCountry] = useState("NG");

    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [config, setConfig] = useState<ShippingDetails>(DEFAULT_SHIPPING_CONFIG);

    useEffect(() => {
        if (configLoading === false && shippingConfig) {
            setConfig(shippingConfig);
            console.log("The shipping config is", shippingConfig);
        }
    }, [configLoading, shippingConfig]);

    const isLoading = authLoading || configLoading;

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Something went wrong with authentication, please try again.");
        } else if (configError) {
            // Assuming configError is an Error object, use configError.message
            // If configError can be a string, then (configError.message || configError) might be needed
            toast.error(configError || "Something went wrong fetching configuration, please try again.");
        }
    }, [error, configError]);

    if (isLoading || config === null) {
        return <LoadContent />;
    }

    if(!user_id) {
        redirect("/login-brand");
    }

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
            // When enabling, calculate initial excluded countries
            const combinedExcluded = checked ? getCombinedExcludedCountries(prev.shippingZones) : [];
            return {
                ...prev,
                freeShipping: {
                    ...(prev.freeShipping ?? { threshold: 0, applicableMethods: [], excludedCountries: [] }), // Ensure freeShipping exists
                    available: checked,
                    // Reset threshold and methods if disabling, keep if enabling
                    threshold: checked ? (prev.freeShipping?.threshold ?? 0) : 0,
                    applicableMethods: checked ? (prev.freeShipping?.applicableMethods ?? []) : [],
                    excludedCountries: combinedExcluded // Update excluded countries based on current zones
                }
            };
        });
    };

    const handleFreeShippingThresholdChange = (value: number) => {
        setConfig(prev => ({
            ...prev,
            freeShipping: {
                ...(prev.freeShipping ?? { available: false, applicableMethods: [], excludedCountries: [] }), // Ensure freeShipping exists
                threshold: value // Assign the number, default to 0 if invalid
            }
        }));
    };

    const handleFreeShippingMethodsChange = (methods: ("standard" | "express")[]) => {
        setConfig(prev => ({
            ...prev,
            freeShipping: {
                ...(prev.freeShipping ?? { available: false, threshold: 0, excludedCountries: [] }), // Ensure freeShipping exists
                applicableMethods: methods
            }
        }));
    };

    // Helper function to get combined excluded countries
    const getCombinedExcludedCountries = (zones: ShippingDetails['shippingZones']) => {
        const combined = new Set<string>();
        zones.regional?.excludedCountries?.forEach(c => combined.add(c));
        zones.sub_regional?.excludedCountries?.forEach(c => combined.add(c));
        zones.global?.excludedCountries?.forEach(c => combined.add(c));
        return Array.from(combined);
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

    // Handles fee changes within specific zones for Standard/Express
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
            // Make sure estimatedDelivery exists
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
                            [field]: value // Update the specific field (cutOffTime or timeZone)
                        }
                    }
                }
            };
        });
        console.log(`Same Day Update - Field: ${field}, Value: ${value}`); // Log updates
    };

    const handleDeliveryTimeChange = (
        method: keyof ShippingDetails['shippingMethods'],
        zone: DeliveryZone,
        field: 'from' | 'to',
        value: number
    ) => {
        setConfig(prev => {
            // Ensure the method and estimatedDelivery exist before trying to update
            if (!prev.shippingMethods[method]?.estimatedDelivery) {
                console.warn(`Estimated delivery not configured for method: ${method}`);
                return prev; // Return previous state if structure is missing
            }
            // Ensure the specific zone exists within estimatedDelivery
            if (!(zone in prev.shippingMethods[method].estimatedDelivery!)) {
                //console.warn(`Zone ${zone} not configured for method: ${method}`);
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
                                // Spread existing zone data and update the specific field
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
        //handle validation function call here
        setErrorMessage(""); // Clear previous errors

        const validationErrors = ValidateShippingConfig(config);

        if (validationErrors.length > 0) {
            // Join errors with a newline for better readability in the error message display
            setErrorMessage(validationErrors.join('\n'));
            setIsSaving(false); // Ensure saving state is reset
            return; 
        }

        // If validation passes, proceed with saving
        try {
            setIsSaving(true);
            console.log("Validation passed. Saving config:", config); // Log the config being sent

            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-shipping-config`, 
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${userSession?.access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(config),
                }
            )
            if (!res.ok) {
                let errorData;
                try {
                    errorData = await res.json();
                } catch (parseError) {
                    errorData = { message: res.statusText };
                }
                throw new Error(errorData?.message || `Failed to submit shipping configuration data. Status: ${res.status}`);
            }

            const data = await res.json();
    
            if (data.success) {
                toast.success("Shipping configuration saved successfully!");
            } else {
                throw new Error(data.message || "Saving configuration failed on the server.");
            }
        } catch (error) {
            let uploadErrorMessage;
            if (error instanceof Error) {
                uploadErrorMessage = error.message;
            }
            setErrorMessage(uploadErrorMessage || "An error occurred while saving the configuration.");
        } finally {
            setIsSaving(false);
        }

    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 border-2">
            <Toaster position="top-right" richColors />
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
                    disabled={isSaving}
                    className="px-6 py-2"
                >
                    {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
            </div>
        </div>
    )
}

export default ShippingConfiguration;