import { brandCountries } from "@/lib/countries";
import { ShippingDeliveryType, ShippingDetails } from "@/lib/types"
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Select } from "../ui/select";
import { useShippingConfig } from "@/hooks/get-brand-config";
import LoadContent from "@/app/load-content/page";
import { Key } from "lucide-react";
import { set } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ProductShippingDetailsProps {
    userId: string;
    accessToken: string;
}
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
    ifSameDay:{
        cutOffTime: "",
        timeZone: "",
        cutOffDays: []
    },
    freeShippingThreshold: 0,
    freeShippingMethod: "",
    estimatedDeliveryTimes: {
        domestic: { from: "0", to: "0" },
        regional: { from: "0", to: "0" },
        international: { from: "0", to: "0" },
    }
};

const shippingMethodProps = {
    sameDayDelivery: {
        display: "Same Day Delivery",
        fee: "sameDayFee",
        eddfrom: 0,
        eddto: 0,
        isShippingMethod: false,
    },
    standard: {
        display: "Standard Shipping",
        fee: 0,
        eddfrom: 0,
        eddto: 0,
        isShippingMethod: false,
    },
    express: {
        display: "Express Shipping",
        fee: 0,
        eddfrom: 0,
        eddto: 0,
        isShippingMethod: false,
    },
    international: {
        display: "International Shipping",
        fee: 0,
        eddfrom: 0,
        eddto: 0,
        isShippingMethod: false,
    }
}

interface ShippingMethodItem {
    display: string;
    feeKey: keyof ShippingDetails['shippingFees'] | undefined;
    dbKey?: keyof ShippingDetails['shippingMethods'];
    feeValue: number | undefined;
}

interface ShippingZoneItem {
    display: string;
    dbKey: keyof ShippingDetails['shippingZones'];
    timeKey: keyof ShippingDetails['estimatedDeliveryTimes'];
    deliveryTime: { from: string; to: string };
}

const ProductShippingDetails: React.FC<ProductShippingDetailsProps> = ({ userId, accessToken }) => {
    const { config: shippingConfig, loading: configLoading, error: configError, refetch } = useShippingConfig(userId, accessToken);
    const [ config, setConfig ] = useState<ShippingDetails>(DEFAULT_SHIPPING_CONFIG);
    const [ availableShippingMethods, setAvailableShippingMethods] = useState<ShippingMethodItem[]>([]);
    const [ selectedShippingMethods, setSelectedShippingMethods ] = useState<string[]>([]);
    const [ methodFees, setMethodFees ] = useState<{ [key: string]: number }>({});
    const [ availableShippingZones, setAvailableShippingZones ] = useState<ShippingZoneItem[]>([]);
    const [ selectedShippingZones, setSelectedShippingZones ] = useState<string[]>([]);
    const { shippingMethods, shippingZones } = shippingConfig;


    // useEffect(() => {
    //     if (configLoading === false && shippingConfig) {
    //         console.log("The config in product shipping is: ", shippingConfig);

    //         //setConfig(shippingConfig); // Set the full config

    //         const methodMapping: { [key in keyof ShippingDetails['shippingMethods']]?: { dbKey: keyof ShippingDetails['shippingMethods']; display: string; feeKey: keyof ShippingDetails['shippingFees'] } } = {
    //             sameDayDelivery: { dbKey: 'sameDayDelivery', display: 'Same Day Delivery', feeKey: 'sameDayFee' },
    //             standardShipping: { dbKey: 'standardShipping', display: 'Standard Shipping', feeKey: 'standardFee' },
    //             expressShipping: { dbKey: 'expressShipping', display: 'Express Shipping', feeKey: 'expressFee' },
    //             internationalShipping: { dbKey: 'internationalShipping', display: 'International Shipping', feeKey: 'internationalFee' },
    //         };

    //         const activeShippingMethods: ShippingMethodItem[] = Object.entries(shippingConfig.shippingMethods)
    //             .filter(([key, isActive]) => isActive && methodMapping[key as keyof ShippingDetails['shippingMethods']])
    //             .map(([key]) => {
    //                 const methodInfo = methodMapping[key as keyof ShippingDetails['shippingMethods']]!;
    //                 return {
    //                     display: methodInfo.display,
    //                     dbKey: methodInfo.dbKey,
    //                     feeKey: methodInfo.feeKey,
    //                     feeValue: shippingConfig.shippingFees[methodInfo.feeKey],
    //                 };
    //             });

    //         setAvailableShippingMethods(activeShippingMethods);

    //         // Initialize method fees with existing config
    //         const initialFees: { [key: string]: number } = {};
    //         activeShippingMethods.forEach(method => {
    //             if (method.display) {
    //                 initialFees[method.display] = method.feeValue !== undefined ? method.feeValue : 0;
    //             }
    //         });
    //         setMethodFees(initialFees);

    //         // Get shipping zones available
    //         const zoneMapping: { [key in keyof ShippingDetails['shippingZones']]: { display: string; timeKey: keyof ShippingDetails['estimatedDeliveryTimes'] } } = {
    //             domestic: { display: 'Domestic (Nigeria)', timeKey: 'domestic' },
    //             regional: { display: 'Regional (Africa)', timeKey: 'regional' },
    //             international: { display: 'International', timeKey: 'international' },
    //         };

    //         const activeShippingZones: ShippingZoneItem[] = Object.entries(shippingConfig.shippingZones)
    //             .filter(([key, isActive]) => isActive && zoneMapping[key as keyof ShippingDetails['shippingZones']]) // Filter active & mapped
    //             .map(([key]) => {
    //                 const zoneInfo = zoneMapping[key as keyof ShippingDetails['shippingZones']]!;
    //                 const deliveryTimes = shippingConfig.estimatedDeliveryTimes[zoneInfo.timeKey];
    //                 return {
    //                     display: zoneInfo.display,
    //                     dbKey: key as keyof ShippingDetails['shippingZones'], // Keep the original key
    //                     timeKey: zoneInfo.timeKey,
    //                     deliveryTime: deliveryTimes || { from: 'N/A', to: 'N/A' } // Add delivery time info, with fallback
    //                 };
    //             });

    //         setAvailableShippingZones(activeShippingZones);

    //     }
    // }, [configLoading, shippingConfig]);

    const handleMethodSelect = (method: string) => {
        const isMethodSelected = selectedShippingMethods.includes(method);
        if (!isMethodSelected) {
            setSelectedShippingMethods(prev => [...prev, method]);
        } else {
            setSelectedShippingMethods(prev => prev.filter(m => m !== method))
        }
    }

    const handleFeeChange = (method: string, value: number) => {
        setMethodFees(prevFees => ({
            ...prevFees,
            [method]: value,
        }));
    };

    const handleZoneSelect = (zoneDbKey: keyof ShippingDetails['shippingZones']) => {
        const isZoneSelected = selectedShippingZones.includes(zoneDbKey);
        if (!isZoneSelected) {
            setSelectedShippingZones(prev => [...prev, zoneDbKey]);
        } else {
            setSelectedShippingZones(prev => prev.filter(z => z !== zoneDbKey));
        }
    }
    
    const [data, setData] = useState<ShippingDeliveryType>({
        shippingMethods: [],
        shippingZones: [],
        estimatedDelivery: {},
        shippingFees: {},
        handlingTime: "1-3 days",
        weight: 0,
        dimensions: { 
            length: 0, 
            width: 0, 
            height: 0 
        },
        customsDuties: "buyer-paid",
        cashOnDelivery: true
    });

     // Update data state when config changes (especially for defaults)
     useEffect(() => {
        if (config) {
            setData(prevData => ({
                ...prevData,
                handlingTime: `${config.handlingTime.from}-${config.handlingTime.to} days`,
                weight: config.defaultPackage.weight,
                dimensions: {
                    length: config.defaultPackage.dimensions.length,
                    width: config.defaultPackage.dimensions.width,
                    height: config.defaultPackage.dimensions.height
                },
                // You might want to pre-populate shippingMethods/Zones based on config too
                // shippingMethods: availableShippingMethods.map(m => m.display), // Example: select all by default
                // shippingZones: availableShippingZones.map(z => z.dbKey),       // Example: select all by default
            }));
        }
    }, [config, availableShippingMethods, availableShippingZones]); // Add dependencies

    if (configLoading) {
        return <LoadContent />
    }
    return (
        <div>
            {/* --- Package Physical Attributes --- */}
            <Card className="mb-4 border-2">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Package Physical Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-3">Using default package settings from your configuration. You can override them here.</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Weight ({config.defaultPackage.dimensions.dimensionsUnit === 'Inch' ? 'kg' : 'kg'}) {/* Assuming weight is always kg for now */}
                            </label>
                            <Input
                                type="number"
                                value={data.weight}
                                onChange={(e) => setData({
                                    ...data,
                                    weight: parseFloat(e.target.value) || 0
                                })}
                                className="w-full p-2 border-2 rounded"
                                min="0.1"
                                step="0.1"
                            />
                        </div>
                        {['length', 'width', 'height'].map((dim) => (
                            <div key={dim}>
                                <label className="block text-sm font-medium mb-1">
                                    {dim.charAt(0).toUpperCase() + dim.slice(1)} ({config.defaultPackage.dimensions.dimensionsUnit === 'Inch' ? 'in' : 'cm'})
                                </label>
                                <Input
                                    type="number"
                                    value={data.dimensions[dim as keyof typeof data.dimensions]}
                                    onChange={(e) => setData({
                                        ...data,
                                        dimensions: {
                                            ...data.dimensions,
                                            [dim]: parseFloat(e.target.value) || 0
                                        }
                                    })}
                                    className="w-full p-2 border-2 rounded"
                                    min="1"
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2>Available Shipping Methods & Fees</h2>

                {/* Same Day Delivery */}
                {shippingMethods.sameDayDelivery.available && (
                    <div>
                        <h3>Same Day Delivery</h3>
                        <p>Fee: ${shippingMethods.sameDayDelivery.fee.toFixed(2)}</p>
                        <p>Cut-off: {shippingMethods.sameDayDelivery.estimatedDelivery?.cutOffTime} ({shippingMethods.sameDayDelivery.estimatedDelivery?.timeZone})</p>
                        <p>Applicable Cities: {shippingMethods.sameDayDelivery.conditions?.applicableCities?.join(', ') || 'N/A'}</p>
                    </div>
                )}

                {/* Standard Shipping */}
                {shippingMethods.standardShipping.available && (
                    <div>
                        <h3>Standard Shipping</h3>
                        {Object.entries(shippingMethods.standardShipping.estimatedDelivery).map(([zoneKey, details]) => {
                            // Ensure the zoneKey is a valid key for shippingZones
                            const typedZoneKey = zoneKey as keyof typeof shippingZones;
                            if (shippingZones[typedZoneKey]?.available && details) {
                                return (
                                    <div key={`standard-${zoneKey}`} style={{ marginLeft: '20px', marginTop: '10px' }}>
                                        <h4>{zoneKey.charAt(0).toUpperCase() + zoneKey.slice(1).replace('_', '-')} Zone</h4>
                                        <p>Delivery: {details.from}-{details.to} days</p>
                                        <p>Fee: ${details.fee.toFixed(2)}</p>
                                        {typedZoneKey === 'domestic' && shippingZones.domestic.excludedCities.length > 0 && (
                                            <p>Excluded Cities: {shippingZones.domestic.excludedCities.join(', ')}</p>
                                        )}
                                        {(typedZoneKey === 'regional' || typedZoneKey === 'sub_regional' || typedZoneKey === 'global') && 
                                        (shippingZones[typedZoneKey] as any).excludedCountries?.length > 0 && (
                                            <p>Excluded Countries: {(shippingZones[typedZoneKey] as any).excludedCountries.join(', ')}</p>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}

                {/* Express Shipping */}
                {shippingMethods.expressShipping.available && (
                    <div>
                        <h3>Express Shipping</h3>
                        {Object.entries(shippingMethods.expressShipping.estimatedDelivery).map(([zoneKey, details]) => {
                            const typedZoneKey = zoneKey as keyof typeof shippingZones;
                            if (shippingZones[typedZoneKey]?.available && details) {
                                return (
                                    <div key={`express-${zoneKey}`} style={{ marginLeft: '20px', marginTop: '10px' }}>
                                        <h4>{zoneKey.charAt(0).toUpperCase() + zoneKey.slice(1).replace('_', '-')} Zone</h4>
                                        <p>Delivery: {details.from}-{details.to} days</p>
                                        <p>Fee: ${details.fee.toFixed(2)}</p>
                                        {typedZoneKey === 'domestic' && shippingZones.domestic.excludedCities.length > 0 && (
                                            <p>Excluded Cities: {shippingZones.domestic.excludedCities.join(', ')}</p>
                                        )}
                                        {(typedZoneKey === 'regional' || typedZoneKey === 'sub_regional' || typedZoneKey === 'global') && 
                                        (shippingZones[typedZoneKey] as any).excludedCountries?.length > 0 && (
                                            <p>Excluded Countries: {(shippingZones[typedZoneKey] as any).excludedCountries.join(', ')}</p>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}

                {/* Free Shipping */}
                {/* {config.freeShipping?.available && (
                    <div>
                        <h3>Free Shipping</h3>
                        <p>Threshold: ${config.freeShipping.threshold.toFixed(2)}</p>
                        <p>Applicable Methods: {config.freeShipping.applicableMethods.join(', ')}</p>
                        {config.freeShipping.excludedCountries && config.freeShipping.excludedCountries.length > 0 && (
                            <p>Excluded Countries for Free Shipping: {config.freeShipping.excludedCountries.join(', ')}</p>
                        )}
                    </div>
                )} */}

                {/* {!shippingMethods.sameDayDelivery.available &&
                !shippingMethods.standardShipping.available &&
                !shippingMethods.expressShipping.available &&
                !config.freeShipping?.available && (
                    <p>No shipping methods configured or available.</p>
                )} */}
            </div>

            {/* --- Shipping Methods Section --- */}
            {availableShippingMethods.length > 0 && (
                <Card className="my-4 border-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Select Shipping Methods & Set Fees</CardTitle>
                        <p className="text-sm text-gray-600">Choose which globally active methods apply to this product and set product-specific fees (optional, overrides global fee).</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {availableShippingMethods.map((methodItem, index) => (
                            <Card key={index} className="w-full border-2">
                                <CardHeader className="flex flex-row items-center space-x-3"> {/* Use flex-row for checkbox and title */}
                                    <Input
                                        type="checkbox"
                                        id={`method-${methodItem.dbKey}`}
                                        checked={selectedShippingMethods.includes(methodItem.display)}
                                        onChange={() => handleMethodSelect(methodItem.display)}
                                        className={cn(
                                            "h-4 w-4 border-2 text-black focus:ring-0 focus:ring-offset-0",
                                            "peer appearance-none",
                                            "checked:bg-black checked:border-transparent",
                                            "hover:border-gray-500 cursor-pointer flex-shrink-0" // Prevent shrinking
                                        )}
                                    />
                                    <label htmlFor={`method-${methodItem.dbKey}`} className="text-md font-semibold cursor-pointer flex-grow"> {/* Label for better click target */}
                                        {methodItem.display}
                                    </label>
                                </CardHeader>
                                {selectedShippingMethods.includes(methodItem.display) && (
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor={`${methodItem.display}-fee`} className="block text-sm font-medium mb-1">
                                                    Shipping Fee (Override Global: {config.shippingFees[methodItem.feeKey!] || 0})
                                                </label>
                                                <Input
                                                    type="number"
                                                    id={`${methodItem.display}-fee`}
                                                    value={methodFees[methodItem.display] !== undefined ? methodFees[methodItem.display] : ''} // Use empty string if undefined for placeholder
                                                    onChange={(e) => handleFeeChange(methodItem.display, parseFloat(e.target.value))}
                                                    className="w-full p-2 border-2 rounded"
                                                    placeholder={`Default: ${config.shippingFees[methodItem.feeKey!] || 0}`} // Show default as placeholder
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* --- NEW: Shipping Zones Section --- */}
            {availableShippingZones.length > 0 && (
                <Card className="my-4 border-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Available Shipping Zones</CardTitle>
                         <p className="text-sm text-gray-600">These are the zones you've enabled globally. Ensure the selected shipping methods above cover these zones.</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {availableShippingZones.map((zoneItem, index) => (
                            <Card key={index} className="w-full border-2 bg-gray-50"> {/* Slightly different background */}
                                <CardHeader>
                                    {/* If you need selection later, add checkbox here similar to methods */}
                                    <CardTitle className="text-md font-semibold">{zoneItem.display}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-700">
                                        Estimated Delivery: {zoneItem.deliveryTime.from} - {zoneItem.deliveryTime.to} days
                                    </p>
                                    {/* Add more zone-specific info or settings if needed */}
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}
             {/* --- END NEW --- */}

            {/* --- Other Options (Example: Customs, COD) --- */}
            <Card className="my-4 border-2">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Other Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {/* Only show customs if international zone/method is potentially active/selected */}
                     {(availableShippingZones.some(z => z.dbKey === 'international') || availableShippingMethods.some(m => m.dbKey === 'internationalShipping')) && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Customs Duties (for International)
                            </label>
                            <Select
                                value={data.customsDuties}
                                onChange={(e) => setData({
                                    ...data,
                                    customsDuties: e.target.value as any
                                })}
                                className="w-full p-2 border-2 rounded bg-white" // Ensure background for select
                            >
                                <option value="buyer-paid">Buyer pays duties</option>
                                <option value="seller-paid">Seller pays duties</option>
                                {/* <option value="duty-free">Duty-free product</option> */}
                            </Select>
                        </div>
                     )}

                    <div className="flex items-center">
                        <Input
                            type="checkbox"
                            id="cashOnDelivery"
                            checked={data.cashOnDelivery || false}
                            onChange={(e) => setData({
                                ...data,
                                cashOnDelivery: e.target.checked
                            })}
                            className={cn(
                                "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                "peer appearance-none",
                                "checked:bg-black checked:border-transparent",
                                "hover:border-gray-500 cursor-pointer"
                            )}
                        />
                        <label htmlFor="cashOnDelivery" className="ml-2 text-sm font-medium cursor-pointer">
                            Accept Cash on Delivery
                        </label>
                    </div>
                </CardContent>
            </Card>
            {/* TODO: Add Save Button and Logic */}
        </div>
    );
    //     <div className="space-y-6 py-4">
             
    //         {/* Physical Attributes */}
    //         <div className="border-2 p-4 rounded-lg">
    //             <h3 className="font-bold text-lg mb-3">Package Physical Attributes</h3>
    //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    //                 <div>
    //                     <label className="block text-sm font-medium mb-1">
    //                         Weight (kg)
    //                     </label>
    //                     <Input
    //                         type="number"
    //                         value={data.weight}
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             weight: parseFloat(e.target.value)
    //                         })}
    //                         className="w-full p-2 border-2 rounded"
    //                     />
    //                 </div>
    //             </div>
    //             {/* Dimensions inputs... */}
    //             <div className="flex flex-col md:flex-row lg:flex-row w-full my-5 justify-between md:space-x-4">
    //                 <div className="my-2">
    //                     <label htmlFor="length" className="block text-sm font-medium">
    //                         Length (cm)
    //                     </label>
    //                     <Input 
    //                         type="number"
    //                         name="length"
    //                         value={data.dimensions.length}
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             dimensions: {
    //                                 ...data.dimensions,
    //                                 length: parseFloat(e.target.value)
    //                             }
    //                         })}
    //                         className="border-2"
    //                     />
    //                 </div>
    //                 <div className="my-2">
    //                     <label htmlFor="width" className="block text-sm font-medium">
    //                         Width (cm)
    //                     </label>
    //                     <Input 
    //                         type="number"
    //                         name="width"
    //                         value={data.dimensions.width}
    //                         className="border-2"
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             dimensions: {
    //                                 ...data.dimensions,
    //                                 width: parseFloat(e.target.value)
    //                             }
    //                         })}
    //                     />
    //                 </div>
    //                 <div className="my-2">
    //                     <label htmlFor="height" className="block text-sm font-medium">
    //                         Height (cm)
    //                     </label>
    //                     <Input 
    //                         type="number"
    //                         name="height"
    //                         value={data.dimensions.height}
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             dimensions: {
    //                                 ...data.dimensions,
    //                                 height: parseFloat(e.target.value)
    //                             }
    //                         })}
    //                         className="border-2"
    //                     />
    //                 </div>
    //             </div>
    //         </div>


    //         {/* Zone Selection */}
    //         <div className="border-2 p-4 rounded-lg">
    //             <h3 className="font-bold text-lg mb-3">Shipping Zones</h3>
    //             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    //                 {brandCountries.map(country => (
    //                     <div key={country.code} className="flex items-center">
    //                         <Input
    //                             type="checkbox"
    //                             checked={data.shippingZones.includes(country.code)}
    //                             onChange={() => {
    //                                 const updated = data.shippingZones.includes(country.code)
    //                                     ? data.shippingZones.filter(z => z !== country.code)
    //                                     : [...data.shippingZones, country.code];
    //                                 setData({...data, shippingZones: updated});
    //                             }}
    //                             className={cn(
    //                                 "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
    //                                 "peer appearance-none",
    //                                 "checked:bg-black checked:border-transparent",
    //                                 "hover:border-gray-500 cursor-pointer"
    //                             )}
    //                         />
    //                         <span className="ml-2 text-sm">
    //                             {country.name} ({country.code})
    //                         </span>
    //                     </div>
    //                 ))}
    //                 <div className="flex items-center">
    //                     <Input
    //                         type="checkbox"
    //                         checked={data.shippingZones.includes("Continental")}
    //                         onChange={() => {
    //                             const updated = data.shippingZones.includes("Continental")
    //                             ? data.shippingZones.filter(z => z !== "Continental")
    //                             : [...data.shippingZones, "Continental"];
    //                             setData({...data, shippingZones: updated});
    //                         }}
    //                         className={cn(
    //                             "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
    //                             "peer appearance-none",
    //                             "checked:bg-black checked:border-transparent",
    //                             "hover:border-gray-500 cursor-pointer"
    //                         )}
    //                     />
    //                     <span className="ml-2 text-sm">Other African Countries</span>
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Zone-specific Settings */}
    //         {data.shippingZones.map(zone => (
    //             <div key={zone} className="border-2 p-4 rounded-lg">
    //                 <h4 className="font-bold text-lg mb-3">
    //                     {zone === "Continental" ? "Pan-African" : brandCountries.find(c => c.code === zone)?.name} Settings
    //                 </h4>
                
    //                 <div className="grid md:grid-cols-2 gap-4">
    //                     <div>
    //                         <label className="block text-sm font-medium mb-1">
    //                             Delivery Time
    //                         </label>
    //                         <Select
    //                             value={data.estimatedDelivery[zone] || ""}
    //                             onChange={(e) => setData({
    //                             ...data,
    //                             estimatedDelivery: {
    //                                 ...data.estimatedDelivery,
    //                                 [zone]: e.target.value
    //                             }
    //                             })}
    //                             className="w-full p-2 border-2 rounded"
    //                         >
    //                             <option value="">Select duration</option>
    //                             {zone === "Continental" ? (
    //                             <>
    //                                 <option value="7-14 days">7-14 business days</option>
    //                                 <option value="14-21 days">14-21 business days</option>
    //                             </>
    //                             ) : (
    //                             <>
    //                                 <option value="1-3 days">1-3 business days</option>
    //                                 <option value="3-5 days">3-5 business days</option>
    //                                 <option value="5-7 days">5-7 business days</option>
    //                             </>
    //                             )}
    //                         </Select>
    //                     </div>

    //                     <div>
    //                         <label className="block text-sm font-medium mb-1">
    //                             Shipping Fee ({zone === "Continental" ? "USD" : "Local Currency"})
    //                         </label>
    //                         <div className="flex ">
    //                             <span className="inline-flex items-center px-3 border-2 rounded-l">
    //                                 {zone === "Continental" ? "$" : "₦"}
    //                             </span>
    //                             <Input
    //                                 type="number"
    //                                 value={data.shippingFees[zone] || ""}
    //                                 onChange={(e) => setData({
    //                                     ...data,
    //                                     shippingFees: {
    //                                     ...data.shippingFees,
    //                                     [zone]: parseFloat(e.target.value)
    //                                     }
    //                                 })}
    //                                 className="w-full p-2 border-2 rounded-r"
    //                             />
    //                         </div>
    //                     </div>
    //                 </div>

    //                 {!["Continental", "NG"].includes(zone) && (
    //                     <div className="mt-3">
    //                         <label className="block text-sm font-medium mb-1">
    //                             Customs Duties
    //                         </label>
    //                         <Select
    //                             value={data.customsDuties}
    //                             onChange={(e) => setData({
    //                                 ...data,
    //                                 customsDuties: e.target.value as any
    //                             })}
    //                             className="w-full p-2 border-2 rounded"
    //                         >
    //                             <option value="buyer-paid">Buyer pays duties</option>
    //                             <option value="seller-paid">I'll pay duties</option>
    //                             <option value="duty-free">Duty-free product</option>
    //                         </Select>
    //                     </div>
    //                 )}
    //             </div>
    //         ))}

    //         {/* Payment Options */}
    //         <div className="border-2 p-4 rounded-lg">
    //             <div className="flex items-center">
    //                 <Input
    //                     type="checkbox"
    //                     checked={data.cashOnDelivery || false}
    //                     onChange={(e) => setData({
    //                         ...data,
    //                         cashOnDelivery: e.target.checked
    //                     })}
    //                     className={cn(
    //                         "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
    //                         "peer appearance-none",
    //                         "checked:bg-black checked:border-transparent",
    //                         "hover:border-gray-500 cursor-pointer"
    //                     )}
    //                 />
    //                 <span className="ml-2 text-sm font-medium">
    //                     Accept Cash on Delivery (Recommended for African buyers)
    //                 </span>
    //             </div>
    //         </div>
    //     </div>
    // );
}
export default ProductShippingDetails;