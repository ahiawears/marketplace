"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import LoadContent from "@/app/load-content/page";
import { redirect } from "next/navigation";
import { currency } from "@/lib/currencyList";
import { MoneyInput } from "@/components/ui/money-input";
import { set } from "zod";

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

interface DatabaseShippingData {
    id: string;
    brand_id: string;
    handling_time_from: number;
    handling_time_to: number;
    free_shipping_threshold?: number;
    free_shipping_method?: string;
    default_package: {
        id: string;
        width: number;
        height: number;
        length: number;
        weight: number;
        dimensions_unit?: "Inch" | "Centimeter"; // Assuming it might be in the DB
    };
    shipping_methods: { method_type: string; is_active: boolean; fee: number }[];
    shipping_zones: { zone_type: string; is_active: boolean; delivery_time_from: string; delivery_time_to: string }[];
    created_at: string;
    updated_at: string;
}

const SHIPPING_METHOD_DISPLAY_NAMES: { [key: string]: string } = {
    same_day: "Same Day",
    standard: "Standard Shipping",
    express: "Express Shipping",
    international: "International Shipping",
};

const ShippingConfiguration = () => {
    const [config, setConfig] = useState<ShippingDetails>(DEFAULT_SHIPPING_CONFIG);
	const { userId, userSession, loading, error, resetError } = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [brandCurrency, setBrandCurrency] = useState("");
    const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

    const canOfferSameDay = COUNTRIES_WITH_SAME_DAY.includes("Nigeria");

    const handleMethodToggle = (method: keyof ShippingDetails['shippingMethods'], checked: boolean) => {
        setConfig(prev => ({
        ...prev,
        shippingMethods: {
            ...prev.shippingMethods,
            [method]: checked
        }
        }));
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

    const handleFreeShippingMethod = (method: string) => {
        const isFSMethodSelected = config.freeShippingMethod === method;
        const newFSMethod = isFSMethodSelected ? method : method;
        setConfig(prev => ({
            ...prev,
            freeShippingMethod: newFSMethod
        }));
        console.log(newFSMethod);
    }

    const handleSave = async () => {
        try {
            setIsSaving(true);
            console.log(config);
            // Simulate API call
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
                    // Try to parse error details from the response body
                    errorData = await res.json();
                } catch (parseError) {
                    // If parsing fails, use the status text
                    errorData = { message: res.statusText };
                }
                // Throw an error with details from the server or status text
                throw new Error(errorData?.message || `Failed to submit shipping configuration data. Status: ${res.status}`);
            }

            const data = await res.json();

            if (data.success) {
                setSuccessMessage("Shipping configuration saved successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);   
            } else {
                // Handle cases where response is ok (2xx) but operation failed logically
                throw new Error(data.message || "Saving configuration failed on the server.");
            }
        } catch (error) {
            let uploadErrorMessage;
            console.error("Error saving shipping configurations:", error);
            if (error instanceof Error) {
                uploadErrorMessage = error.message; 
            }
            setErrorMessage(uploadErrorMessage || "An error occurred while saving the configuration.");
            setTimeout(() => setErrorMessage(""), 3000);   

        } finally {
            setIsSaving(false);
        }
    };

    const setShippingDetailsFromDatabase = (data: DatabaseShippingData) => {
        const shippingMethods: ShippingDetails['shippingMethods'] = {
            sameDayDelivery: data.shipping_methods.find(m => m.method_type === 'same_day')?.is_active  || false,
            standardShipping: data.shipping_methods.find(m => m.method_type === 'standard')?.is_active || false,
            expressShipping: data.shipping_methods.find(m => m.method_type === 'express')?.is_active || false,
            internationalShipping: data.shipping_methods.find(m => m.method_type === 'international')?.is_active || false,
        };

        const shippingFees: ShippingDetails['shippingFees'] = {
            sameDayFee: data.shipping_methods.find(m => m.method_type === 'same_day')?.fee || 0,
            standardFee: data.shipping_methods.find(m => m.method_type === 'standard')?.fee || 0,
            expressFee: data.shipping_methods.find(m => m.method_type === 'express')?.fee || 0,
            internationalFee: data.shipping_methods.find(m => m.method_type === 'international')?.fee || 0,
        };

        const shippingZones: ShippingDetails['shippingZones'] = {
            domestic: data.shipping_zones.find(z => z.zone_type === 'domestic')?.is_active || false,
            regional: data.shipping_zones.find(z => z.zone_type === 'regional')?.is_active || false,
            international: data.shipping_zones.find(z => z.zone_type === 'international')?.is_active || false,
        };

        const estimatedDeliveryTimes: ShippingDetails['estimatedDeliveryTimes'] = {
            domestic: {
                from: data.shipping_zones.find(z => z.zone_type === 'domestic')?.delivery_time_from || '1', 
                to: data.shipping_zones.find(z => z.zone_type === 'domestic')?.delivery_time_to || '3', 
            },
            regional: {
                from: data.shipping_zones.find(z => z.zone_type === 'regional')?.delivery_time_from || '3',
                to: data.shipping_zones.find(z => z.zone_type === 'regional')?.delivery_time_to || '5', 
            },
            international: {
                from: data.shipping_zones.find(z => z.zone_type === 'international')?.delivery_time_from || '7',
                to: data.shipping_zones.find(z => z.zone_type === 'international')?.delivery_time_to || '14',
            },
        };

        const activeMethodTypes = data.shipping_methods
            .filter(method => method.is_active) // Filter for active methods
            .map(method => method.method_type); // Get their 'method_type'

            return {
                formattedConfig: {
                    shippingMethods,
                    shippingZones,
                    handlingTime: {
                        from: data.handling_time_from,
                        to: data.handling_time_to,
                    },
                    shippingFees,
                    defaultPackage: {
                        weight: data.default_package.weight,
                        dimensions: {
                            dimensionsUnit: data.default_package.dimensions_unit || "Inch",
                            length: data.default_package.length,
                            width: data.default_package.width,
                            height: data.default_package.height,
                        },
                    },
                    freeShippingThreshold: data.free_shipping_threshold,
                    freeShippingMethod: data.free_shipping_method,
                    estimatedDeliveryTimes,
                },
                activeMethods: activeMethodTypes // The array of active method_type strings
            };
    };

    useEffect(() => {
        if (userId && userSession?.access_token) {
            const getBrandConfig = async () => {
                try {
                    const response = await fetch (`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-shipping-config`, {
                        headers: {
                            "Authorization": `Bearer ${userSession.access_token}`,
                            'Content-Type': 'application/json',
                        }
                    })

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Couldn't create a connection with the server");
                    }
					
					const data = await response.json();

                    if (data.data) {
                        console.log("Raw Shipping Data from API (data.data):", JSON.stringify(data.data, null, 2));
                    }

                    if (!data.data) {
                        setConfig(DEFAULT_SHIPPING_CONFIG);
                    }

                    const { formattedConfig, activeMethods } = setShippingDetailsFromDatabase(data.data);

                    setConfig(formattedConfig); // Set the state with the fetched data
                    setSelectedMethods(activeMethods);
                } catch (error) {
                    console.error("Error fetching or processing shipping config:", error); // Log the actual error object
                    if (error instanceof Error) {
                        setErrorMessage(error.message || "Failed to load shipping configuration.");
                    } else {
                        setErrorMessage("An unknown error occurred while loading shipping configuration.");
                    }
                    setTimeout(() => setErrorMessage(""), 5000);
                    // Consider setting default config on error too
                    setConfig(DEFAULT_SHIPPING_CONFIG);
                } 
            }
            getBrandConfig();
        }
    }, [userId, userSession?.access_token, setConfig, setErrorMessage]);

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

	if (loading) {
		return <LoadContent />
	}

	if (error) {
        setErrorMessage(error.message || "Something went wrong, please try again.");
	}

	if (!userId) {
		redirect("/login-brand");
	}

    

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
                        <Input
                            type="number"
                            value={config.freeShippingThreshold || ''}
                            onChange={(e) => setConfig(prev => ({
                                ...prev,
                                freeShippingThreshold: e.target.value ? Number(e.target.value) : undefined
                            }))}
                            min="0"
                            placeholder="Enter amount for free shipping"
                            className="border-2"
                        />
                    </div>
                </div>

                {selectedMethods.length > 0 && (
                    <div className="flex items-center space-x-4 my-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Active Shipping Methods:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {selectedMethods.map((method, index) => ( 
                                    <span
                                        key={index}
                                        onClick={() => handleFreeShippingMethod(method)} // Keep onClick if you need interaction
                                        className={`px-3 py-1 text-sm cursor-pointer
                                            ${config.freeShippingMethod !== "" && config.freeShippingMethod === method // This just styles based on inclusion, adjust if needed
                                                ? "bg-black text-white"
                                                : "bg-primary text-white opacity-50"}
                                            hover:bg-primary/90 hover:text-white` }
                                    >
                                        {/* Use the mapping here, with a fallback to the original method name */}
                                        {SHIPPING_METHOD_DISPLAY_NAMES[method] || method}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Free shipping will apply to orders meeting the threshold if any of these methods are selected by the customer at checkout.
                            </p>
                        </div>
                    </div>
                )}

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