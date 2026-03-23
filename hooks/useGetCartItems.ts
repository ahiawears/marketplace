// src/hooks/useGetCartItems.ts
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getClientAnonymousId } from "@/lib/anon_user/client";

interface CartItemData {
    id: string;
    product_id: {
        id: string;
        name: string;
    }; 
    product_name: string;
    main_image_url: string;
    variant_color: {
        name: string;
        hex: string;
    };
    size_name: string;
    quantity: number;
    price: number;
    currency_code?: string;
    formatted_price?: string;
}
interface CartData {
    productsWithImages: CartItemData[];
    totalPrice: number;
    currencyCode: string;
    formattedTotalPrice: string;
    subtotalBase: number;
    subtotalCustomerCurrency: number;
    groupedShippingEstimates: {
        brandId: string;
        brandName: string;
        methodType: string;
        zoneType: string;
        shippingEstimateBase: number;
        shippingEstimateCustomerCurrency: number;
        formattedShippingEstimate: string;
        shippingRuleSnapshot: {
            strategy: string;
            methodType: string;
            zoneType: string;
            shippingEstimateBase: number;
            shippingEstimateCustomerCurrency: number;
            currencyCode: string;
            exchangeRateUsed: number;
            destinationCountryCode: string | null;
        };
    }[];
    groupedCouponDiscounts: {
        brandId: string;
        brandName: string;
        couponId: string;
        couponCode: string;
        couponName: string;
        discountType: string;
        appliesTo: string;
        discountBase: number;
        discountCustomerCurrency: number;
        formattedDiscount: string;
        couponSnapshot: {
            couponId: string;
            code: string;
            name: string;
            discountType: string;
            appliesTo: string;
            discountBase: number;
            discountCustomerCurrency: number;
            currencyCode: string;
        };
    }[];
    discountTotalBase: number;
    discountTotalCustomerCurrency: number;
    formattedDiscountTotal: string;
    groupedReturnPolicies: {
        brandId: string;
        brandName: string;
        isReturnable: boolean;
        returnWindowDays: number | null;
        responsibilityLabel: string;
        policySummary: string;
        returnPolicySnapshot: {
            isReturnable: boolean;
            returnWindowDays: number | null;
            responsibilityLabel: string;
            policySummary: string;
        };
    }[];
    shippingTotalCustomerCurrency: number;
    formattedShippingTotal: string;
    grandTotalCustomerCurrency: number;
    formattedGrandTotal: string;
}

export const useGetCartItems = () => {
    const { userId } = useAuth();
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState<Error | null>(null);
    const [cartItems, setCartItems] = useState<CartData | null>(null);
    
    useEffect(() => {
        let isMounted = true;
        const anonymousId = getClientAnonymousId();

        const fetchCartItems = async () => {
            try {
                if (!userId && !anonymousId) return;
                
                setCartLoading(true);
                setCartError(null);

                const response = await fetch(
                    `/api/cart?${userId ? `userType=user&Id=${userId}` : `userType=anonymous&Id=${anonymousId}`}`
                );
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                if (isMounted) setCartItems(data.data);
            } catch (err) {
                if (isMounted) {
                    setCartError(err instanceof Error ? err : new Error('Cart error'));
                }
            } finally {
                if (isMounted) setCartLoading(false);
            }
        };

        fetchCartItems();

        return () => { isMounted = false; };
    }, [userId]); // Only depend on userId

    return { cartLoading, cartError, cartItems };
};
