import React, { useEffect, useState } from "react";
import CartItem from "@/components/ui/cart-item";
import OrderSummary from "@/components/ui/order-summary";
import { deleteCartItem, updateCartItemQuantity } from "@/actions/user-actions/userCartActions/updateCartItem";
import { Logo } from "@/components/ui/logo";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import CartListsSvg from "@/components/svg/cart-list-svg";
import { Button } from "@/components/ui/button";
import { useGetCartItems } from "@/hooks/useGetCartItems";
import LoadContent from "../load-content/page";
import { useAuth } from '@/hooks/useAuth';
import { getClientAnonymousId } from "@/lib/anon_user/client";
import { createClient } from '@/supabase/server';
import { getServerAnonymousId } from '@/lib/anon_user/server';
import { getCartItems } from "@/actions/user-actions/userCartActions/getCartItems";

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
    } | null;
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
export default async function CartPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    const userIdentifier = userId || await getServerAnonymousId();
    const isAnonymous = !userId;

    const cartItems = await getCartItems(isAnonymous, userIdentifier);
    const groupedShippingEstimates = cartItems.groupedShippingEstimates || [];
    const groupedCouponDiscounts = cartItems.groupedCouponDiscounts || [];
    const groupedReturnPolicies = cartItems.groupedReturnPolicies || [];
    const formattedDiscountTotal = cartItems.formattedDiscountTotal || `${cartItems.currencyCode} 0.00`;
    const formattedShippingTotal = cartItems.formattedShippingTotal || `${cartItems.currencyCode} 0.00`;
    const formattedGrandTotal = cartItems.formattedGrandTotal || cartItems.formattedTotalPrice;

    return (
        <div className="container mx-auto">
            {cartItems.productsWithImages.length > 0 ? (
               <div>
                    <div className="flex border-2 p-4 w-full my-4">
                        <div className="flex items-center justify-center gap-2 mx-auto">
                            <ShoppingCart size={24} className="text-gray-600" />
                            <h2 className="text-2xl font-normal">Your Shopping Cart</h2>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto border-2">
                            {cartItems.productsWithImages.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    serverUserIdentifier={userIdentifier}
                                    isAnonymous={isAnonymous}
                                />
                            ))}
                        </div>

                        <div className="w-full md:w-1/3">
                            <OrderSummary 
                                totalPrice={cartItems.totalPrice}
                                formattedTotalPrice={cartItems.formattedTotalPrice}
                                currencyCode={cartItems.currencyCode}
                                groupedShippingEstimates={groupedShippingEstimates}
                                groupedCouponDiscounts={groupedCouponDiscounts}
                                groupedReturnPolicies={groupedReturnPolicies}
                                formattedDiscountTotal={formattedDiscountTotal}
                                formattedShippingTotal={formattedShippingTotal}
                                formattedGrandTotal={formattedGrandTotal}
                                serverUserIdentifier={userIdentifier}
                                isAnonymous={isAnonymous}
                            />
                        </div>
                    </div>
               </div>
            ) : (
                <div className="mx-auto max-w-2xl lg:max-w-7xl w-full">
                    <div className="w-full p-8 text-center transform transition-all relative"> 
                        <div className="mx-auto">
                            <CartListsSvg className="w-64 h-64 mx-auto" width={256} height={256}/>
                            <p className="font-bold my-4">You have no items in your cart</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
