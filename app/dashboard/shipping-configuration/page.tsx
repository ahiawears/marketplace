"use client";

import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import LoadContent from "@/app/load-content/page";
import { redirect } from "next/navigation";
import { currency } from "@/lib/currencyList";
import { MoneyInput } from "@/components/ui/money-input";
import { getBrandConfigDetails } from "@/hooks/get-brand-config";

interface ShippingDetails {
    shippingMethods: {
        sameDayDelivery: boolean;
        standardShipping: boolean;
        expressShipping: boolean;
        internationalShipping: boolean;
    };
    shippingZones: {
        domestic: boolean;
        regional: boolean;
        international: boolean;
    };
    handlingTime: {
		from: number;
		to: number;
	};
    shippingFees: {
        sameDayFee: number;
        standardFee: number;
        expressFee: number;
        internationalFee: number;
    };
    defaultPackage: {
        weight: number;
        dimensions: {
            dimensionsUnit: "Inch" | "Centimeter"
            length: number;
            width: number;
            height: number;
        };
    };
    freeShippingThreshold?: number;
    freeShippingMethod?: string;
    estimatedDeliveryTimes: {
        domestic: { from: string; to: string };
        regional: { from: string; to: string };
        international: { from: string; to: string };
    };
}

interface MethodToggleProps {
    label: string;
    checked: boolean;
    fee: number;
    onToggle: (checked: boolean) => void;
    onFeeChange: (fee: number) => void;
    currency: string;
}

interface ZoneToggleProps {
    label: string;
    checked: boolean;
    deliveryTime: { from: string; to: string };
    onToggle: (checked: boolean) => void;
    onTimeFromChange: (from: string) => void;
    onTimeToChange: (to: string) => void;
    canOfferSameDay: boolean;
}

const COUNTRIES_WITH_SAME_DAY = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa',
    'Tanzania', 'Uganda'
];

const DEFAULT_SHIPPING_CONFIG: ShippingDetails = {
    shippingMethods: {
        sameDayDelivery: false,
        standardShipping: false,
        expressShipping: false,
        internationalShipping: false,
    },
    shippingZones: {
        domestic: false,
        regional: false,
        international: false,
    },
    handlingTime: {
		from: 0,
		to: 0
	},
    shippingFees: {
        sameDayFee: 0,
        standardFee: 0,
        expressFee: 0,
        internationalFee: 0,
    },
    defaultPackage: {
        weight: 0,
        dimensions: {
            dimensionsUnit: "Inch",
            length: 0,
            width: 0,
            height: 0,
        }
    },
    freeShippingThreshold: 0,
    freeShippingMethod: "",
    estimatedDeliveryTimes: {
        domestic: { from: "0", to: "0" },
        regional: { from: "0", to: "0" },
        international: { from: "0", to: "0" },
    }
};

const ShippingConfiguration = () => {
	const { userId, userSession, loading: authLoading, error, resetError } = useAuth();
    const [ user_id, setUserId ] = useState("");

    useEffect(() => {
        if (userId) {
            setUserId(userId);
        }
    }, [userId]);
    
    const { shippingConfig, configLoading, configError} = getBrandConfigDetails(user_id, userSession?.access_token);

    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
	const [brandCurrency, setBrandCurrency] = useState("");

    const [config, setConfig] = useState<ShippingDetails>(DEFAULT_SHIPPING_CONFIG);

    useEffect(() => {
        if(configLoading === false) {
            setConfig(shippingConfig);
        }
    }, [configLoading, shippingConfig]);

    useEffect(() => {
		if (userId && userSession?.access_token) {
			const getBrandData = async () => {
				const dataName = "legal-details";
				try {
					const response = await fetch (`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-details?data_name=${dataName}&userId=${userId}`,
						{
							headers: {
								Authorization:`Bearer ${userSession.access_token}`,
                                'Content-Type': 'application/json',
							}
						}
					)

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Couldn't create a connection with the server");
                    }
					
					const data = await response.json();
    
                    if (!data.data) {
                        throw new Error("No data found for the user, please try again");
                    }

					const brand_country = data.data.country_of_registration;
					const brandCurrency = currency.find((c) => c.country_alpha === brand_country);
					if (brandCurrency) {
						setBrandCurrency(brandCurrency?.code);
					}    
				} catch (error) {
					if (error instanceof Error) {
                        setErrorMessage(error.message || "An error occurred while fetching brand details.");
                    } else {
                        setErrorMessage("An unexpected error occurred.");
                    }
				}
			}
			getBrandData();
		}
	}, [userId, userSession?.access_token]);

    const isLoading = authLoading || configLoading;

    if (isLoading || config === null) {
		return <LoadContent />;
	}

	if (error) {
        setErrorMessage(error.message || "Something went wrong, please try again.");
	}

    if (configError) {
        setErrorMessage(configError || "Something went wrong, please try again.");
    }

	if (!userId) {
		redirect("/login-brand");
        return null;
	}

    const canOfferSameDay = COUNTRIES_WITH_SAME_DAY.includes("Nigeria");

    const handleMethodToggle = (method: keyof ShippingDetails['shippingMethods'], checked: boolean) => {
        const methodDbKeyMap: { [key in keyof ShippingDetails['shippingMethods']]?: string } = {
            sameDayDelivery: 'same_day',
            standardShipping: 'standard',
            expressShipping: 'express',
            internationalShipping: 'international',
        };
        const dbKey = methodDbKeyMap[method]; 
    
        setConfig(prev => {
            const newState = {
                ...prev,
                shippingMethods: {
                    ...prev.shippingMethods,
                    [method]: checked // Update the active status
                }
            };
    
            // If turning the method OFF *and* it was the selected free shipping method
            if (!checked && dbKey && prev.freeShippingMethod === dbKey) {
                newState.freeShippingMethod = ""; // Reset the free shipping method selection
                console.log(`Reset freeShippingMethod because ${dbKey} was deactivated.`);
            }
    
            return newState;
        });
    };

    const handleZoneToggle = (zone: keyof ShippingDetails['shippingZones'], checked: boolean) => {
        setConfig(prev => ({
			...prev,
			shippingZones: {
				...prev.shippingZones,
				[zone]: checked
			}
        }));
    };

    const handleFeeChange = (feeType: keyof ShippingDetails['shippingFees'], value: number) => {
        setConfig(prev => ({
			...prev,
			shippingFees: {
				...prev.shippingFees,
				[feeType]: value
			}
        }));
    };

    const handleDeliveryTimeFromChange = (zone: keyof ShippingDetails['estimatedDeliveryTimes'], from: string) => {
        setConfig(prev => ({
        ...prev,
        estimatedDeliveryTimes: {
            ...prev.estimatedDeliveryTimes,
            [zone]: { ...prev.estimatedDeliveryTimes[zone], from }
        }
        }));
    };

    const handleDeliveryTimeToChange = (zone: keyof ShippingDetails['estimatedDeliveryTimes'], to: string) => {
        setConfig(prev => ({
            ...prev,
            estimatedDeliveryTimes: {
                ...prev.estimatedDeliveryTimes,
                [zone]: { ...prev.estimatedDeliveryTimes[zone], to }
            }
        }));
    };

    const handleFreeShippingMethod = (methodDbKey: string) => { // Renamed param for clarity
        setConfig(prev => ({
            ...prev,
            freeShippingMethod: methodDbKey
        }));
        console.log("Selected Free Shipping Method (DB Key):", methodDbKey);
    }
    

    const handleSave = async () => {
        // --- Method Fee Validation ---
        const methodErrors: string[] = [];
        const methodDetails: { [key in keyof ShippingDetails['shippingMethods']]?: { feeKey: keyof ShippingDetails['shippingFees']; display: string } } = {
            sameDayDelivery: { feeKey: 'sameDayFee', display: 'Same Day Delivery' },
            standardShipping: { feeKey: 'standardFee', display: 'Standard Shipping' },
            expressShipping: { feeKey: 'expressFee', display: 'Express Shipping' },
            internationalShipping: { feeKey: 'internationalFee', display: 'International Shipping' },
        };
    
        for (const methodKey in methodDetails) {
            const key = methodKey as keyof ShippingDetails['shippingMethods'];
            const details = methodDetails[key];
    
            if (config.shippingMethods[key] && details) {
                const fee = config.shippingFees[details.feeKey];
                if (fee === undefined || fee === null || isNaN(fee) || fee <= 0) {
                    if (key === 'sameDayDelivery' && !canOfferSameDay) {
                        continue;
                    }
                    methodErrors.push(details.display);
                }
            }
        }
    
        // --- Zone Delivery Time Validation ---
        const zoneErrors: string[] = [];
        const zoneDetails: { [key in keyof ShippingDetails['shippingZones']]: { display: string } } = {
            domestic: { display: 'Domestic (Nigeria)' },
            regional: { display: 'Regional (Africa)' },
            international: { display: 'International' }
        };
    
        for (const zoneKey in zoneDetails) {
            const key = zoneKey as keyof ShippingDetails['shippingZones'];
    
            if (config.shippingZones[key]) {
                const times = config.estimatedDeliveryTimes[key];
                const fromStr = times.from;
                const toStr = times.to;
                const fromNum = parseInt(fromStr, 10);
                const toNum = parseInt(toStr, 10);
                const minAllowedFrom = (key === 'domestic' && canOfferSameDay) ? 0 : 1;
                let zoneHasError = false;
                let errorReason = "";
    
                if (!fromStr || !toStr) {
                    zoneHasError = true;
                    errorReason = "missing 'From' or 'To'";
                } else if (isNaN(fromNum) || isNaN(toNum)) {
                    zoneHasError = true;
                    errorReason = "invalid number format";
                } else if (fromNum < minAllowedFrom) {
                    zoneHasError = true;
                    errorReason = `'From' time cannot be less than ${minAllowedFrom}`;
                } else if (toNum < fromNum) {
                    zoneHasError = true;
                    errorReason = "'To' time cannot be less than 'From' time";
                }
    
                if (zoneHasError) {
                    if (!zoneErrors.includes(zoneDetails[key].display)) {
                        zoneErrors.push(zoneDetails[key].display);
                        console.log(`Validation Error for Zone '${zoneDetails[key].display}': ${errorReason}`);
                    }
                }
            }
        }
    
        // --- Combine Initial Errors ---
        const allErrorMessages: string[] = [];
        if (methodErrors.length > 0) {
            allErrorMessages.push(`Please set a valid fee (> 0) for active methods: ${methodErrors.join(', ')}.`); // Added period
        }
        if (zoneErrors.length > 0) {
            allErrorMessages.push(`Please set valid delivery times ('From' and 'To', with To >= From, and From >= ${canOfferSameDay ? 0 : 1}) for active zones: ${zoneErrors.join(', ')}.`); // Added period
        }
    
        const threshold = config.freeShippingThreshold;
        const method = config.freeShippingMethod;
    
        if (method && method.trim() !== "" && (!threshold || threshold <= 0)) {
            allErrorMessages.push("A free shipping method is selected, but the minimum order threshold is not set or is zero. Please set a threshold greater than 0.");
        }
        else if (threshold && threshold > 0 && (!method || method.trim() === "")) {
            const anyActiveMethods = Object.values(config.shippingMethods).some(isActive => isActive);
            if (anyActiveMethods) {
                allErrorMessages.push("A free shipping threshold is set, but no active shipping method is selected to apply it to. Please select a method under 'Free Shipping Threshold'.");
            } else {
                allErrorMessages.push("A free shipping threshold is set, but no shipping methods are currently active. Please activate at least one shipping method first before selecting it for free shipping.");
            }
        }

        const { from: handlingFrom, to: handlingTo } = config.handlingTime;
        let handlingTimeError = "";

        if (isNaN(handlingFrom) || isNaN(handlingTo)) {
            handlingTimeError = "Handling time 'From' and 'To' must be valid numbers. Please check for non-numeric characters.";
        }else if (handlingFrom < 0 || handlingTo < 0) {
            handlingTimeError = "Handling time 'From' and 'To' values cannot be negative.";
        }else if (handlingFrom > handlingTo) {
            handlingTimeError = "Handling time 'From' value cannot be greater than the 'To' value.";
        } else if ( handlingTo === 0) {
            handlingTimeError = "Handling time 'To' value cannot be negative or '0'.";
        }

        if (handlingTimeError) {
            allErrorMessages.push(handlingTimeError);
        } else {
            console.log("Handling Time Validation Passed"); // Log success for debugging
        }
    
        // --- Final Error Check and Save Logic ---
        if (allErrorMessages.length > 0) {
            // Join messages with a newline for better readability if multiple errors occur
            setErrorMessage(allErrorMessages.join(' \n'));
            setSuccessMessage("");
            setIsSaving(false);
            return; // Stop the function execution
        }
    
        // Clear any previous error message if all validation passes
        setErrorMessage("");
    
        try {
            setIsSaving(true);
            console.log("Saving config:", config); // Log the config being sent
    
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
                setSuccessMessage("Shipping configuration saved successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                throw new Error(data.message || "Saving configuration failed on the server.");
            }
        } catch (error) {
            let uploadErrorMessage;
            console.error("Error saving shipping configurations:", error);
            if (error instanceof Error) {
                uploadErrorMessage = error.message;
            }
            setErrorMessage(uploadErrorMessage || "An error occurred while saving the configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 border-2">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                    Shipping Configuration
                </h2>
            </div>

            {/* Handling Time Section */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                <h3 className="text-lg font-semibold mb-4">Handling Time</h3>
                <div className="flex items-center space-x-2 w-full">
					<div className="w-full">
						<Input
							name="handlingTimeFrom"
							type="number"
							value={config.handlingTime.from}
							onChange={(e) => setConfig(prev => ({
								...prev,
								handlingTime: {
									...prev.handlingTime,
									from: Number(e.target.value)
								}
							}))}
							className="border-2 w-full"
						/>
						<label htmlFor="handlingTimeFrom" className="block text-sm font-medium text-gray-700 my-4">From:</label>
					</div>
					<div className="w-full">
						<Input
							name="handlingTimeTo"
							type="number"
							value={config.handlingTime.to}
							onChange={(e) => setConfig(prev => ({
								...prev,
								handlingTime: {
									...prev.handlingTime,
									to: Number(e.target.value)
								}
							}))}
							className="border-2 w-full"
						/>
						<label htmlFor="handlingTimeTo" className="block text-sm font-medium text-gray-700 my-4">To:</label>
					</div>
                </div>
				<p className="text-sm font-medium text-gray-500">Enter '0 to 1' for same-day handling time.</p>

            </div>

            {/* Shipping Methods Section */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                <h3 className="text-lg font-semibold mb-4">Shipping Methods</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {canOfferSameDay && (
                        <MethodToggle
                            label="Same Day Delivery"
                            checked={config.shippingMethods.sameDayDelivery}
                            fee={config.shippingFees.sameDayFee}
                            onToggle={(checked) => handleMethodToggle('sameDayDelivery', checked)}
                            onFeeChange={(fee) => handleFeeChange('sameDayFee', fee)}
                            currency={`${brandCurrency}`}
                        />
                    )}

                    <MethodToggle
                        label="Standard Shipping"
                        checked={config.shippingMethods.standardShipping}
                        fee={config.shippingFees.standardFee}
                        onToggle={(checked) => handleMethodToggle('standardShipping', checked)}
                        onFeeChange={(fee) => handleFeeChange('standardFee', fee)}
                        currency={`${brandCurrency}`}
                    />

                    <MethodToggle
                        label="Express Shipping"
                        checked={config.shippingMethods.expressShipping}
                        fee={config.shippingFees.expressFee}
                        onToggle={(checked) => handleMethodToggle('expressShipping', checked)}
                        onFeeChange={(fee) => handleFeeChange('expressFee', fee)}
                        currency={`${brandCurrency}`}
                    />

                    <MethodToggle
                        label="International Shipping"
                        checked={config.shippingMethods.internationalShipping}
                        fee={config.shippingFees.internationalFee}
                        onToggle={(checked) => handleMethodToggle('internationalShipping', checked)}
                        onFeeChange={(fee) => handleFeeChange('internationalFee', fee)}
                        currency={`${brandCurrency}`}
                    />
                </div>
            </div>

            {/* Shipping Zones Section */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                <h3 className="text-lg font-semibold mb-4">Shipping Zones & Estimated Delivery Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ZoneToggle
                        label={`Domestic (Nigeria)`}
                        checked={config.shippingZones.domestic}
                        deliveryTime={config.estimatedDeliveryTimes.domestic}
                        onToggle={(checked) => handleZoneToggle('domestic', checked)}
                        onTimeFromChange={(from) => handleDeliveryTimeFromChange('domestic', from)}
                        onTimeToChange={(to) => handleDeliveryTimeToChange('domestic', to)}
                        canOfferSameDay={canOfferSameDay}
                    />

                    <ZoneToggle
                        label={`Regional (Africa)`}
                        checked={config.shippingZones.regional}
                        deliveryTime={config.estimatedDeliveryTimes.regional}
                        onToggle={(checked) => handleZoneToggle('regional', checked)}
                        onTimeFromChange={(from) => handleDeliveryTimeFromChange('regional', from)}
                        onTimeToChange={(to) => handleDeliveryTimeToChange('regional', to)}
                        canOfferSameDay={canOfferSameDay}
                    />

                    <ZoneToggle
                        label="International"
                        checked={config.shippingZones.international}
                        deliveryTime={config.estimatedDeliveryTimes.international}
                        onToggle={(checked) => handleZoneToggle('international', checked)}
                        onTimeFromChange={(from) => handleDeliveryTimeFromChange('international', from)}
                        onTimeToChange={(to) => handleDeliveryTimeToChange('international', to)}
                        canOfferSameDay={canOfferSameDay}
                    />
                </div>
            </div>

            {/* Package Details Section */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                <h3 className="text-lg font-semibold mb-4">Default Package Details</h3>
                <div className="flex gap-4 my-4">
                    <div className="flex items-center">
                        <Input
                            type="radio"
                            id="packageUnitInch"
                            name="packageUnit"
                            value="Inch"
                            checked={config.defaultPackage.dimensions.dimensionsUnit === "Inch"}
                            onChange={(e) => setConfig(prev => ({
                                ...prev,
                                defaultPackage: {
                                    ...prev.defaultPackage,
                                    dimensions: {
                                        ...prev.defaultPackage.dimensions,
                                        dimensionsUnit: "Inch"
                                    }
                                }
                            }))}
                            className={cn(
                                "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                "peer appearance-none",
                                "checked:bg-black checked:border-transparent",
                                "hover:border-gray-500 cursor-pointer"
                            )}
                        />
                        <label htmlFor="packageUnitInch" className="ml-2 text-sm peer-checked:text-black">Inch</label>
                    </div>
                    <div className="flex items-center">
                        <Input
                            type="radio"
                            id="packageUnitCentimeter"
                            name="packageUnit"
                            value="Centimeter"
                            checked={config.defaultPackage.dimensions.dimensionsUnit === "Centimeter"}
                            onChange={(e) => setConfig(prev => ({
                                ...prev,
                                defaultPackage: {
                                    ...prev.defaultPackage,
                                    dimensions: {
                                        ...prev.defaultPackage.dimensions,
                                        dimensionsUnit: "Centimeter"
                                    }
                                }
                            }))}
                            className={cn(
                                "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                "peer appearance-none",
                                "checked:bg-black checked:border-transparent",
                                "hover:border-gray-500 cursor-pointer"
                            )}
                        />
                        <label htmlFor="packageUnitCentimeter" className="ml-2 text-sm peer-checked:text-black">Centimeter</label>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <Input
                            type="number"
                            value={config.defaultPackage.weight}
                            onChange={(e) => setConfig(prev => ({
                                ...prev,
                                defaultPackage: {
                                    ...prev.defaultPackage,
                                    weight: Number(e.target.value)
                                }
                            }))}
                            min="0.1"
                            step="0.1"
                            className="border-2"
                        />
                    </div>
                    {['length', 'width', 'height'].map((dim) => (
                        <div key={dim}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {dim.charAt(0).toUpperCase() + dim.slice(1)} ({config.defaultPackage.dimensions.dimensionsUnit === "Inch" ? "in" : "cm"})
                            </label>
                            <Input
                                type="number"
                                value={config.defaultPackage.dimensions[dim as keyof typeof config.defaultPackage.dimensions]}
                                onChange={(e) => setConfig(prev => ({
                                ...prev,
                                defaultPackage: {
                                    ...prev.defaultPackage,
                                    dimensions: {
                                    ...prev.defaultPackage.dimensions,
                                    [dim]: Number(e.target.value)
                                    }
                                }
                                }))}
                                min="1"
                                className="border-2"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Free Shipping Threshold */}
            <div className="bg-white rounded-lg shadow p-6 border-2">
                <h3 className="text-lg font-semibold mb-4">Free Shipping Threshold</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Order Value ({brandCurrency})
                        </label>
                        <MoneyInput 
                            type="text"
                            value={config.freeShippingThreshold || ''}
                            onChange={(e) => {
                                const formattedValue = e.target.value;
                                const cleanedValue = formattedValue.replace(/,/g, '');
                                const numericValue = parseFloat(cleanedValue);
                                setConfig(prev => ({
                                    ...prev,
                                    freeShippingThreshold: isNaN(numericValue) ? 0 : numericValue
                                }))}
                            }
                            min="0"
                            placeholder="0.00"
                            className="border-2"
                        />
                    </div>
                </div>

                {(() => { 
                    const methodMapping: { [key in keyof ShippingDetails['shippingMethods']]?: { dbKey: string; display: string } } = {
                        sameDayDelivery: { dbKey: 'same_day', display: 'Same Day Delivery' },
                        standardShipping: { dbKey: 'standard', display: 'Standard Shipping' },
                        expressShipping: { dbKey: 'express', display: 'Express Shipping' },
                        internationalShipping: { dbKey: 'international', display: 'International Shipping' },
                    };

                    const activeMethodsToDisplay = Object.entries(config.shippingMethods)
                        .filter(([key, isActive]) => isActive && methodMapping[key as keyof ShippingDetails['shippingMethods']]) // Filter for active and mapped methods
                        .map(([key]) => methodMapping[key as keyof ShippingDetails['shippingMethods']]!); // Get the mapping details {dbKey, display}

                    if (activeMethodsToDisplay.length === 0) {
                        return null;
                    }

                    return (
                        <div className="flex items-center space-x-4 my-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Active Method for Free Shipping:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {activeMethodsToDisplay.map(({ dbKey, display }) => (
                                        <span
                                            key={dbKey} // Use the database key
                                            onClick={() => handleFreeShippingMethod(dbKey)} // Pass the database key
                                            className={`px-3 py-1 text-sm cursor-pointer transition-colors duration-150 ease-in-out
                                                ${config.freeShippingMethod === dbKey 
                                                    ? "bg-black text-white ring-2 ring-offset-1 ring-black"
                                                    : "bg-primary text-white opacity-50"} 
                                                `}
                                        >
                                            {display} {/* Show the display name */}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Click an active method above to use it when the free shipping threshold is met.
                                </p>
                            </div>
                        </div>
                    );
                })()}

            </div>
            {successMessage && (
                <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded">
                    {errorMessage}
                </div>
            )}
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
    );
};

const MethodToggle: React.FC<MethodToggleProps> = ({
    label,
    checked,
    fee,
    onToggle,
    onFeeChange,
    currency
}) => (
    <div className="flex flex-col p-4 border-2 rounded-lg space-y-3">
        <label className="flex items-center space-x-3">
            <Input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(e.target.checked)}
                className={cn(
                    "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                    "peer appearance-none",
                    "checked:bg-black checked:border-transparent",
                    "hover:border-gray-500 cursor-pointer"
                )}
            />
            <span className="font-medium">{label}</span>
        </label>
        {checked && (
            <div className="flex items-center space-x-2 justify-between">
                <span className="text-sm text-gray-600">Fee:</span>
				<MoneyInput 
                    type="text"
					value={fee}
					className="w-full border-2"
                    onChange={(e) => {
                        // This existing parsing logic is still correct for handling
                        // the formatted string coming *from* MoneyInput's onChange
                        const formattedValue = e.target.value;
                        const cleanedValue = formattedValue.replace(/,/g, '');
                        const numericValue = parseFloat(cleanedValue);
                        onFeeChange(isNaN(numericValue) ? 0 : numericValue);
                    }}				
                    placeholder="0.00"
				/>
                <span className="text-sm text-gray-600">{`${currency}`}</span>
            </div>
        )}
    </div>
);

const ZoneToggle: React.FC<ZoneToggleProps> = ({ 
	label, 
	checked, 
	deliveryTime, 
	onToggle, 
	onTimeFromChange, 
	onTimeToChange,
	canOfferSameDay 
}) => (
	<div className="border-2 p-4 rounded-lg space-y-3">
		<label className="flex items-center space-x-3">
			<Input
				type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(e.target.checked)}
                className={cn(
                    "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                    "peer appearance-none",
                    "checked:bg-black checked:border-transparent",
                    "hover:border-gray-500 cursor-pointer"
                )}
            />
            <span className="font-medium">{label}</span>
        </label>
        {checked && (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Estimated Delivery Time (Days)</label>
                <div className="flex items-center space-x-2 w-full justify-between">
					<div>
						<Input
							type="number"
							value={deliveryTime.from}
							onChange={(e) => onTimeFromChange(e.target.value)}
							className="w-20 border-2 text-center"
							min={canOfferSameDay && label.includes('Domestic') ? "0" : "1"}
						/>
						<label htmlFor="" className="block text-sm font-medium text-gray-700 my-2">From: </label>

					</div>
					<div className="vertical-align text-center">
						<span className="text-gray-500">to</span>
					</div>
					<div>
						<Input
							type="number"
							value={deliveryTime.to}
							onChange={(e) => onTimeToChange(e.target.value)}
							className="w-20 border-2 text-center"
							min={deliveryTime.from || (canOfferSameDay && label.includes('Domestic') ? "0" : "1")}
						/>
						<label htmlFor="" className="block text-sm font-medium text-gray-700 my-2">To: </label>

					</div>
                </div>
                {canOfferSameDay && label.includes('Domestic') && (
                    <p className="text-xs text-gray-500">Enter '0' for same-day delivery.</p>
                )}
            </div>
        )}
    </div>
);

export default ShippingConfiguration;