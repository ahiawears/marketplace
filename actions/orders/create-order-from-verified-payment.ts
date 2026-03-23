"use server";

import { createClient } from "@/supabase/server";
import { getCartItems } from "@/actions/user-actions/userCartActions/getCartItems";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

type VerifyCustomer = {
    name?: string | null;
    email?: string | null;
};

type VerifyPayload = {
    id?: number | string;
    tx_ref?: string | null;
    flw_ref?: string | null;
    amount?: number | string | null;
    currency?: string | null;
    status?: string | null;
    customer?: VerifyCustomer | null;
};

type AddressRow = {
    id: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    county: string;
    region: string;
    country: string;
    post_code: string;
    country_code: string;
    mobile: string;
    is_default: boolean;
};

type CartRow = {
    id: string;
    currency_code: string | null;
    exchange_rate_used: number | null;
    subtotal_base: number | null;
    subtotal_customer_currency: number | null;
};

type CartItemRow = {
    id: string;
    product_id: string;
    size_id: string | null;
    quantity: number | null;
    price: number | null;
    unit_price_base: number | null;
    unit_price_customer_currency: number | null;
    customer_currency: string | null;
    exchange_rate_used: number | null;
    product_name_snapshot: string | null;
    variant_name_snapshot: string | null;
    size_name_snapshot: string | null;
    image_url_snapshot: string | null;
    sku_snapshot: string | null;
};

type VariantRow = {
    id: string;
    main_product_id: string;
};

type ProductRow = {
    id: string;
    brand_id: string;
};

type ShippingGroupSummary = {
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
};

type ReturnPolicyGroupSummary = {
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
};

type CouponDiscountGroupSummary = {
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
};

type CartSummary = {
    subtotalBase: number;
    subtotalCustomerCurrency: number;
    currencyCode: string;
    discountTotalBase?: number;
    discountTotalCustomerCurrency?: number;
    shippingTotalCustomerCurrency?: number;
    grandTotalCustomerCurrency?: number;
    groupedShippingEstimates?: ShippingGroupSummary[];
    groupedCouponDiscounts?: CouponDiscountGroupSummary[];
    groupedReturnPolicies?: ReturnPolicyGroupSummary[];
};

type ExistingOrderLookup = {
    id: string;
    order_number: string | null;
};

type OrderStatusRow = {
    id: number;
};

type CreatedBrandOrder = {
    id: string;
    brand_id: string;
};

type ExistingPaymentLookup = {
    id: string;
    order_id: string | null;
};

type ProductSizeStockRow = {
    id: string;
    quantity: number | null;
};

type CreateOrderResult = {
    success: boolean;
    created: boolean;
    orderId?: string;
    orderNumber?: string | null;
    error?: string;
};

const nowIso = () => new Date().toISOString();

const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Supabase service role credentials are not configured for order creation.");
    }

    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};

const generateOrderNumber = () => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `AHIA-${timestamp}-${randomSuffix}`;
};

const roundCurrency = (value: number) => Number(value.toFixed(2));

const buildShippingAddressSnapshot = (address: AddressRow) => ({
    id: address.id,
    first_name: address.first_name,
    last_name: address.last_name,
    address: address.address,
    city: address.city,
    county: address.county,
    region: address.region,
    country: address.country,
    post_code: address.post_code,
    country_code: address.country_code,
    mobile: address.mobile,
});

const allocateAmountByLine = (
    totalAmount: number,
    lineSubtotals: { itemId: string; subtotal: number }[]
) => {
    if (lineSubtotals.length === 0 || totalAmount <= 0) {
        return new Map<string, number>();
    }

    const subtotalSum = lineSubtotals.reduce((sum, line) => sum + line.subtotal, 0);
    const allocations = new Map<string, number>();

    if (subtotalSum <= 0) {
        const evenAmount = roundCurrency(totalAmount / lineSubtotals.length);
        let running = 0;
        lineSubtotals.forEach((line, index) => {
            const value = index === lineSubtotals.length - 1 ? roundCurrency(totalAmount - running) : evenAmount;
            allocations.set(line.itemId, value);
            running = roundCurrency(running + value);
        });
        return allocations;
    }

    let allocated = 0;
    lineSubtotals.forEach((line, index) => {
        const ratio = line.subtotal / subtotalSum;
        const value =
            index === lineSubtotals.length - 1
                ? roundCurrency(totalAmount - allocated)
                : roundCurrency(totalAmount * ratio);
        allocations.set(line.itemId, value);
        allocated = roundCurrency(allocated + value);
    });

    return allocations;
};

export async function createOrderFromVerifiedPayment(
    userId: string,
    verifiedPayment: VerifyPayload,
    rawVerifyResponse: unknown,
    injectedSupabase?: SupabaseClient
): Promise<CreateOrderResult> {
    const supabase = injectedSupabase ?? createAdminClient();

    const transactionId = verifiedPayment.id ? String(verifiedPayment.id) : null;
    const txRef = verifiedPayment.tx_ref || null;
    const flwRef = verifiedPayment.flw_ref || null;
    const verifiedAmount = Number(verifiedPayment.amount || 0);
    const verifiedCurrency = verifiedPayment.currency || "USD";
    const billingName = verifiedPayment.customer?.name || null;
    let paymentRecordId: string | null = null;
    const adjustedStockRows: { id: string; originalQuantity: number }[] = [];

    if (!transactionId) {
        return { success: false, created: false, error: "Verified transaction id is missing." };
    }

    const { data: existingPayment } = await supabase
        .from("order_payments")
        .select("id, order_id")
        .or(`flutterwave_transaction_id.eq.${transactionId}${txRef ? `,tx_ref.eq.${txRef}` : ""}`)
        .maybeSingle<ExistingPaymentLookup>();

    if (existingPayment?.order_id) {
        const { data: existingOrder } = await supabase
            .from("orders")
            .select("id, order_number")
            .eq("id", existingPayment.order_id)
            .maybeSingle<ExistingOrderLookup>();

        return {
            success: true,
            created: false,
            orderId: existingOrder?.id || existingPayment.order_id,
            orderNumber: existingOrder?.order_number || null,
        };
    }

    if (existingPayment?.id) {
        paymentRecordId = existingPayment.id;
        await supabase
            .from("order_payments")
            .update({
                tx_ref: txRef,
                flw_ref: flwRef,
                flutterwave_transaction_id: transactionId,
                verified_amount: roundCurrency(verifiedAmount),
                currency_code: verifiedCurrency,
                gateway_status: verifiedPayment.status || "successful",
                verification_status: "verified_pending_order",
                raw_verify_response: rawVerifyResponse,
            })
            .eq("id", existingPayment.id);
    } else {
        const { data: insertedPayment, error: insertedPaymentError } = await supabase
            .from("order_payments")
            .insert({
                tx_ref: txRef,
                flw_ref: flwRef,
                flutterwave_transaction_id: transactionId,
                expected_amount: roundCurrency(verifiedAmount),
                verified_amount: roundCurrency(verifiedAmount),
                currency_code: verifiedCurrency,
                gateway_status: verifiedPayment.status || "successful",
                verification_status: "verified_pending_order",
                raw_verify_response: rawVerifyResponse,
                processed_at: null,
            })
            .select("id")
            .single<{ id: string }>();

        if (insertedPaymentError || !insertedPayment?.id) {
            return { success: false, created: false, error: insertedPaymentError?.message || "Failed to create reconciliation payment record." };
        }

        paymentRecordId = insertedPayment.id;
    }

    const { data: defaultAddress, error: defaultAddressError } = await supabase
        .from("user_address")
        .select("id, first_name, last_name, address, city, county, region, country, post_code, country_code, mobile, is_default")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<AddressRow>();

    if (defaultAddressError || !defaultAddress) {
        return { success: false, created: false, error: "A default shipping address is required to create the order." };
    }

    const cartSummary = (await getCartItems(
        false,
        userId,
        defaultAddress.country || null,
        injectedSupabase
    )) as CartSummary;
    const groupedShippingEstimates = cartSummary.groupedShippingEstimates || [];
    const groupedCouponDiscounts = cartSummary.groupedCouponDiscounts || [];
    const groupedReturnPolicies = cartSummary.groupedReturnPolicies || [];

    const expectedGrandTotal = Number(cartSummary.grandTotalCustomerCurrency || 0);
    if (expectedGrandTotal <= 0) {
        return { success: false, created: false, error: "Cart total is invalid for order creation." };
    }

    if (verifiedCurrency !== cartSummary.currencyCode) {
        return { success: false, created: false, error: "Verified payment currency does not match the locked checkout currency." };
    }

    if (verifiedAmount + 0.01 < expectedGrandTotal) {
        return { success: false, created: false, error: "Verified payment amount is lower than the locked checkout total." };
    }

    const { data: activeCart, error: activeCartError } = await supabase
        .from("carts")
        .select("id, currency_code, exchange_rate_used, subtotal_base, subtotal_customer_currency")
        .eq("user_id", userId)
        .maybeSingle<CartRow>();

    if (activeCartError || !activeCart?.id) {
        return { success: false, created: false, error: "Active cart not found for order creation." };
    }

    const { data: cartItems, error: cartItemsError } = await supabase
        .from("cart_items")
        .select("id, product_id, size_id, quantity, price, unit_price_base, unit_price_customer_currency, customer_currency, exchange_rate_used, product_name_snapshot, variant_name_snapshot, size_name_snapshot, image_url_snapshot, sku_snapshot")
        .eq("cart_id", activeCart.id);

    if (cartItemsError || !cartItems || cartItems.length === 0) {
        return { success: false, created: false, error: "Cart items were not found for order creation." };
    }

    const typedCartItems = cartItems as CartItemRow[];
    const variantIds = typedCartItems.map((item) => item.product_id);

    const [{ data: variants }, { data: products }] = await Promise.all([
        supabase
            .from("product_variants")
            .select("id, main_product_id")
            .in("id", variantIds),
        (async () => {
            const { data: variantRows } = await supabase
                .from("product_variants")
                .select("id, main_product_id")
                .in("id", variantIds);

            const productIds = ((variantRows || []) as VariantRow[]).map((variant) => variant.main_product_id);
            if (productIds.length === 0) {
                return { data: [] };
            }

            return supabase
                .from("products_list")
                .select("id, brand_id")
                .in("id", productIds);
        })(),
    ]);

    const variantToProduct = new Map(
        ((variants || []) as VariantRow[]).map((variant) => [variant.id, variant.main_product_id])
    );
    const productToBrand = new Map(
        ((products || []) as ProductRow[]).map((product) => [product.id, product.brand_id])
    );

    const brandItemGroups = new Map<string, CartItemRow[]>();
    for (const item of typedCartItems) {
        const productId = variantToProduct.get(item.product_id);
        const brandId = productId ? productToBrand.get(productId) : null;
        if (!productId || !brandId) {
            return { success: false, created: false, error: "Unable to resolve brand ownership for one or more cart items." };
        }

        const existingItems = brandItemGroups.get(brandId) || [];
        existingItems.push(item);
        brandItemGroups.set(brandId, existingItems);
    }

    const shippingByBrand = new Map(groupedShippingEstimates.map((group) => [group.brandId, group]));
    const couponByBrand = new Map(groupedCouponDiscounts.map((group) => [group.brandId, group]));
    const returnByBrand = new Map(groupedReturnPolicies.map((group) => [group.brandId, group]));

    const sizeIds = typedCartItems
        .map((item) => item.size_id)
        .filter((sizeId): sizeId is string => Boolean(sizeId));

    if (sizeIds.length !== typedCartItems.length) {
        await supabase
            .from("order_payments")
            .update({
                verification_status: "verified_order_failed",
                raw_verify_response: rawVerifyResponse,
                processed_at: nowIso(),
            })
            .eq("id", paymentRecordId);
        return { success: false, created: false, error: "One or more cart items are missing a locked size selection." };
    }

    const { data: stockRows, error: stockRowsError } = await supabase
        .from("product_sizes")
        .select("id, quantity")
        .in("id", sizeIds);

    if (stockRowsError || !stockRows) {
        await supabase
            .from("order_payments")
            .update({
                verification_status: "verified_order_failed",
                raw_verify_response: rawVerifyResponse,
                processed_at: nowIso(),
            })
            .eq("id", paymentRecordId);
        return { success: false, created: false, error: stockRowsError?.message || "Could not recheck stock before order creation." };
    }

    const stockMap = new Map(
        (stockRows as ProductSizeStockRow[]).map((row) => [row.id, Number(row.quantity || 0)])
    );

    for (const item of typedCartItems) {
        const sizeId = item.size_id as string;
        const requestedQuantity = Number(item.quantity || 0);
        const availableQuantity = stockMap.get(sizeId);

        if (availableQuantity == null || availableQuantity < requestedQuantity) {
            await supabase
                .from("order_payments")
                .update({
                    verification_status: "verified_order_failed",
                    raw_verify_response: rawVerifyResponse,
                    processed_at: nowIso(),
                })
                .eq("id", paymentRecordId);
            return {
                success: false,
                created: false,
                error: `Insufficient stock for ${item.variant_name_snapshot || item.product_name_snapshot || "one of the items"} after payment verification.`,
            };
        }
    }

    const orderNumber = generateOrderNumber();
    const createdAt = nowIso();
    let createdOrderId: string | null = null;
    let createdBrandOrders: CreatedBrandOrder[] = [];

    try {
        const { data: paidStatus } = await supabase
            .from("order_status")
            .select("id")
            .eq("name", "paid")
            .maybeSingle<OrderStatusRow>();

        for (const item of typedCartItems) {
            const sizeId = item.size_id as string;
            const requestedQuantity = Number(item.quantity || 0);
            const availableQuantity = stockMap.get(sizeId);

            if (availableQuantity == null || availableQuantity < requestedQuantity) {
                throw new Error(
                    `Insufficient stock for ${item.variant_name_snapshot || item.product_name_snapshot || "one of the items"} during final stock reservation.`
                );
            }

            const nextQuantity = availableQuantity - requestedQuantity;
            const { error: stockUpdateError } = await supabase
                .from("product_sizes")
                .update({ quantity: nextQuantity })
                .eq("id", sizeId)
                .eq("quantity", availableQuantity);

            if (stockUpdateError) {
                throw new Error(stockUpdateError.message || "Failed to reserve stock before order creation.");
            }

            adjustedStockRows.push({ id: sizeId, originalQuantity: availableQuantity });
            stockMap.set(sizeId, nextQuantity);
        }

        const shippingTotalBase = roundCurrency(
            groupedShippingEstimates.reduce((sum, group) => sum + group.shippingEstimateBase, 0)
        );
        const shippingTotalCustomer = roundCurrency(
            groupedShippingEstimates.reduce((sum, group) => sum + group.shippingEstimateCustomerCurrency, 0)
        );
        const discountTotalBase = roundCurrency(
            groupedCouponDiscounts.reduce((sum, group) => sum + group.discountBase, 0)
        );
        const discountTotalCustomer = roundCurrency(
            groupedCouponDiscounts.reduce((sum, group) => sum + group.discountCustomerCurrency, 0)
        );
        const subtotalBase = roundCurrency(Number(cartSummary.subtotalBase || activeCart.subtotal_base || 0));
        const subtotalCustomer = roundCurrency(
            Number(cartSummary.subtotalCustomerCurrency || activeCart.subtotal_customer_currency || 0)
        );
        const grandTotalBase = roundCurrency(subtotalBase + shippingTotalBase - discountTotalBase);
        const grandTotalCustomer = roundCurrency(expectedGrandTotal);

        const { data: createdOrder, error: orderInsertError } = await supabase
            .from("orders")
            .insert({
                customer_id: userId,
                order_number: orderNumber,
                tx_ref: txRef,
                flw_ref: flwRef,
                flutterwave_transaction_id: transactionId,
                order_date: createdAt,
                total_price: grandTotalCustomer,
                customer_currency: cartSummary.currencyCode,
                exchange_rate_used: activeCart.exchange_rate_used || 1,
                subtotal_base: subtotalBase,
                subtotal_customer_currency: subtotalCustomer,
                shipping_total_base: shippingTotalBase,
                shipping_total_customer_currency: shippingTotalCustomer,
                discount_total_base: discountTotalBase,
                discount_total_customer_currency: discountTotalCustomer,
                grand_total_base: grandTotalBase,
                grand_total_customer_currency: grandTotalCustomer,
                payment_status: "paid",
                status: "paid",
                billing_name: billingName,
                shipping_address: buildShippingAddressSnapshot(defaultAddress),
                shipping_address_snapshot: buildShippingAddressSnapshot(defaultAddress),
                order_source: "web",
                payment_verified_at: createdAt,
                created_at: createdAt,
                updated_at: createdAt,
            })
            .select("id")
            .single<{ id: string }>();

        if (orderInsertError || !createdOrder?.id) {
            throw new Error(orderInsertError?.message || "Failed to create order.");
        }

        createdOrderId = createdOrder.id;

        if (paidStatus?.id) {
            await supabase.from("order_status_history").insert({
                order_id: createdOrderId,
                status_id: paidStatus.id,
                changed_at: createdAt,
            });
        }

        const brandOrderInsertRows = Array.from(brandItemGroups.entries()).map(([brandId, items]) => {
            const subtotalBaseForBrand = roundCurrency(
                items.reduce((sum, item) => sum + Number(item.unit_price_base || 0) * Number(item.quantity || 0), 0)
            );
            const subtotalCustomerForBrand = roundCurrency(
                items.reduce((sum, item) => sum + Number(item.unit_price_customer_currency || item.price || 0) * Number(item.quantity || 0), 0)
            );
            const shippingSummary = shippingByBrand.get(brandId);
            const couponSummary = couponByBrand.get(brandId);
            const returnSummary = returnByBrand.get(brandId);
            const shippingBase = roundCurrency(Number(shippingSummary?.shippingEstimateBase || 0));
            const shippingCustomer = roundCurrency(Number(shippingSummary?.shippingEstimateCustomerCurrency || 0));
            const discountBase = roundCurrency(Number(couponSummary?.discountBase || 0));
            const discountCustomer = roundCurrency(Number(couponSummary?.discountCustomerCurrency || 0));
            const grandTotalBrand = roundCurrency(subtotalCustomerForBrand + shippingCustomer - discountCustomer);
            const returnWindowDays = returnSummary?.returnWindowDays || null;
            const returnWindowEndsAt =
                returnWindowDays != null
                    ? new Date(Date.now() + returnWindowDays * 24 * 60 * 60 * 1000).toISOString()
                    : null;

            return {
                order_id: createdOrderId,
                brand_id: brandId,
                status: "processing",
                total_price: grandTotalBrand,
                customer_currency: cartSummary.currencyCode,
                exchange_rate_used: activeCart.exchange_rate_used || 1,
                subtotal_base: subtotalBaseForBrand,
                subtotal_customer_currency: subtotalCustomerForBrand,
                shipping_fee_base: shippingBase,
                shipping_fee_customer_currency: shippingCustomer,
                discount_total_base: discountBase,
                discount_total_customer_currency: discountCustomer,
                commission_total_base: 0,
                commission_total_customer_currency: 0,
                vendor_payable_base: roundCurrency(subtotalBaseForBrand + shippingBase - discountBase),
                vendor_payable_customer_currency: roundCurrency(subtotalCustomerForBrand + shippingCustomer - discountCustomer),
                settlement_status: "held",
                held_until: returnWindowEndsAt,
                return_window_days: returnWindowDays,
                return_window_ends_at: returnWindowEndsAt,
                return_policy_snapshot: returnSummary?.returnPolicySnapshot || null,
                shipping_rule_snapshot: shippingSummary?.shippingRuleSnapshot || null,
                coupon_snapshot: couponSummary?.couponSnapshot || null,
                created_at: createdAt,
            };
        });

        const { data: insertedBrandOrders, error: brandOrdersInsertError } = await supabase
            .from("brand_orders")
            .insert(brandOrderInsertRows)
            .select("id, brand_id");

        if (brandOrdersInsertError) {
            throw new Error(brandOrdersInsertError.message || "Failed to create vendor orders.");
        }

        createdBrandOrders = (insertedBrandOrders || []) as CreatedBrandOrder[];
        const brandOrderIdMap = new Map(createdBrandOrders.map((brandOrder) => [brandOrder.brand_id, brandOrder.id]));

        const orderItemRows = Array.from(brandItemGroups.entries()).flatMap(([brandId, items]) => {
            const shippingSummary = shippingByBrand.get(brandId);
            const couponSummary = couponByBrand.get(brandId);
            const returnSummary = returnByBrand.get(brandId);
            const brandOrderId = brandOrderIdMap.get(brandId);

            const customerAllocations = allocateAmountByLine(
                Number(shippingSummary?.shippingEstimateCustomerCurrency || 0),
                items.map((item) => ({
                    itemId: item.id,
                    subtotal: Number(item.unit_price_customer_currency || item.price || 0) * Number(item.quantity || 0),
                }))
            );
            const baseAllocations = allocateAmountByLine(
                Number(shippingSummary?.shippingEstimateBase || 0),
                items.map((item) => ({
                    itemId: item.id,
                    subtotal: Number(item.unit_price_base || 0) * Number(item.quantity || 0),
                }))
            );
            const couponCustomerAllocations = allocateAmountByLine(
                Number(couponSummary?.discountCustomerCurrency || 0),
                items.map((item) => ({
                    itemId: item.id,
                    subtotal: Number(item.unit_price_customer_currency || item.price || 0) * Number(item.quantity || 0),
                }))
            );
            const couponBaseAllocations = allocateAmountByLine(
                Number(couponSummary?.discountBase || 0),
                items.map((item) => ({
                    itemId: item.id,
                    subtotal: Number(item.unit_price_base || 0) * Number(item.quantity || 0),
                }))
            );

            return items.map((item) => {
                const quantity = Number(item.quantity || 0);
                const unitPriceCustomer = roundCurrency(Number(item.unit_price_customer_currency || item.price || 0));
                const unitPriceBase = roundCurrency(Number(item.unit_price_base || 0));
                const subtotalCustomer = roundCurrency(unitPriceCustomer * quantity);
                const subtotalBaseLine = roundCurrency(unitPriceBase * quantity);
                const allocatedShippingCustomer = roundCurrency(customerAllocations.get(item.id) || 0);
                const allocatedShippingBase = roundCurrency(baseAllocations.get(item.id) || 0);
                const allocatedDiscountCustomer = roundCurrency(couponCustomerAllocations.get(item.id) || 0);
                const allocatedDiscountBase = roundCurrency(couponBaseAllocations.get(item.id) || 0);
                const returnDeadline =
                    returnSummary?.returnWindowDays != null
                        ? new Date(Date.now() + returnSummary.returnWindowDays * 24 * 60 * 60 * 1000).toISOString()
                        : null;

                return {
                    order_id: createdOrderId,
                    brand_order_id: brandOrderId,
                    product_id: item.product_id,
                    product_size_id: item.size_id,
                    quantity,
                    price: unitPriceCustomer,
                    subtotal: subtotalCustomer,
                    brand_id: brandId,
                    status: "paid",
                    unit_price_base: unitPriceBase,
                    unit_price_customer_currency: unitPriceCustomer,
                    customer_currency: item.customer_currency || cartSummary.currencyCode,
                    exchange_rate_used: item.exchange_rate_used || activeCart.exchange_rate_used || 1,
                    product_name_snapshot: item.product_name_snapshot,
                    variant_name_snapshot: item.variant_name_snapshot,
                    size_name_snapshot: item.size_name_snapshot,
                    image_url_snapshot: item.image_url_snapshot,
                    sku_snapshot: item.sku_snapshot,
                    discount_amount_base: allocatedDiscountBase,
                    discount_amount_customer_currency: allocatedDiscountCustomer,
                    line_total_base: roundCurrency(subtotalBaseLine - allocatedDiscountBase),
                    line_total_customer_currency: roundCurrency(subtotalCustomer - allocatedDiscountCustomer),
                    shipping_fee_base: allocatedShippingBase,
                    shipping_fee_customer_currency: allocatedShippingCustomer,
                    return_window_days_snapshot: returnSummary?.returnWindowDays || null,
                    return_deadline_at: returnDeadline,
                    coupon_snapshot:
                        allocatedDiscountCustomer > 0 || allocatedDiscountBase > 0
                            ? couponSummary?.couponSnapshot || null
                            : null,
                    created_at: createdAt,
                };
            });
        });

        const { error: orderItemsInsertError } = await supabase
            .from("order_items")
            .insert(orderItemRows);

        if (orderItemsInsertError) {
            throw new Error(orderItemsInsertError.message || "Failed to create order items.");
        }

        const { error: orderPaymentUpdateError } = await supabase
            .from("order_payments")
            .update({
                order_id: createdOrderId,
                transaction_id: transactionId,
                amount: roundCurrency(verifiedAmount),
                tx_ref: txRef,
                flw_ref: flwRef,
                flutterwave_transaction_id: transactionId,
                expected_amount: grandTotalCustomer,
                verified_amount: roundCurrency(verifiedAmount),
                currency_code: verifiedCurrency,
                exchange_rate_used: activeCart.exchange_rate_used || 1,
                gateway_status: verifiedPayment.status || "successful",
                verification_status: "verified_order_created",
                raw_verify_response: rawVerifyResponse,
                processed_at: createdAt,
            })
            .eq("id", paymentRecordId);

        if (orderPaymentUpdateError) {
            throw new Error(orderPaymentUpdateError.message || "Failed to finalize payment snapshot.");
        }

        const couponUsageRows = groupedCouponDiscounts.map((group) => ({
            coupon_id: group.couponId,
            used_at: createdAt,
            customer_id: userId,
            order_id: createdOrderId as string,
        }));

        if (couponUsageRows.length > 0) {
            const { error: couponUsageError } = await supabase
                .from("coupon_usage")
                .insert(couponUsageRows);

            if (couponUsageError) {
                throw new Error(couponUsageError.message || "Failed to record coupon usage.");
            }
        }

        await supabase.from("cart_items").delete().eq("cart_id", activeCart.id);
        await supabase.from("cart_applied_coupons").delete().eq("cart_id", activeCart.id);
        await supabase
            .from("carts")
            .update({
                total_price: 0,
                subtotal_base: 0,
                subtotal_customer_currency: 0,
                updated_at: createdAt,
            })
            .eq("id", activeCart.id);

        revalidatePath("/cart");
        revalidatePath("/place-order");
        revalidatePath("/my-account");
        revalidatePath("/dashboard/orders");

        return {
            success: true,
            created: true,
            orderId: createdOrderId,
            orderNumber,
        };
    } catch (error) {
        for (const adjustedStockRow of adjustedStockRows.reverse()) {
            await supabase
                .from("product_sizes")
                .update({ quantity: adjustedStockRow.originalQuantity })
                .eq("id", adjustedStockRow.id);
        }

        if (createdOrderId) {
            if (createdBrandOrders.length > 0) {
                await supabase.from("order_items").delete().eq("order_id", createdOrderId);
                await supabase.from("brand_orders").delete().eq("order_id", createdOrderId);
            }

            await supabase.from("order_status_history").delete().eq("order_id", createdOrderId);
            await supabase.from("orders").delete().eq("id", createdOrderId);
        }

        if (paymentRecordId) {
            await supabase
                .from("order_payments")
                .update({
                    order_id: null,
                    verification_status: "verified_order_failed",
                    raw_verify_response: rawVerifyResponse,
                    processed_at: nowIso(),
                })
                .eq("id", paymentRecordId);
        }

        return {
            success: false,
            created: false,
            error: error instanceof Error ? error.message : "Failed to create order from verified payment.",
        };
    }
}
