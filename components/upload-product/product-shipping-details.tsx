import { ShippingDetails, ProductShippingDeliveryType, DeliveryZoneKey } from "@/lib/types"
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Select } from "../ui/select";
import { useShippingConfig } from "@/hooks/get-brand-config";
import LoadContent from "@/app/load-content/page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MoneyInput } from "../ui/money-input";
import { Button } from "../ui/button";
import { validateProductShippingDetails } from "@/lib/productDataValidation";

interface ProductShippingDetailsProps {
    userId: string;
    accessToken: string;
    currencySymbol: string;
    onSaveShippingDetails: (details: ProductShippingDeliveryType) => void;
}

interface ShippingMethodItem {
    display: string;
    feeKey: keyof ShippingDetails['shippingFees'] | undefined;
    dbKey?: keyof ShippingDetails['shippingMethods'];
    feeValue: number;
}

interface ShippingZoneItem {
    display: string;
    dbKey: keyof ShippingDetails['shippingZones'];
    timeKey: keyof ShippingDetails['estimatedDeliveryTimes'];
    deliveryTime: { from: string; to: string };
}

interface ProductShippingSettings {

}

const ProductShippingDetails: React.FC<ProductShippingDetailsProps> = ({ userId, accessToken, currencySymbol, onSaveShippingDetails }) => {
    const { config: shippingConfig, loading: configLoading, error: configError, refetch } = useShippingConfig(userId, accessToken);
    const [ selectedShippingMethods, setSelectedShippingMethods ] = useState<string[]>([]);
    const [ methodFees, setMethodFees ] = useState<ProductShippingDeliveryType["methods"]>({});
    const [ productWeight, setProductWeight ] = useState<ProductShippingDeliveryType["weight"]>(0);
    const [ productDimensions, setProductDimensions ] = useState<ProductShippingDeliveryType["dimensions"]>({ length: 0, width: 0, height: 0 })
    const [ availableShippingZones, setAvailableShippingZones ] = useState<ShippingZoneItem[]>([]);
    const { shippingMethods, shippingZones } = shippingConfig;
    const [ errorMessage, setErrorMessage ] = useState("");
    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState<boolean>(true);
    const [measurementUnit, setMeasurementUnit] = useState<"Inch" | "Centimeter">("Inch");


    useEffect(() => {
        if (shippingConfig && !configLoading && shippingConfig.shippingMethods && shippingConfig.shippingZones) {
            const initialFees: ProductShippingDeliveryType["methods"] = {};

            // Same Day Delivery
            const sameDayConfig = shippingConfig.shippingMethods.sameDayDelivery;
            if (sameDayConfig?.available) {
                initialFees.sameDay = {
                    available: true,
                    fee: sameDayConfig.fee,
                };
            }

            // Standard Shipping
            const standardConfig = shippingConfig.shippingMethods.standardShipping;
            if (standardConfig?.available && standardConfig.estimatedDelivery) {
                initialFees.standard = {};
                (Object.keys(standardConfig.estimatedDelivery) as DeliveryZoneKey[]).forEach(zoneKey => {
                    if (shippingConfig.shippingZones[zoneKey]?.available) {
                        initialFees.standard![zoneKey] = {
                            available: true, // Product initially offers for this zone if brand does
                            fee: standardConfig.estimatedDelivery[zoneKey]!.fee,
                        };
                    }
                });
            }

            // Express Shipping
            const expressConfig = shippingConfig.shippingMethods.expressShipping;
            if (expressConfig?.available && expressConfig.estimatedDelivery) {
                initialFees.express = {};
                (Object.keys(expressConfig.estimatedDelivery) as DeliveryZoneKey[]).forEach(zoneKey => {
                     if (shippingConfig.shippingZones[zoneKey]?.available) {
                        initialFees.express![zoneKey] = {
                            available: true, // Product initially offers for this zone if brand does
                            fee: expressConfig.estimatedDelivery[zoneKey]!.fee,
                        };
                    }
                });
            }
            setMethodFees(initialFees);
        }
    }, [shippingConfig, configLoading]);


    const handleMethodSelect = (method: string) => {
        setSelectedShippingMethods(prev => 
            prev.includes(method) 
                ? prev.filter(m => m !== method)
                : [...prev, method]
        );
    };

    const handleMeasurementUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurementUnit(event.target.value as "Inch" | "Centimeter");
    };

    const handleFeeChange = (
        productMethodKey: 'sameDay' | 'standard' | 'express',
        zoneKey: DeliveryZoneKey | undefined, // Undefined for sameDayDelivery
        value: number
    ) => {
        setMethodFees(prev => {
            const newFees = JSON.parse(JSON.stringify(prev || {})); // Deep copy to ensure nested updates

            if (productMethodKey === 'sameDay') {
                if (!newFees.sameDay) {
                    // Initialize from shippingConfig if not present, respecting brand's availability
                    newFees.sameDay = { available: shippingConfig?.shippingMethods.sameDayDelivery.available };
                }
                newFees.sameDay.fee = value;
            } else if (zoneKey && (productMethodKey === 'standard' || productMethodKey === 'express')) {
                if (!newFees[productMethodKey]) {
                    newFees[productMethodKey] = {};
                }
                if (!newFees[productMethodKey]![zoneKey]) {
                    // Initialize from shippingConfig if not present for this specific zone
                    const configMethodKey = productMethodKey === 'standard' ? 'standardShipping' : 'expressShipping';
                    const methodAvailable = shippingConfig?.shippingMethods[configMethodKey]?.available;
                    const currentZoneAvailable = shippingConfig?.shippingZones[zoneKey]?.available;
                    newFees[productMethodKey]![zoneKey] = { available: methodAvailable && currentZoneAvailable };
                }
                newFees[productMethodKey]![zoneKey]!.fee = value;
            }
            return newFees;
        });
    };

    useEffect(() => {
        if (configLoading) {
            setIsSaveButtonDisabled(true);
            return;
        }
        const { isValid, error } = validateProductShippingDetails(selectedShippingMethods, methodFees, shippingConfig);
        setIsSaveButtonDisabled(!isValid);
        setErrorMessage(error || "");
    }, [productWeight, productDimensions, selectedShippingMethods, methodFees, shippingConfig, configLoading]);

    if (configLoading) {
        return <LoadContent />
    }

    function handleSave(){
        const { isValid, error } = validateProductShippingDetails(selectedShippingMethods, methodFees, shippingConfig);
        if (!isValid) {
            setErrorMessage(error || "An unknown validation error occurred.");
            return;
        }
        const selectedMethodsAndFees: ProductShippingDeliveryType["methods"] = {};

        selectedShippingMethods.forEach(methodKeyString => {
            if (methodKeyString === 'sameDayDelivery' && methodFees?.sameDay) {
                if (!selectedMethodsAndFees.sameDay) selectedMethodsAndFees.sameDay = {};
                selectedMethodsAndFees.sameDay = { ...methodFees.sameDay };
            } else if (methodKeyString === 'standardShipping' && methodFees?.standard) {
                if (!selectedMethodsAndFees.standard) {
                    selectedMethodsAndFees.standard = {};
                }
                selectedMethodsAndFees.standard = { ...methodFees.standard };
            } else if (methodKeyString === 'expressShipping' && methodFees?.express) {
                if (!selectedMethodsAndFees.express) selectedMethodsAndFees.express = {};
                selectedMethodsAndFees.express = { ...methodFees.express };
            }
        });

        const shippingDetailsToSave: ProductShippingDeliveryType = {
            methods: selectedMethodsAndFees,
            weight: productWeight,
            dimensions: productDimensions,
            
        };
        onSaveShippingDetails(shippingDetailsToSave);
        console.log("Saved Product Shipping Details:", shippingDetailsToSave);    
    }

    return (
        <div>
            {/* --- Package Physical Attributes --- */}
            <Card className="mb-4 border-2">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Package Physical Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="my-2">
                        <div>
                            <label htmlFor="measurementUnit" className="block text-sm font-bold text-gray-900"> Select the measurement unit</label>
                            
                            <div className="flex gap-4 mt-2">
                                <div className="flex items-center">
                                    <Input 
                                        type="radio"
                                        id="measurementUnitInch"
                                        name="measurementUnit"
                                        value="Inch"
                                        checked={measurementUnit === "Inch"}
                                        onChange={(e) => {
                                            handleMeasurementUnitChange(e);
                                        }}
                                        className={cn(
                                            "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent",
                                            "hover:border-gray-500 cursor-pointer"
                                        )}
                                    />
                                    <label htmlFor="measurementUnitInch" className="ml-2 text-sm peer-checked:text-black">Inch</label>
                                </div>
        
                                <div className="flex items-center">
                                    <Input
                                        type="radio"
                                        id="measurementUnitCentimeter"
                                        name="measurementUnit"
                                        value="Centimeter"
                                        checked={measurementUnit === "Centimeter"}
                                        onChange={(e) => {
                                            handleMeasurementUnitChange(e);
                                        }}
                                        className={cn(
                                            "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent",
                                            "hover:border-gray-500 cursor-pointer"
                                        )}
                                    />
                                    <label htmlFor="measurementUnitCentimeter" className="ml-2 text-sm peer-checked:text-black">Centimeter</label>
                                </div>
                                    
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Weight <span className="font-bold">(kg)</span>
                            </label>
                            <Input
                                type="number"
                                value={productWeight === 0 ? '' : productWeight}
                                onChange={(e) => setProductWeight(parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border-2 rounded"
                                min="0.1"
                                step="0.1"
                                placeholder="0.00"
                            />
                        </div>
                        {['length', 'width', 'height'].map((dim) => (
                            <div key={dim}>
                                <label className="block text-sm font-medium mb-1">
                                    {dim.charAt(0).toUpperCase() + dim.slice(1)} <span className="font-bold">({measurementUnit === "Inch" ? "in" : "cm"})</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={productDimensions[dim as keyof typeof productDimensions] === 0 ? '' : productDimensions[dim as keyof typeof productDimensions]}
                                    onChange={(e) => setProductDimensions({
                                        ...productDimensions,
                                        [dim]: parseFloat(e.target.value) || 0
                                    })}
                                    className="w-full p-2 border-2 rounded"
                                    min="1"
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="my-4 border-2">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Shipping Methods</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                        Please select at least one Shipping Method available for this product and configure their fees.
                    </CardDescription>

                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Same day Shipping */}
                        {shippingMethods.sameDayDelivery.available && (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <Input
                                        type="checkbox"
                                        id="sameDayDelivery"
                                        checked={selectedShippingMethods.includes('sameDayDelivery')}
                                        onChange={() => handleMethodSelect('sameDayDelivery')}
                                        className={cn(
                                            "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent",
                                            "hover:border-gray-500 cursor-pointer"
                                        )}
                                    />
                                    <label htmlFor="sameDayDelivery" className="ml-2 text-sm font-medium cursor-pointer">
                                        Same Day Delivery
                                    </label>
                                </div>
                            </div>
                        )}
                        {/* Same day shipping */}

                        {/* Standard Shipping */}
                        {shippingMethods.standardShipping.available && (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <Input
                                        type="checkbox"
                                        id="standardShipping"
                                        checked={selectedShippingMethods.includes('standardShipping')}
                                        onChange={() => handleMethodSelect('standardShipping')}
                                        className={cn(
                                            "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent",
                                            "hover:border-gray-500 cursor-pointer"
                                        )}
                                    />
                                    <label htmlFor="standardShipping" className="ml-2 text-sm font-medium cursor-pointer">
                                        Standard Shipping
                                    </label>
                                </div>
                            </div>
                        )}
                        {/* Standard Shipping */}

                        {/* Express Shipping */}
                        {shippingMethods.expressShipping.available && (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <Input
                                        type="checkbox"
                                        id="expressShipping"
                                        checked={selectedShippingMethods.includes('expressShipping')}
                                        onChange={() => handleMethodSelect('expressShipping')}
                                        className={cn(
                                            "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent",
                                            "hover:border-gray-500 cursor-pointer"
                                        )}
                                    />
                                    <label htmlFor="expressShipping" className="ml-2 text-sm font-medium cursor-pointer">
                                        Express Shipping
                                    </label>
                                </div>
                            </div>
                        )}
                        {/* Express Shipping */}
                    </div>
                </CardContent>
            </Card>

            {/* --- Shipping Zones and Fees --- */}
            {selectedShippingMethods.length > 0 && (
                <Card className="mb-4 border-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Zone-Specific Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {selectedShippingMethods.includes('sameDayDelivery') && shippingMethods?.sameDayDelivery.available && (
                                <div>
                                    <h3 className="text-md font-semibold mb-2">
                                        Same Day Delivery
                                    </h3>

                                    <div className="flex items-center rounded-md">

                                        <Input
                                            name="currencySymbol"
                                            type="text"
                                            value={currencySymbol}
                                            readOnly
                                            required
                                            placeholder="$"
                                            disabled
                                            className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
                                        />

                                        <MoneyInput 
                                            numericValue={methodFees?.sameDay?.fee ?? shippingMethods.sameDayDelivery.fee}
                                            className="w-1/2 border-2"
                                            placeholder="0.00"
                                            onNumericChange={(value) => {
                                                handleFeeChange('sameDay', "domestic", value);
                                            }}
                                        />

                                    </div>
                                    
                                    <p className="text-xs text-gray-500 my-1">
                                        Cut-off: {shippingMethods.sameDayDelivery.estimatedDelivery?.cutOffTime} ({shippingMethods.sameDayDelivery.estimatedDelivery?.timeZone})
                                    </p>
                                    <p className="text-xs text-gray-500 my-1">
                                        Applicable Cities: {shippingMethods.sameDayDelivery.conditions?.applicableCities?.join(', ') || 'N/A'}
                                    </p>
                                </div>
                            )}
                            {(selectedShippingMethods.includes('standardShipping') || selectedShippingMethods.includes('expressShipping')) && Object.entries(shippingZones).map(([zoneKeyStr, zoneDetails]) => {
                                const zoneKey = zoneKeyStr as DeliveryZoneKey;
                                if (!zoneDetails.available) return null;

                                return (
                                    <div key={zoneKey} className="border-b last:border-b">
                                         <h3 className="text-md font-semibold mb-2">
                                            {zoneKey.charAt(0).toUpperCase() + zoneKey.slice(1).replace('_', ' ')} Zone
                                        </h3>
                                        {/* Standard Shipping Fee for this zone */}
                                        {selectedShippingMethods.includes('standardShipping') && shippingMethods?.standardShipping.available && shippingMethods.standardShipping.estimatedDelivery?.[zoneKey] && shippingZones[zoneKey]?.available && ((shippingZones[zoneKey] as any).excludedCountries?.length > 0 || (shippingZones[zoneKey] as any).excludedCities?.length > 0) && (
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium mb-1">Standard Shipping Fee:</label>
                                                <div className="flex items-center rounded-md">

                                                    <Input
                                                        name="currencySymbol"
                                                        type="text"
                                                        value={currencySymbol}
                                                        readOnly
                                                        required
                                                        placeholder="$"
                                                        disabled
                                                        className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
                                                    />

                                                    <MoneyInput
                                                        numericValue={methodFees?.standard?.[zoneKey]?.fee ?? shippingMethods.standardShipping.estimatedDelivery[zoneKey]!.fee}
                                                        onNumericChange={(value) => handleFeeChange('standard', zoneKey, value)}
                                                        className="w-1/2 border-2"
                                                        placeholder="0.00"
                                                    />

                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Est. Delivery: {shippingMethods.standardShipping.estimatedDelivery[zoneKey]?.from}-{shippingMethods.standardShipping.estimatedDelivery[zoneKey]?.to} days
                                                </p>
                                            </div>
                                        )}
                                        {/* Express Shipping Fee for this zone */}
                                        {selectedShippingMethods.includes('expressShipping') && shippingMethods?.expressShipping.available && shippingMethods.expressShipping.estimatedDelivery?.[zoneKey] && (
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium mb-1">Express Shipping Fee:</label>
                                                <div className="flex items-center rounded-md">
                                                    <Input
                                                        name="currencySymbol"
                                                        type="text"
                                                        value={currencySymbol}
                                                        readOnly
                                                        required
                                                        placeholder="$"
                                                        disabled
                                                        className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
                                                    />
                                                    <MoneyInput
                                                        numericValue={methodFees?.express?.[zoneKey]?.fee ?? shippingMethods.expressShipping.estimatedDelivery[zoneKey]!.fee}
                                                        onNumericChange={(value) => handleFeeChange('express', zoneKey, value)}
                                                        className="w-1/2 border-2"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                               
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Est. Delivery: {shippingMethods.expressShipping.estimatedDelivery[zoneKey]?.from}-{shippingMethods.expressShipping.estimatedDelivery[zoneKey]?.to} days
                                                </p>
                                            </div>
                                        )}
                                        {zoneKey === 'domestic' && shippingZones.domestic.excludedCities.length > 0 && (
                                            <p className="text-xs text-gray-500 my-1">
                                                Excluded Cities: {shippingZones.domestic.excludedCities.join(', ')}
                                            </p>
                                        )}
                                        {(zoneKey === 'regional' || zoneKey === 'sub_regional' || zoneKey === 'global') &&
                                            (shippingZones[zoneKey] as any).excludedCountries?.length > 0 && (
                                                <p className="text-xs text-gray-500 my-1">
                                                    Excluded Countries: {(shippingZones[zoneKey] as any).excludedCountries.join(', ')}
                                                </p>
                                            )
                                        }
                                    </div>
                                )
                            })}

                        </div>
                    </CardContent>
                </Card>
            )}

            {errorMessage && (
                <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p>{errorMessage}</p>
                </div>
            )}
            {/* TODO: Add Save Button and Logic */}
            <div className="mt-6 flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={isSaveButtonDisabled}
                    className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                    Save Shipping Details
                </Button>
            </div>
        </div>
    );
}
export default ProductShippingDetails;