"use server";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/supabase/server";
import { formatStorefrontPrice, convertBaseCurrencyPrice } from "@/lib/storefront-pricing";

type CartCouponApplication = {
  id: string;
  coupon_id: string;
  brand_id: string;
  code: string;
};

type CouponRow = {
  id: string;
  brand_id: string;
  name: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number | null;
  base_currency_discount_value: number | null;
  base_currency_min_order_amount: number | null;
  currency_code: string | null;
  usage_limit: number | null;
  min_order_amount: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  auto_apply: boolean;
  applies_to: "entire_store" | "products" | "categories";
  eligible_customers: "all_customers" | "new_customers" | "returning_customers" | "specific_customers";
  include_sale_items: boolean;
  single_use_per_customer: boolean;
};

type CouponProductRow = {
  coupon_id: string;
  product_id: string;
};

type CouponCategoryRow = {
  coupon_id: string;
  category_id: string;
};

type CouponCountryRow = {
  coupon_id: string;
  country_code: string;
};

type CartVariantProductRow = {
  id: string;
  main_product_id: string;
};

type ProductCategoryBrandRow = {
  id: string;
  brand_id: string;
  category_id: string | null;
};

type CartItemForCoupon = {
  id: string;
  product_id: string;
  quantity: number | null;
  unit_price_base: number | null;
  unit_price_customer_currency: number | null;
  price: number | null;
  variant_name_snapshot: string | null;
  product_name_snapshot: string | null;
};

type EligibleLine = {
  cartItemId: string;
  productId: string;
  quantity: number;
  subtotalBase: number;
  subtotalCustomerCurrency: number;
};

type CouponDiscountSummary = {
  brandId: string;
  brandName: string;
  couponId: string;
  couponCode: string;
  couponName: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  appliesTo: "entire_store" | "products" | "categories";
  discountBase: number;
  discountCustomerCurrency: number;
  formattedDiscount: string;
  couponSnapshot: {
    couponId: string;
    code: string;
    name: string;
    discountType: "percentage" | "fixed" | "free_shipping";
    appliesTo: "entire_store" | "products" | "categories";
    discountBase: number;
    discountCustomerCurrency: number;
    currencyCode: string;
  };
  eligibleLineDiscounts: Map<string, { discountBase: number; discountCustomerCurrency: number }>;
};

export type CartCouponContext = {
  groupedCouponDiscounts: CouponDiscountSummary[];
  discountTotalBase: number;
  discountTotalCustomerCurrency: number;
  formattedDiscountTotal: string;
};

type ApplyCouponResult = {
  success: boolean;
  message: string;
  brandId?: string;
};

const nowIso = () => new Date().toISOString();
const roundCurrency = (value: number) => Number(value.toFixed(2));

const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role credentials are not configured for coupon validation.");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const allocateAmountByLine = (
  totalAmount: number,
  lineSubtotals: { cartItemId: string; subtotal: number }[]
) => {
  if (lineSubtotals.length === 0 || totalAmount <= 0) {
    return new Map<string, number>();
  }

  const subtotalSum = lineSubtotals.reduce((sum, line) => sum + line.subtotal, 0);
  const allocations = new Map<string, number>();

  if (subtotalSum <= 0) {
    return allocations;
  }

  let allocated = 0;
  lineSubtotals.forEach((line, index) => {
    const ratio = line.subtotal / subtotalSum;
    const value =
      index === lineSubtotals.length - 1
        ? roundCurrency(totalAmount - allocated)
        : roundCurrency(totalAmount * ratio);
    allocations.set(line.cartItemId, value);
    allocated = roundCurrency(allocated + value);
  });

  return allocations;
};

const resolveCouponMinOrderBase = (
  coupon: CouponRow,
  couponExchangeRateMap: Map<string, number>
) => {
  if (!coupon.min_order_amount || coupon.min_order_amount <= 0) {
    return 0;
  }

  if (coupon.base_currency_min_order_amount != null) {
    return Number(coupon.base_currency_min_order_amount);
  }

  if (!coupon.currency_code || coupon.currency_code === "USD") {
    return Number(coupon.min_order_amount);
  }

  const rate = Number(couponExchangeRateMap.get(coupon.currency_code) || 0);
  if (rate <= 0) {
    return Number(coupon.min_order_amount);
  }

  return Number(coupon.min_order_amount) / rate;
};

const resolveFixedDiscountBase = (
  coupon: CouponRow,
  couponExchangeRateMap: Map<string, number>
) => {
  if (coupon.base_currency_discount_value != null) {
    return Number(coupon.base_currency_discount_value);
  }

  if (!coupon.discount_value) {
    return 0;
  }

  if (!coupon.currency_code || coupon.currency_code === "USD") {
    return Number(coupon.discount_value);
  }

  const rate = Number(couponExchangeRateMap.get(coupon.currency_code) || 0);
  if (rate <= 0) {
    return 0;
  }

  return Number(coupon.discount_value) / rate;
};

const buildEligibleLines = ({
  coupon,
  brandId,
  cartItems,
  variantToProductMap,
  productToBrandMap,
  productToCategoryMap,
  couponProductsByCoupon,
  couponCategoriesByCoupon,
}: {
  coupon: CouponRow;
  brandId: string;
  cartItems: CartItemForCoupon[];
  variantToProductMap: Map<string, string>;
  productToBrandMap: Map<string, string>;
  productToCategoryMap: Map<string, string | null>;
  couponProductsByCoupon: Map<string, Set<string>>;
  couponCategoriesByCoupon: Map<string, Set<string>>;
}) => {
  const eligibleProductIds = couponProductsByCoupon.get(coupon.id) || new Set<string>();
  const eligibleCategoryIds = couponCategoriesByCoupon.get(coupon.id) || new Set<string>();

  return cartItems.flatMap((item) => {
    const productId = variantToProductMap.get(item.product_id);
    const resolvedBrandId = productId ? productToBrandMap.get(productId) : null;

    if (!productId || resolvedBrandId !== brandId) {
      return [];
    }

    const quantity = Number(item.quantity || 0);
    const subtotalBase = roundCurrency(Number(item.unit_price_base || 0) * quantity);
    const subtotalCustomerCurrency = roundCurrency(
      Number(item.unit_price_customer_currency || item.price || 0) * quantity
    );

    if (subtotalBase <= 0 && subtotalCustomerCurrency <= 0) {
      return [];
    }

    if (coupon.applies_to === "products" && !eligibleProductIds.has(productId)) {
      return [];
    }

    if (coupon.applies_to === "categories") {
      const categoryId = productToCategoryMap.get(productId);
      if (!categoryId || !eligibleCategoryIds.has(categoryId)) {
        return [];
      }
    }

    return [
      {
        cartItemId: item.id,
        productId,
        quantity,
        subtotalBase,
        subtotalCustomerCurrency,
      } satisfies EligibleLine,
    ];
  });
};

export async function getCartCouponContext({
  cartId,
  cartItems,
  groupedShippingEstimates,
  currencyCode,
  exchangeRateUsed,
  brandNameMap,
  variantToProductMap,
  productToBrandMap,
  productToCategoryMap,
  injectedSupabase,
}: {
  cartId: string;
  cartItems: CartItemForCoupon[];
  groupedShippingEstimates: {
    brandId: string;
    shippingEstimateBase: number;
    shippingEstimateCustomerCurrency: number;
  }[];
  currencyCode: string;
  exchangeRateUsed: number;
  brandNameMap: Map<string, string>;
  variantToProductMap: Map<string, string>;
  productToBrandMap: Map<string, string>;
  productToCategoryMap: Map<string, string | null>;
  injectedSupabase?: SupabaseClient;
}): Promise<CartCouponContext> {
  const supabase = injectedSupabase ?? (await createClient());
  const couponSupabase = createAdminClient();

  const { data: appliedCoupons } = await supabase
    .from("cart_applied_coupons")
    .select("id, coupon_id, brand_id, code")
    .eq("cart_id", cartId);

  const typedAppliedCoupons = (appliedCoupons || []) as CartCouponApplication[];
  if (typedAppliedCoupons.length === 0) {
    return {
      groupedCouponDiscounts: [],
      discountTotalBase: 0,
      discountTotalCustomerCurrency: 0,
      formattedDiscountTotal: formatStorefrontPrice(0, currencyCode),
    };
  }

  const couponIds = typedAppliedCoupons.map((coupon) => coupon.coupon_id);
  const [{ data: coupons }, { data: couponProducts }, { data: couponCategories }] = await Promise.all([
    couponSupabase
      .from("coupons")
      .select("id, brand_id, name, code, description, discount_type, discount_value, base_currency_discount_value, base_currency_min_order_amount, currency_code, usage_limit, min_order_amount, start_date, end_date, is_active, auto_apply, applies_to, eligible_customers, include_sale_items, single_use_per_customer")
      .in("id", couponIds),
    couponSupabase
      .from("coupon_products")
      .select("coupon_id, product_id")
      .in("coupon_id", couponIds),
    couponSupabase
      .from("coupon_categories")
      .select("coupon_id, category_id")
      .in("coupon_id", couponIds),
  ]);

  const couponMap = new Map(((coupons || []) as CouponRow[]).map((coupon) => [coupon.id, coupon]));
  const couponCurrencies = Array.from(
    new Set(
      ((coupons || []) as CouponRow[])
        .map((coupon) => coupon.currency_code)
        .filter((couponCurrency): couponCurrency is string => Boolean(couponCurrency && couponCurrency !== "USD"))
    )
  );
  const { data: couponRates } = couponCurrencies.length
    ? await couponSupabase
        .from("exchange_rates")
        .select("target_currency, rate")
        .in("target_currency", couponCurrencies)
    : { data: [] };
  const couponExchangeRateMap = new Map(
    (couponRates || []).map((row) => [row.target_currency, Number(row.rate || 0)])
  );
  const couponProductsByCoupon = new Map<string, Set<string>>();
  const couponCategoriesByCoupon = new Map<string, Set<string>>();

  ((couponProducts || []) as CouponProductRow[]).forEach((row) => {
    const current = couponProductsByCoupon.get(row.coupon_id) || new Set<string>();
    current.add(row.product_id);
    couponProductsByCoupon.set(row.coupon_id, current);
  });

  ((couponCategories || []) as CouponCategoryRow[]).forEach((row) => {
    const current = couponCategoriesByCoupon.get(row.coupon_id) || new Set<string>();
    current.add(row.category_id);
    couponCategoriesByCoupon.set(row.coupon_id, current);
  });

  const shippingByBrand = new Map(
    groupedShippingEstimates.map((group) => [group.brandId, group])
  );

  const groupedCouponDiscounts: CouponDiscountSummary[] = [];

  for (const appliedCoupon of typedAppliedCoupons) {
    const coupon = couponMap.get(appliedCoupon.coupon_id);
    if (!coupon || !coupon.is_active) {
      continue;
    }

    const currentTime = new Date();
    if (new Date(coupon.start_date) > currentTime) {
      continue;
    }
    if (coupon.end_date && new Date(coupon.end_date) < currentTime) {
      continue;
    }

    const eligibleLines = buildEligibleLines({
      coupon,
      brandId: appliedCoupon.brand_id,
      cartItems,
      variantToProductMap,
      productToBrandMap,
      productToCategoryMap,
      couponProductsByCoupon,
      couponCategoriesByCoupon,
    });

    const eligibleSubtotalBase = roundCurrency(
      eligibleLines.reduce((sum, line) => sum + line.subtotalBase, 0)
    );

    const minOrderBase = resolveCouponMinOrderBase(coupon, couponExchangeRateMap);
    if (eligibleSubtotalBase < minOrderBase) {
      continue;
    }

    let discountBase = 0;
    if (coupon.discount_type === "percentage") {
      discountBase = roundCurrency(
        eligibleSubtotalBase * (Number(coupon.discount_value || 0) / 100)
      );
    } else if (coupon.discount_type === "fixed") {
      discountBase = roundCurrency(
        Math.min(eligibleSubtotalBase, resolveFixedDiscountBase(coupon, couponExchangeRateMap))
      );
    } else if (coupon.discount_type === "free_shipping") {
      discountBase = roundCurrency(
        Number(shippingByBrand.get(appliedCoupon.brand_id)?.shippingEstimateBase || 0)
      );
    }

    if (discountBase <= 0) {
      continue;
    }

    const discountCustomerCurrency =
      exchangeRateUsed > 0
        ? roundCurrency(convertBaseCurrencyPrice(discountBase, exchangeRateUsed) || 0)
        : discountBase;

    const eligibleBaseAllocations = allocateAmountByLine(
      discountBase,
      eligibleLines.map((line) => ({ cartItemId: line.cartItemId, subtotal: line.subtotalBase }))
    );
    const eligibleCustomerAllocations = allocateAmountByLine(
      discountCustomerCurrency,
      eligibleLines.map((line) => ({ cartItemId: line.cartItemId, subtotal: line.subtotalCustomerCurrency }))
    );

    const eligibleLineDiscounts = new Map<string, { discountBase: number; discountCustomerCurrency: number }>();
    eligibleLines.forEach((line) => {
      eligibleLineDiscounts.set(line.cartItemId, {
        discountBase: roundCurrency(eligibleBaseAllocations.get(line.cartItemId) || 0),
        discountCustomerCurrency: roundCurrency(eligibleCustomerAllocations.get(line.cartItemId) || 0),
      });
    });

    groupedCouponDiscounts.push({
      brandId: appliedCoupon.brand_id,
      brandName: brandNameMap.get(appliedCoupon.brand_id) || "Brand",
      couponId: coupon.id,
      couponCode: coupon.code,
      couponName: coupon.name,
      discountType: coupon.discount_type,
      appliesTo: coupon.applies_to,
      discountBase,
      discountCustomerCurrency,
      formattedDiscount: formatStorefrontPrice(discountCustomerCurrency, currencyCode),
      couponSnapshot: {
        couponId: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discount_type,
        appliesTo: coupon.applies_to,
        discountBase,
        discountCustomerCurrency,
        currencyCode,
      },
      eligibleLineDiscounts,
    });
  }

  const discountTotalBase = roundCurrency(
    groupedCouponDiscounts.reduce((sum, group) => sum + group.discountBase, 0)
  );
  const discountTotalCustomerCurrency = roundCurrency(
    groupedCouponDiscounts.reduce((sum, group) => sum + group.discountCustomerCurrency, 0)
  );

  return {
    groupedCouponDiscounts,
    discountTotalBase,
    discountTotalCustomerCurrency,
    formattedDiscountTotal: formatStorefrontPrice(discountTotalCustomerCurrency, currencyCode),
  };
}

export async function applyCouponToCart(code: string, userId: string): Promise<ApplyCouponResult> {
  const supabase = await createClient();
  const couponSupabase = createAdminClient();
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { success: false, message: "Enter a coupon code." };
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id, currency_code, exchange_rate_used")
    .eq("user_id", userId)
    .maybeSingle<{ id: string; currency_code: string | null; exchange_rate_used: number | null }>();

  if (!cart?.id) {
    return { success: false, message: "Your cart was not found." };
  }

  const { data: possibleCoupons } = await couponSupabase
    .from("coupons")
    .select("id, brand_id, name, code, discount_type, discount_value, base_currency_discount_value, base_currency_min_order_amount, currency_code, usage_limit, min_order_amount, start_date, end_date, is_active, auto_apply, applies_to, eligible_customers, include_sale_items, single_use_per_customer")
    .ilike("code", `%${normalizedCode}%`)
    .limit(10);

  const coupon = ((possibleCoupons || []) as CouponRow[]).find(
    (candidate) => candidate.code?.trim().toUpperCase() === normalizedCode
  );

  if (!coupon) {
    return { success: false, message: "Coupon not found." };
  }

  const now = new Date();
  if (!coupon.is_active || new Date(coupon.start_date) > now || (coupon.end_date && new Date(coupon.end_date) < now)) {
    return { success: false, message: "This coupon is not currently active." };
  }

  if (coupon.eligible_customers === "specific_customers") {
    return { success: false, message: "This coupon requires a specific-customer list and cannot be applied yet." };
  }

  const { count: paidOrdersCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId)
    .eq("payment_status", "paid");

  if (coupon.eligible_customers === "new_customers" && Number(paidOrdersCount || 0) > 0) {
    return { success: false, message: "This coupon is only available to new customers." };
  }

  if (coupon.eligible_customers === "returning_customers" && Number(paidOrdersCount || 0) === 0) {
    return { success: false, message: "This coupon is only available to returning customers." };
  }

  if (coupon.single_use_per_customer) {
    const { count: usageCount } = await couponSupabase
      .from("coupon_usage")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("customer_id", userId);

    if (Number(usageCount || 0) > 0) {
      return { success: false, message: "You have already used this coupon." };
    }
  }

  if (coupon.usage_limit != null) {
    const { count: totalUsageCount } = await couponSupabase
      .from("coupon_usage")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id);

    if (Number(totalUsageCount || 0) >= Number(coupon.usage_limit || 0)) {
      return { success: false, message: "This coupon has reached its usage limit." };
    }
  }

  const { data: defaultAddress } = await supabase
    .from("user_address")
    .select("country_code, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ country_code: string | null; is_default: boolean }>();

  const { data: restrictedCountries } = await couponSupabase
    .from("coupon_countries")
    .select("country_code")
    .eq("coupon_id", coupon.id);

  const restrictedCountryCodes = (restrictedCountries || []).map((row) => row.country_code).filter(Boolean);
  if (restrictedCountryCodes.length > 0) {
    const customerCountryCode = defaultAddress?.country_code || null;
    if (!customerCountryCode || !restrictedCountryCodes.includes(customerCountryCode)) {
      return { success: false, message: "This coupon is not available for your selected shipping country." };
    }
  }

  const { data: rawCartItems } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity, unit_price_base, unit_price_customer_currency, price, variant_name_snapshot, product_name_snapshot")
    .eq("cart_id", cart.id);

  const cartItems = (rawCartItems || []) as CartItemForCoupon[];
  if (cartItems.length === 0) {
    return { success: false, message: "Add items to your cart before applying a coupon." };
  }

  const variantIds = cartItems.map((item) => item.product_id);
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, main_product_id")
    .in("id", variantIds);

  const variantToProductMap = new Map(
    ((variants || []) as CartVariantProductRow[]).map((variant) => [variant.id, variant.main_product_id])
  );

  const productIds = Array.from(new Set(Array.from(variantToProductMap.values())));
  const { data: products } = await supabase
    .from("products_list")
    .select("id, brand_id, category_id")
    .in("id", productIds);

  const typedProducts = (products || []) as ProductCategoryBrandRow[];
  const productToBrandMap = new Map(typedProducts.map((product) => [product.id, product.brand_id]));
  const productToCategoryMap = new Map(typedProducts.map((product) => [product.id, product.category_id]));

  const matchingBrandItems = cartItems.filter((item) => {
    const productId = variantToProductMap.get(item.product_id);
    return productId ? productToBrandMap.get(productId) === coupon.brand_id : false;
  });

  if (matchingBrandItems.length === 0) {
    return { success: false, message: "This coupon does not apply to any vendor in your cart." };
  }

  const { data: couponProducts } = await couponSupabase
    .from("coupon_products")
    .select("coupon_id, product_id")
    .eq("coupon_id", coupon.id);

  const { data: couponCategories } = await couponSupabase
    .from("coupon_categories")
    .select("coupon_id, category_id")
    .eq("coupon_id", coupon.id);

  const couponProductsByCoupon = new Map<string, Set<string>>();
  const couponCategoriesByCoupon = new Map<string, Set<string>>();

  ((couponProducts || []) as CouponProductRow[]).forEach((row) => {
    const set = couponProductsByCoupon.get(row.coupon_id) || new Set<string>();
    set.add(row.product_id);
    couponProductsByCoupon.set(row.coupon_id, set);
  });

  ((couponCategories || []) as CouponCategoryRow[]).forEach((row) => {
    const set = couponCategoriesByCoupon.get(row.coupon_id) || new Set<string>();
    set.add(row.category_id);
    couponCategoriesByCoupon.set(row.coupon_id, set);
  });

  const eligibleLines = buildEligibleLines({
    coupon,
    brandId: coupon.brand_id,
    cartItems,
    variantToProductMap,
    productToBrandMap,
    productToCategoryMap,
    couponProductsByCoupon,
    couponCategoriesByCoupon,
  });

  if (eligibleLines.length === 0) {
    return { success: false, message: "This coupon does not match the eligible items in your cart." };
  }

  const couponCurrencies = [coupon.currency_code].filter(
    (currencyCode): currencyCode is string => Boolean(currencyCode && currencyCode !== "USD")
  );
  const { data: couponRates } = couponCurrencies.length
    ? await couponSupabase
        .from("exchange_rates")
        .select("target_currency, rate")
        .in("target_currency", couponCurrencies)
    : { data: [] };

  const couponExchangeRateMap = new Map(
    (couponRates || []).map((row) => [row.target_currency, Number(row.rate || 0)])
  );

  const eligibleSubtotalBase = eligibleLines.reduce((sum, line) => sum + line.subtotalBase, 0);
  const minOrderBase = resolveCouponMinOrderBase(coupon, couponExchangeRateMap);
  const eligibleSubtotalCustomerCurrency = roundCurrency(
    eligibleLines.reduce((sum, line) => sum + line.subtotalCustomerCurrency, 0)
  );
  const cartCurrencyCode = cart.currency_code || "USD";
  const cartExchangeRate = Number(
    cart.exchange_rate_used || (cartCurrencyCode === "USD" ? 1 : 0)
  );
  const minOrderCustomerCurrency =
    cartExchangeRate > 0
      ? roundCurrency(convertBaseCurrencyPrice(minOrderBase, cartExchangeRate) || 0)
      : roundCurrency(minOrderBase);

  if (eligibleSubtotalBase < minOrderBase) {
    const formattedEligibleSubtotal = formatStorefrontPrice(
      eligibleSubtotalCustomerCurrency,
      cartCurrencyCode
    );
    const formattedMinimumRequired = formatStorefrontPrice(
      minOrderCustomerCurrency,
      cartCurrencyCode
    );
    return {
      success: false,
      message: `This coupon checks the eligible brand/items subtotal. Eligible subtotal: ${formattedEligibleSubtotal}. Minimum required: ${formattedMinimumRequired}.`,
    };
  }

  const nowTimestamp = nowIso();
  const { error: upsertError } = await supabase
    .from("cart_applied_coupons")
    .upsert({
      cart_id: cart.id,
      coupon_id: coupon.id,
      brand_id: coupon.brand_id,
      code: coupon.code,
      applied_by_user_id: userId,
      updated_at: nowTimestamp,
    }, {
      onConflict: "cart_id,brand_id",
    });

  if (upsertError) {
    return { success: false, message: upsertError.message || "Failed to apply coupon." };
  }

  return {
    success: true,
    message: `Coupon ${coupon.code} applied.`,
    brandId: coupon.brand_id,
  };
}

export async function removeCouponFromCart(brandId: string, userId: string): Promise<ApplyCouponResult> {
  const supabase = await createClient();

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  if (!cart?.id) {
    return { success: false, message: "Your cart was not found." };
  }

  const { error } = await supabase
    .from("cart_applied_coupons")
    .delete()
    .eq("cart_id", cart.id)
    .eq("brand_id", brandId);

  if (error) {
    return { success: false, message: error.message || "Failed to remove coupon." };
  }

  return { success: true, message: "Coupon removed.", brandId };
}
