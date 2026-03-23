'use client';

import React, { useState, useTransition } from 'react';
import { Button } from './button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Input } from './input';


interface OrderSummaryProps {
    totalPrice: number;
    formattedTotalPrice: string;
    currencyCode: string;
    groupedShippingEstimates: {
        brandId: string;
        brandName: string;
        methodType: string;
        zoneType: string;
        shippingEstimateBase: number;
        shippingEstimateCustomerCurrency: number;
        formattedShippingEstimate: string;
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
    }[];
    groupedReturnPolicies: {
        brandId: string;
        brandName: string;
        isReturnable: boolean;
        returnWindowDays: number | null;
        responsibilityLabel: string;
        policySummary: string;
    }[];
    formattedDiscountTotal: string;
    formattedShippingTotal: string;
    formattedGrandTotal: string;
    serverUserIdentifier: string;
    isAnonymous: boolean;
}

const formatShippingMethod = (methodType: string) =>
    methodType
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

const formatShippingZone = (zoneType: string) =>
    zoneType === "sub_regional"
        ? "Sub-Regional"
        : zoneType.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

const OrderSummary: React.FC<OrderSummaryProps> = ({
    totalPrice,
    formattedTotalPrice,
    currencyCode,
    groupedShippingEstimates,
    groupedCouponDiscounts,
    groupedReturnPolicies,
    formattedDiscountTotal,
    formattedShippingTotal,
    formattedGrandTotal,
    serverUserIdentifier,
    isAnonymous
}) => {  
    const [ checkoutPending, startCheckoutTransition ] = useTransition();
    const [couponPending, startCouponTransition] = useTransition();
    const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
    const [couponMessage, setCouponMessage] = useState("");
    const [couponError, setCouponError] = useState("");
    const { userId } = useAuth();
    const router = useRouter();
    const onCheckout = () => {
        startCheckoutTransition(() => {
            if (!userId) {
                router.push(`/signup?redirect=checkout`);
            } else {
                router.push('/place-order');
            }
        })
    };

    const handleCouponInputChange = (brandId: string, value: string) => {
        setCouponInputs((prev) => ({ ...prev, [brandId]: value.toUpperCase() }));
    };

    const handleApplyCoupon = (brandId: string) => {
        const code = couponInputs[brandId]?.trim();
        if (!code) {
            setCouponError("Enter a coupon code.");
            setCouponMessage("");
            return;
        }

        startCouponTransition(async () => {
            setCouponError("");
            setCouponMessage("");
            const response = await fetch("/api/cart/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setCouponError(data.message || "Failed to apply coupon.");
                return;
            }
            setCouponMessage(data.message || "Coupon applied.");
            router.refresh();
        });
    };

    const handleRemoveCoupon = (brandId: string) => {
        startCouponTransition(async () => {
            setCouponError("");
            setCouponMessage("");
            const response = await fetch("/api/cart/coupons", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brandId }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setCouponError(data.message || "Failed to remove coupon.");
                return;
            }
            setCouponMessage(data.message || "Coupon removed.");
            router.refresh();
        });
    };
    return (
        <div className="p-6 bg-white border-2 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-4">
                <span>Sub Total:</span>
                <span>{formattedTotalPrice}</span>
            </div>
            <div className="mb-4 space-y-2 border-t border-stone-200 pt-4">
                <p className="text-sm font-medium text-stone-900">Coupons by brand</p>
                {groupedShippingEstimates.length > 0 ? (
                    groupedShippingEstimates.map((group) => {
                        const appliedCoupon = groupedCouponDiscounts.find((coupon) => coupon.brandId === group.brandId);

                        return (
                            <div key={group.brandId} className="space-y-2 border border-stone-200 p-3">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-stone-800">{group.brandName}</p>
                                        {appliedCoupon ? (
                                            <p className="text-xs text-emerald-700">
                                                {appliedCoupon.couponCode} applied · -{appliedCoupon.formattedDiscount}
                                            </p>
                                        ) : null}
                                    </div>
                                    {appliedCoupon ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveCoupon(group.brandId)}
                                            disabled={couponPending}
                                        >
                                            Remove
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                value={couponInputs[group.brandId] || ""}
                                                onChange={(event) => handleCouponInputChange(group.brandId, event.target.value)}
                                                placeholder="Coupon code"
                                                className="w-32 border-2 px-2 py-1 text-sm uppercase"
                                                disabled={couponPending}
                                            />
                                            <Button
                                                type="button"
                                                className='border-2 rounded-none'
                                                size="sm"
                                                onClick={() => handleApplyCoupon(group.brandId)}
                                                disabled={couponPending}
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-stone-600">
                        Add items first to apply vendor coupons.
                    </p>
                )}
                {couponMessage && <p className="text-xs text-emerald-700">{couponMessage}</p>}
                {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            </div>
            <div className="mb-4 space-y-2 border-t border-stone-200 pt-4">
                <p className="text-sm font-medium text-stone-900">Estimated shipping by brand</p>
                {groupedShippingEstimates.length > 0 ? (
                    groupedShippingEstimates.map((group) => (
                        <div key={group.brandId} className="flex items-start justify-between gap-4 text-sm text-stone-700">
                            <div>
                                <p>{group.brandName}</p>
                                <p className="text-xs text-stone-500">
                                    {formatShippingMethod(group.methodType)} · {formatShippingZone(group.zoneType)}
                                </p>
                            </div>
                            <span>{group.formattedShippingEstimate}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-stone-600">
                        Shipping will be finalized at checkout.
                    </p>
                )}
            </div>
            <div className="flex justify-between mb-2">
                <span>Estimated Shipping:</span>
                <span>{formattedShippingTotal}</span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Discounts:</span>
                <span>-{formattedDiscountTotal}</span>
            </div>
            <div className="mb-4 space-y-2 border-t border-stone-200 pt-4">
                <p className="text-sm font-medium text-stone-900">Returns by brand</p>
                {groupedReturnPolicies.length > 0 ? (
                    groupedReturnPolicies.map((group) => (
                        <div key={group.brandId} className="text-sm text-stone-700">
                            <p>{group.brandName}</p>
                            <p className="text-xs text-stone-500">
                                {group.policySummary} · {group.responsibilityLabel}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-stone-600">
                        Return details will be confirmed at checkout.
                    </p>
                )}
            </div>
            <div className="flex justify-between mb-4 font-semibold">
                <span>Estimated Total:</span>
                <span>{formattedGrandTotal}</span>
            </div>
            <p className="mb-4 text-xs text-stone-500">
                Shipping is estimated using the product shipping rules and the base-plus-incremental method. Coupon discounts are applied per vendor group and locked again at checkout.
            </p>
            <Button
                onClick={onCheckout}
                className="w-full text-white font-semibold py-2 rounded-none my-5"
            >
                Checkout
            </Button>
        </div>
    );
};

export default OrderSummary;
