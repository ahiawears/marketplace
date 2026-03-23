import { getCartItems } from "@/actions/user-actions/userCartActions/getCartItems";
import PaymentForm from "@/components/place-order/user-payment-form";
import CheckoutCustomerSummary from "@/components/place-order/checkout-customer-summary";
import CheckoutItemList from "@/components/place-order/checkout-item-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/supabase/server";
import { getUserAddress } from "@/actions/user-actions/my-account/get-user-address";
import { getDbPaymentDetails } from "@/actions/user-actions/my-account/getDbPaymentDetails";
import { Terminal } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatStorefrontPrice } from "@/lib/storefront-pricing";

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

interface ShippingGroupSummary {
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
}

interface CouponGroupSummary {
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
}

interface ReturnPolicyGroupSummary {
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
}

const formatShippingMethod = (methodType: string) =>
    methodType
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

const formatShippingZone = (zoneType: string) =>
    zoneType === "sub_regional"
        ? "Sub-Regional"
        : zoneType.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

// Export the metadata object
export const metadata: Metadata = {
    title: "Place Order", 
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default async function PlaceOrder ({ searchParams } : { searchParams?: { [key: string]: string | string[] | undefined }}) {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // Check for a logged-in user; redirect if not found
    if (userError || !userData) {
        // If there's no user, you could redirect to login or handle it differently.
        // For now, let's assume if there's no user, something is wrong.
        console.log("The userError from place-order is: ", userError);
        return notFound();
    }

    const message = searchParams?.message as string | undefined; 

    const [addresses, paymentMethods] = await Promise.all([
        getUserAddress(),
        getDbPaymentDetails(),
    ]);

    const defaultAddress =
        addresses.find((address) => address.is_default) ||
        addresses[0] ||
        null;

    const cartItems = await getCartItems(false, userData.user.id, defaultAddress?.country || null);

    if (!cartItems || cartItems.productsWithImages.length === 0) {
        return notFound();
    }

    const item = cartItems.productsWithImages as CartItemData[];
    const defaultPaymentMethod =
        paymentMethods.find((paymentMethod) => paymentMethod.is_default) ||
        paymentMethods[0] ||
        null;
    const formattedBaseSubtotal = formatStorefrontPrice(cartItems.subtotalBase, "USD");
    const groupedShippingEstimates = (cartItems.groupedShippingEstimates || []) as ShippingGroupSummary[];
    const groupedCouponDiscounts = (cartItems.groupedCouponDiscounts || []) as CouponGroupSummary[];
    const groupedReturnPolicies = (cartItems.groupedReturnPolicies || []) as ReturnPolicyGroupSummary[];
    const checkoutAmount = cartItems.grandTotalCustomerCurrency ?? cartItems.totalPrice ?? 0;
    const formattedCheckoutAmount =
        cartItems.formattedGrandTotal || cartItems.formattedTotalPrice || formatStorefrontPrice(checkoutAmount, cartItems.currencyCode);
    const canSubmitPayment = Boolean(defaultAddress);

  return (
    <div className="container mx-auto p-6">
        {message && (
            <Alert className="mb-6">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Confirm Your Email!</AlertTitle>
                <AlertDescription>
                    {message}
                </AlertDescription>
            </Alert>
        )}

        <div className="mb-8 border-2 bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Checkout
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">Review and Pay</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                Your cart prices are locked in {cartItems.currencyCode}. Review the shipping details, payment method,
                and order items below before completing payment.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <span className="border border-stone-300 px-3 py-2">1. Review cart</span>
                <span className="border border-stone-300 px-3 py-2">2. Confirm shipping</span>
                <span className="border border-stone-300 px-3 py-2">3. Pay securely</span>
            </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
            <div className="space-y-8">
                <CheckoutCustomerSummary
                    address={defaultAddress}
                    paymentMethod={defaultPaymentMethod}
                    email={userData.user.email || ""}
                />
                <CheckoutItemList items={item} />
            </div>

            <div className="space-y-6">
                <section className="border-2 bg-white px-5 py-4">
                    <h2 className="text-lg font-semibold">Checkout Summary</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-stone-600">Subtotal ({cartItems.currencyCode})</span>
                            <span className="font-semibold text-stone-900">{cartItems.formattedTotalPrice}</span>
                        </div>
                        <div className="border-t border-stone-200 pt-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                Shipping by brand
                            </p>
                            {groupedShippingEstimates.length > 0 ? (
                                <div className="space-y-2">
                                    {groupedShippingEstimates.map((group) => (
                                        <div key={group.brandId} className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-stone-700">{group.brandName}</p>
                                                <p className="text-xs text-stone-500">
                                                    {formatShippingMethod(group.methodType)} · {formatShippingZone(group.zoneType)}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-stone-900">
                                                {group.formattedShippingEstimate}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-600">Shipping is unavailable for the selected destination.</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-stone-600">Shipping ({cartItems.currencyCode})</span>
                            <span className="font-semibold text-stone-900">{cartItems.formattedShippingTotal}</span>
                        </div>
                        <div className="border-t border-stone-200 pt-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                Discounts by brand
                            </p>
                            {groupedCouponDiscounts.length > 0 ? (
                                <div className="space-y-2">
                                    {groupedCouponDiscounts.map((group) => (
                                        <div key={group.brandId} className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-stone-700">{group.brandName}</p>
                                                <p className="text-xs text-stone-500">
                                                    {group.couponCode} · {group.couponName}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-emerald-700">
                                                -{group.formattedDiscount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-600">No coupons applied.</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-stone-600">Discounts ({cartItems.currencyCode})</span>
                            <span className="font-semibold text-emerald-700">-{cartItems.formattedDiscountTotal}</span>
                        </div>
                        <div className="border-t border-stone-200 pt-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                Returns by brand
                            </p>
                            {groupedReturnPolicies.length > 0 ? (
                                <div className="space-y-2">
                                    {groupedReturnPolicies.map((group) => (
                                        <div key={group.brandId} className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-stone-700">{group.brandName}</p>
                                                <p className="text-xs text-stone-500">
                                                    {group.policySummary}
                                                </p>
                                            </div>
                                            <span className="text-right text-xs text-stone-500">
                                                {group.responsibilityLabel}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-600">Return details will be confirmed before dispatch.</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-stone-600">Base subtotal (USD)</span>
                            <span className="font-semibold text-stone-900">{formattedBaseSubtotal}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-base">
                            <span className="font-semibold text-stone-900">Grand total</span>
                            <span className="font-semibold text-stone-900">{cartItems.formattedGrandTotal}</span>
                        </div>
                    </div>
                </section>

                <section className="border-2 bg-white px-5 py-4">
                    <h2 className="mb-4 text-lg font-semibold">Pay Now</h2>
                    {!defaultAddress && (
                        <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            Add a shipping address in{" "}
                            <Link href="/my-account" className="font-semibold underline underline-offset-4">
                                My Account
                            </Link>{" "}
                            before completing payment.
                        </div>
                    )}
                    <PaymentForm
                        amount={checkoutAmount}
                        formattedAmount={formattedCheckoutAmount}
                        currencyCode={cartItems.currencyCode}
                        customerEmail={userData.user.email || ""}
                        disabled={!canSubmitPayment || groupedShippingEstimates.length === 0}
                    />
                    {canSubmitPayment && groupedShippingEstimates.length === 0 ? (
                        <p className="mt-3 text-sm text-amber-700">
                            No shipping method is currently available for the selected destination across the items in this cart.
                        </p>
                    ) : null}
                </section>
            </div>
        </div>
    </div>
    
  );
};
