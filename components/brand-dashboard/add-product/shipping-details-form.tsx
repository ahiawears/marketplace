import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { DeliveryZoneKey, ProductMethodZoneConfig, ShippingConfigDataProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import Link from "next/link";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { toast } from "sonner";
import { ShippingDetailsSchemaType } from "@/lib/validation-logics/add-product-validation/product-schema";
import { useShippingDetailsValidation } from "@/hooks/local-store/add-product/use-steps-validation";

interface ShippingDetailsPropss {
    currencySymbol: string;
    shippingConfig: ShippingConfigDataProps | null;
}
interface ProductDimensions {
    length: number;
    width: number;
    height: number;
}

interface ProductShippingDeliveryType {
    methods?: {
        standard?: Partial<Record<DeliveryZoneKey, ProductMethodZoneConfig>>;
        express?: Partial<Record<DeliveryZoneKey, ProductMethodZoneConfig>>;
        sameDay?: {
            available?: boolean;
            fee?: number;
        };
    }
    weight: number;
    dimensions: ProductDimensions;
    measurementUnit: "Inch" | "Centimeter";
}
type ShippingDetailsErrors = Partial<Record<keyof ShippingDetailsSchemaType, string | number>>;
const ShippingDetailsForm: FC<ShippingDetailsPropss> = ({ currencySymbol, shippingConfig }) => {
    if (shippingConfig === null) {
        return (
            <Card className="my-4 border-2 rounded-none align-middle justify-center">   
                <CardHeader className="px-0">
                    <CardTitle className="text-lg font-semibold px-2 text-center">Shipping Configuration not set yet.</CardTitle>
                </CardHeader>
                <CardDescription className="text-sm text-gray-600 px-2 font-bold text-center">
                    Please Fill in your Shipping Configuration Form to continue
                </CardDescription>
                <Link
                    href={"/dashboard/shipping-configuration"}
                    className="flex justify-center w-full my-4"
                >
                    <Button
                        className="border-2 my-2 mx-auto rounded-none"
                    >
                        Go To Shipping Configuration
                    </Button>
                </Link>
            </Card>
        )  
    }

    const { validateField, validateStep } = useShippingDetailsValidation();

    const { shippingMethods, shippingZones } = shippingConfig;
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedShippingMethods, setSelectedShippingMethods] = useState<string[]>([]);
    const { productId, setShippingDetails, shippingDetails } = useProductFormStore();
    const [errors, setErrors] = useState<ShippingDetailsErrors>({}); 
    
    // State to hold the fees the user enters for each method/zone
    const [methodFees, setMethodFees] = useState<ProductShippingDeliveryType["methods"]>();

    const handleFieldValidation = async <TField extends keyof ShippingDetailsSchemaType>(
        name: TField,
        value: ShippingDetailsSchemaType[TField]
    ) => {
        const { isValid, error } = validateField(name, value);
        if (!isValid) {
            setErrors(prev => ({ ...prev, [name]: error }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            })
        }
    }
    // const validateForm = () => {
    //     const dataToValidate = {
    //         ...shippingDetailsData,
    //         methods: selectedShippingMethods.length > 0 ? methodFees : undefined,
    //     };
    //     const result = ShippingDetailsValidationSchema.safeParse(dataToValidate);
    //     if (!result.success) {
    //         const flatErrors = result.error.flatten();
    //         const newErrors = {
    //             ...flatErrors.fieldErrors,
    //             methods: flatErrors.formErrors[0],
    //         };
    //         setErrors(newErrors);
    //         return false;
    //     }
    //     setErrors({});
    //     return true;
    // };

    const validateForm = () => {
        const result = validateStep(shippingDetails);
        if(!result.isValid) {
            setErrors(result.errors as ShippingDetailsErrors);
            return false;
        }
        setErrors({});
        return true;
    }

    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const fieldName = name as keyof ShippingDetailsSchemaType;
        let processedValue: string | number = value;

        if (type === 'number') {
            processedValue = value === '' ? 0 : parseFloat(value);
            if (isNaN(processedValue as number)) {
                processedValue = 0;
            }
        }

        handleFieldValidation(fieldName, processedValue);
    }

    const handleFormInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isDimension = ['length', 'width', 'height'].includes(name);
        const isNumeric = e.target.type === 'number';
        let processedValue: string | number = value;

        if (isNumeric) {
            processedValue = value === '' ? 0 : parseFloat(value);
            if (isNaN(processedValue as number)) {
                processedValue = 0;
            }
        }

        if (isDimension) {
            setShippingDetails({
                dimensions: {
                    ...shippingDetails.dimensions,
                    [name]: processedValue,
                },
            });
        } else {
            setShippingDetails({ [name]: processedValue });
        }

        handleFieldValidation(name as keyof ShippingDetailsSchemaType, processedValue);
    }

    const handleFeeChange = (
        productMethodKey: 'sameDay' | 'standard' | 'express',
        zoneKey: DeliveryZoneKey | undefined,
        value: number
    ) => {
        setMethodFees(prev => {
            const newFees = JSON.parse(JSON.stringify(prev || {}));

            // Handle Same Day Delivery
            if (productMethodKey === 'sameDay') {
                if (!newFees.sameDay) {
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

    const handleMethodSelect = (method: string) => {
        setSelectedShippingMethods(prev => {
            // If the method is already selected, unselect it and remove from fees
            if (prev.includes(method)) {
                setMethodFees(prevFees => {
                    const newFees = { ...prevFees };
                    if (method === 'sameDayDelivery') {
                        delete newFees.sameDay;
                    } else if (method === 'standardShipping') {
                        delete newFees.standard;
                    } else if (method === 'expressShipping') {
                        delete newFees.express;
                    }
                    return newFees;
                });
                return prev.filter(m => m !== method);
            }
            // If the method is not selected, select it and add default fees
            else {
                setMethodFees(prevFees => {
                    const newFees = { ...prevFees };
                    if (method === 'sameDayDelivery' && shippingMethods.sameDayDelivery.available) {
                        newFees.sameDay = {
                            available: true,
                            fee: shippingMethods.sameDayDelivery.fee
                        };
                    } else if (method === 'standardShipping' && shippingMethods.standardShipping.available) {
                        newFees.standard = {};
                        Object.entries(shippingZones).forEach(([zoneKey, zoneDetails]) => {
                            if (zoneDetails.available) {
                                newFees.standard![zoneKey as DeliveryZoneKey] = {
                                    fee: shippingMethods.standardShipping.estimatedDelivery?.[zoneKey as DeliveryZoneKey]?.fee,
                                    available: true,
                                };
                            }
                        });
                    } else if (method === 'expressShipping' && shippingMethods.expressShipping.available) {
                        newFees.express = {};
                        Object.entries(shippingZones).forEach(([zoneKey, zoneDetails]) => {
                            if (zoneDetails.available) {
                                newFees.express![zoneKey as DeliveryZoneKey] = {
                                    fee: shippingMethods.expressShipping.estimatedDelivery?.[zoneKey as DeliveryZoneKey]?.fee,
                                    available: true,
                                };
                            }
                        });
                    }
                    return newFees;
                });
                return [...prev, method];
            }
        });
    }
    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the validation errors before submitting.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Saving shipping details...");
        
        const finalShippingDetails = {
            ...shippingDetails,
            methods: methodFees,
            productId: productId
        };

        try {
            const formData = new FormData();
            formData.append('productShippingConfig', JSON.stringify(finalShippingDetails));

            const response = await fetch('/api/products/upload-shipping-details', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("Shipping details saved successfully!", { id: toastId });
            } else {
                toast.error(result.message || "An unknown error occurred.", { id: toastId });
            }
            
        } catch (error) {
            console.log(error);
            toast.error("Failed to save shipping details.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSave}>
            {/* --- Package Physical Attributes --- */}
            <Card className="my-4 border-2 rounded-none">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Package Physical Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="weight">
                            Weight <span className="font-bold">(kg)</span>
                        </label>
                        <Input
                            name="weight"
                            type="number"
                            value={shippingDetails.weight === 0 ? '' : shippingDetails.weight}
                            onChange={handleFormInput}
                            className="w-full p-2 border-2"
                            min="0.1"
                            onBlur={handleBlur}
                            step="0.1"
                            placeholder="0.00"
                        />
                        {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}

                    </div>
                    <div className="my-2">
                        <div>
                            <label htmlFor="measurementUnit" className="block text-sm font-bold text-gray-900">Select the measurement unit</label>
                            <div className="flex gap-4 mt-2">
                                <div className="flex items-center">
                                    <Input
                                        type="radio"
                                        id="measurementUnitInch"
                                        name="measurementUnit"
                                        value="Inch"
                                        checked={shippingDetails.measurementUnit === "Inch"}
                                        onChange={handleFormInput}
                                        className={cn(
                                            "h-4 w-4 border-2 cursor-pointer",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent"
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
                                        checked={shippingDetails.measurementUnit === "Centimeter"}
                                        onChange={handleFormInput}
                                        className={cn(
                                            "h-4 w-4 border-2 cursor-pointer",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent"
                                        )}
                                    />
                                    <label htmlFor="measurementUnitCentimeter" className="ml-2 text-sm peer-checked:text-black">Centimeter</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['length', 'width', 'height'].map((dim) => (
                            <div key={dim}>
                                <label className="block text-sm font-medium mb-1">
                                    {dim.charAt(0).toUpperCase() + dim.slice(1)} <span className="font-bold">({shippingDetails.measurementUnit === "Inch" ? "in" : "cm"})</span>
                                </label>
                                <Input
                                    name={dim}
                                    type="number"
                                    placeholder="0.00"
                                    onBlur={handleBlur}
                                    value={shippingDetails.dimensions[dim as keyof ProductDimensions] === 0 ? '' : shippingDetails.dimensions[dim as keyof ProductDimensions]}
                                    onChange={handleFormInput}
                                    className="w-full p-2 border-2"
                                    min="1"
                                />
                                {errors.dimensions && typeof errors.dimensions === 'object' && errors.dimensions[dim as keyof ProductDimensions] && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dimensions[dim as keyof ProductDimensions]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="my-4 border-2 rounded-none">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Shipping Methods</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                        Please select at least one Shipping Method available for this product and configure their fees.
                    </CardDescription>
                    {errors.methods && <p className="text-red-500 text-xs mt-1">{errors.methods}</p>}

                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
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
                    </div>
                </CardContent>
            </Card>
            {/* --- Shipping Zones and Fees --- */}
            {selectedShippingMethods.length > 0 && (
                <Card className="mb-4 border-2 rounded-none">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Zone-Specific Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Same Day Delivery Fee Input */}
                            {selectedShippingMethods.includes('sameDayDelivery') && shippingMethods?.sameDayDelivery.available && (
                                <div>
                                    <h3 className="text-md font-semibold mb-2">
                                        Same Day Delivery
                                    </h3>
                                    <div className="flex items-center">
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
                                            onBlur={handleBlur}
                                            onNumericChange={(value) => {
                                                handleFeeChange('sameDay', undefined, value);
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

                            {/* Standard and Express Fees by Zone */}
                            {(selectedShippingMethods.includes('standardShipping') || selectedShippingMethods.includes('expressShipping')) && Object.entries(shippingZones).map(([zoneKeyStr, zoneDetails]) => {
                                const zoneKey = zoneKeyStr as DeliveryZoneKey;
                                if (!zoneDetails.available) return null;

                                // Get the excluded cities/countries list for this zone
                                const exclusions = (zoneKey === 'domestic')
                                    ? shippingZones.domestic.excludedCities
                                    : (shippingZones[zoneKey] as { excludedCountries: string[] }).excludedCountries;
                                
                                return (
                                    <div key={zoneKey} className="border-b last:border-b-0 py-2">
                                        <h3 className="text-md font-semibold mb-2">
                                            {zoneKey.charAt(0).toUpperCase() + zoneKey.slice(1).replace(/_/g, ' ')} Zone
                                        </h3>

                                        {/* Standard Shipping Fee for this zone */}
                                        {selectedShippingMethods.includes('standardShipping') && shippingMethods?.standardShipping.available && shippingMethods.standardShipping.estimatedDelivery?.[zoneKey] && (
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium mb-1">Standard Shipping Fee:</label>
                                                <div className="flex items-center">
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
                                                        numericValue={methodFees?.standard?.[zoneKey]?.fee ?? shippingMethods.standardShipping.estimatedDelivery[zoneKey]?.fee}
                                                        onNumericChange={(value) => handleFeeChange('standard', zoneKey, value)}
                                                        className="w-1/2 border-2"
                                                        placeholder="0.00"
                                                        onBlur={handleBlur}
                                                    />
                                                    {/* {errors.methods && typeof errors.methods === 'object' && } */}
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
                                                <div className="flex items-center">
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
                                                        numericValue={methodFees?.express?.[zoneKey]?.fee ?? shippingMethods.expressShipping.estimatedDelivery[zoneKey]?.fee}
                                                        onNumericChange={(value) => handleFeeChange('express', zoneKey, value)}
                                                        className="w-1/2 border-2"
                                                        placeholder="0.00"
                                                        onBlur={handleBlur}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Est. Delivery: {shippingMethods.expressShipping.estimatedDelivery[zoneKey]?.from}-{shippingMethods.expressShipping.estimatedDelivery[zoneKey]?.to} days
                                                </p>
                                            </div>
                                        )}

                                        {/* Exclusions */}
                                        {exclusions.length > 0 && (
                                            <p className="text-xs text-gray-500 my-1">
                                                {zoneKey === 'domestic' ? 'Excluded Cities' : 'Excluded Countries'}: {exclusions.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
            <div className="mt-6 flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                    Save Shipping Details
                </Button>
            </div>
        </form>
    );
}



export default ShippingDetailsForm;
