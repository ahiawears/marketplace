import { DatabaseShippingData, ShippingDetails } from "@/lib/types";
import { useEffect, useState } from "react";

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

export const getBrandConfigDetails = (userId: string, access_token: string) => {
    const [shippingConfig, setShippingConfig] = useState<ShippingDetails>(DEFAULT_SHIPPING_CONFIG);
    const [configLoading, setConfigLoading] = useState<boolean>(true);
    const [configError, setConfigError] = useState("");

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
        };
    };
    useEffect(() => {
        if (userId && access_token) {
            const getBrandConfigDetails = async() => {
                try {
                    const response = await fetch (`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-shipping-config`, {
                        headers: {
                            "Authorization": `Bearer ${access_token}`,
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
                        setShippingConfig(DEFAULT_SHIPPING_CONFIG);
                        return;
                    }

                    const { formattedConfig } = setShippingDetailsFromDatabase(data.data);
                    setShippingConfig(formattedConfig);

                } catch (error) {
                    if (error instanceof Error) {
                        setConfigError(error.message || "Failed to load shipping configuration.");
                    } else {
                        setConfigError("An unknown error occurred while loading shipping configuration.");
                    }
                    setShippingConfig(DEFAULT_SHIPPING_CONFIG);
                } finally {
                    setConfigLoading(false);
                }
            }
            getBrandConfigDetails();
        }
    }, [userId, access_token, setShippingConfig, setConfigError]);

    return { shippingConfig, configLoading, configError };
}