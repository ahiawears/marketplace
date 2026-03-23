import { createClient } from "@/supabase/server";
import { convertBaseCurrencyPrice, formatStorefrontPrice } from "@/lib/storefront-pricing";
import { CountryData, CountryDataType } from "@/lib/country-data";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCartCouponContext } from "@/actions/coupons/cart-coupon-service";

type CartRow = {
    id: string;
    total_price: number | null;
    currency_code: string | null;
    subtotal_base: number | null;
    subtotal_customer_currency: number | null;
    exchange_rate_used: number | null;
};

type CartItemRow = {
    id: string;
    quantity: number;
    price: number;
    customer_currency: string | null;
    unit_price_base: number | null;
    unit_price_customer_currency: number | null;
    product_name_snapshot: string | null;
    variant_name_snapshot: string | null;
    size_name_snapshot: string | null;
    image_url_snapshot: string | null;
    product_id: {
        id: string;
        name: string;
    };
    size_id:
        | {
              id: string;
              size_id: {
                  name: string;
              };
          }
        | {
              id: string;
              size_id: {
                  name: string;
              };
          }[]
        | null;
};

type CartItemQueryRow = Omit<CartItemRow, "product_id"> & {
    product_id:
        | {
              id: string;
              name: string;
          }
        | {
              id: string;
              name: string;
          }[];
};

type VariantBrandRow = {
    id: string;
    main_product_id: string;
};

type ProductBrandRow = {
    id: string;
    brand_id: string;
    category_id?: string | null;
};

type BrandRow = {
    id: string;
    name: string | null;
};

type ProductShippingDetailRow = {
    id: string;
    product_id: string;
};

type ProductShippingFeeRow = {
    product_shipping_id: string;
    method_type: string | null;
    zone_type: string | null;
    base_fee: number | null;
    additional_item_fee: number | null;
    currency_code: string | null;
    available: boolean;
    calculation_strategy: string | null;
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

type ProductReturnPolicyRow = {
    product_id: string;
    version: number | null;
    is_returnable: boolean | null;
    return_window_days: number | null;
    return_shipping_responsibility:
        | {
              brandPays?: boolean;
              customerPays?: boolean;
              dependsOnReason?: boolean;
          }
        | null;
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

type BrandCountryRow = {
    brand_id: string;
    country_of_registration: string | null;
};

type ProductQuantitySummary = {
    productId: string;
    quantity: number;
};

type ShippingRule = {
    methodType: string;
    zoneType: string;
    baseFee: number;
    additionalItemFee: number;
    strategy: string;
};

const SHIPPING_ZONE_PRIORITY = ["domestic", "sub_regional", "regional", "global"] as const;

const normalizeZoneType = (zoneType: string | null | undefined) => {
    if (!zoneType) {
        return null;
    }

    return SHIPPING_ZONE_PRIORITY.includes(zoneType as (typeof SHIPPING_ZONE_PRIORITY)[number])
        ? zoneType
        : null;
};

const normalizeMethodType = (methodType: string | null | undefined) => {
    if (!methodType) {
        return null;
    }

    return ["same_day", "standard", "express", "international"].includes(methodType)
        ? methodType
        : null;
};

const getCountryMeta = (countryCodeOrName: string | null | undefined): CountryDataType | null => {
    if (!countryCodeOrName) {
        return null;
    }

    const normalized = countryCodeOrName.trim().toLowerCase();
    return (
        CountryData.find(
            (country) =>
                country.iso2.toLowerCase() === normalized || country.name.toLowerCase() === normalized
        ) || null
    );
};

const resolveShippingZoneForDestination = (
    brandCountryCode: string | null | undefined,
    destinationCountryCode: string | null | undefined
) => {
    if (!brandCountryCode || !destinationCountryCode) {
        return null;
    }

    if (brandCountryCode === destinationCountryCode) {
        return "domestic";
    }

    const brandCountry = getCountryMeta(brandCountryCode);
    const destinationCountry = getCountryMeta(destinationCountryCode);

    if (!brandCountry || !destinationCountry) {
        return "global";
    }

    if (
        brandCountry.subregion &&
        destinationCountry.subregion &&
        brandCountry.subregion === destinationCountry.subregion
    ) {
        return "sub_regional";
    }

    if (
        brandCountry.region &&
        destinationCountry.region &&
        brandCountry.region === destinationCountry.region
    ) {
        return "regional";
    }

    return "global";
};

const calculateBaseIncrementalTotal = (rules: ShippingRule[], productQuantities: ProductQuantitySummary[]) => {
    if (rules.length === 0 || productQuantities.length === 0) {
        return null;
    }

    const ruleByProduct = new Map(rules.map((rule, index) => [productQuantities[index]?.productId, rule]));
    const anchorProduct = productQuantities.reduce<{ productId: string; baseFee: number } | null>((anchor, product) => {
        const rule = ruleByProduct.get(product.productId);
        if (!rule) {
            return anchor;
        }

        if (!anchor || rule.baseFee > anchor.baseFee) {
            return { productId: product.productId, baseFee: rule.baseFee };
        }

        return anchor;
    }, null);

    if (!anchorProduct) {
        return null;
    }

    return productQuantities.reduce((sum, product) => {
        const rule = ruleByProduct.get(product.productId);
        if (!rule) {
            return sum;
        }

        if (product.productId === anchorProduct.productId) {
            return sum + rule.baseFee + rule.additionalItemFee * Math.max(product.quantity - 1, 0);
        }

        return sum + rule.additionalItemFee * product.quantity;
    }, 0);
};

const calculateRuleTotal = (rules: ShippingRule[], productQuantities: ProductQuantitySummary[]) => {
    if (rules.length === 0 || productQuantities.length === 0) {
        return null;
    }

    const strategy = rules[0]?.strategy || "base_incremental";

    if (strategy === "flat") {
        return rules.reduce((maxFee, rule) => Math.max(maxFee, rule.baseFee), 0);
    }

    return calculateBaseIncrementalTotal(rules, productQuantities);
};

const getResponsibilityLabel = (
    responsibility:
        | {
              brandPays?: boolean;
              customerPays?: boolean;
              dependsOnReason?: boolean;
          }
        | null
) => {
    if (responsibility?.brandPays) {
        return "Brand pays return shipping";
    }

    if (responsibility?.customerPays) {
        return "Customer pays return shipping";
    }

    if (responsibility?.dependsOnReason) {
        return "Return shipping depends on the reason";
    }

    return "Return shipping details will be confirmed during review";
};

export const getCartItems = async (
    isAnonymous: boolean,
    userId: string,
    destinationCountryCode?: string | null,
    injectedSupabase?: SupabaseClient
) => {
    const supabase = injectedSupabase ?? (await createClient());

    try {
        // Find the user cart.
        const { data: userCart, error: userCartError } = await supabase
            .from('carts')
            .select('id, total_price, currency_code, subtotal_base, subtotal_customer_currency, exchange_rate_used')
            .eq(isAnonymous ? 'anonymous_id' : 'user_id', userId)
            .single();

        if (userCartError) {
            // PGRST116 means no rows were found, so we can treat it as an empty cart.
            if (userCartError.code === 'PGRST116') {
                return {
                    productsWithImages: [],
                    totalPrice: 0,
                    currencyCode: "USD",
                    formattedTotalPrice: formatStorefrontPrice(0, "USD"),
                    subtotalBase: 0,
                    subtotalCustomerCurrency: 0,
                    groupedCouponDiscounts: [],
                    discountTotalBase: 0,
                    discountTotalCustomerCurrency: 0,
                    formattedDiscountTotal: formatStorefrontPrice(0, "USD"),
                    groupedReturnPolicies: [],
                    groupedShippingEstimates: [],
                    shippingTotalCustomerCurrency: 0,
                    formattedShippingTotal: formatStorefrontPrice(0, "USD"),
                    grandTotalCustomerCurrency: 0,
                    formattedGrandTotal: formatStorefrontPrice(0, "USD"),
                };
            }
            console.error("Error finding user cart id:", userCartError);
            throw new Error(userCartError.message || "Failed to find user cart id");
        }

        if (!userCart) {
            console.log("No cart items found for user:", userId);
                return {
                    productsWithImages: [],
                    totalPrice: 0,
                    currencyCode: "USD",
                    formattedTotalPrice: formatStorefrontPrice(0, "USD"),
                    subtotalBase: 0,
                    subtotalCustomerCurrency: 0,
                    groupedCouponDiscounts: [],
                    discountTotalBase: 0,
                    discountTotalCustomerCurrency: 0,
                    formattedDiscountTotal: formatStorefrontPrice(0, "USD"),
                    groupedReturnPolicies: [],
                    groupedShippingEstimates: [],
                    shippingTotalCustomerCurrency: 0,
                formattedShippingTotal: formatStorefrontPrice(0, "USD"),
                grandTotalCustomerCurrency: 0,
                formattedGrandTotal: formatStorefrontPrice(0, "USD"),
            }; 
        }

        const typedCart = userCart as CartRow;
        const cartId = typedCart.id;
        const currencyCode = typedCart.currency_code || "USD";
        const subtotalBase = Number(typedCart.subtotal_base || 0);
        const subtotalCustomerCurrency = Number(
            typedCart.subtotal_customer_currency || typedCart.total_price || 0
        );
        const totalPrice = Number(typedCart.total_price || 0);
        const exchangeRateUsed = Number(
            typedCart.exchange_rate_used || (currencyCode === "USD" ? 1 : 0)
        );

        // Fetch cart items and nested product/size info.
        const { data: cartItems, error: cartItemsError } = await supabase
            .from('cart_items')
            .select('quantity, price, customer_currency, unit_price_base, unit_price_customer_currency, product_name_snapshot, variant_name_snapshot, size_name_snapshot, image_url_snapshot, product_id(id, name), id, size_id(id, size_id(name))')
            .eq('cart_id', cartId);

        if (cartItemsError) {
            if (cartItemsError.code === 'PGRST116') {
                return {
                    productsWithImages: [],
                    totalPrice,
                    currencyCode,
                    formattedTotalPrice: formatStorefrontPrice(totalPrice, currencyCode),
                    subtotalBase,
                    subtotalCustomerCurrency,
                    groupedCouponDiscounts: [],
                    discountTotalBase: 0,
                    discountTotalCustomerCurrency: 0,
                    formattedDiscountTotal: formatStorefrontPrice(0, currencyCode),
                    groupedReturnPolicies: [],
                    groupedShippingEstimates: [],
                    shippingTotalCustomerCurrency: 0,
                    formattedShippingTotal: formatStorefrontPrice(0, currencyCode),
                    grandTotalCustomerCurrency: subtotalCustomerCurrency,
                    formattedGrandTotal: formatStorefrontPrice(subtotalCustomerCurrency, currencyCode),
                };
            }
            console.error("Error fetching cart items:", cartItemsError);
            throw new Error(cartItemsError.message || "Failed to fetch cart items");
        }

        // If no cart items are found, the query returns an empty array.
        if (!cartItems || cartItems.length === 0) {
            return {
                productsWithImages: [],
                totalPrice,
                currencyCode,
                formattedTotalPrice: formatStorefrontPrice(totalPrice, currencyCode),
                subtotalBase,
                subtotalCustomerCurrency,
                groupedCouponDiscounts: [],
                discountTotalBase: 0,
                discountTotalCustomerCurrency: 0,
                formattedDiscountTotal: formatStorefrontPrice(0, currencyCode),
                groupedReturnPolicies: [],
                groupedShippingEstimates: [],
                shippingTotalCustomerCurrency: 0,
                formattedShippingTotal: formatStorefrontPrice(0, currencyCode),
                grandTotalCustomerCurrency: subtotalCustomerCurrency,
                formattedGrandTotal: formatStorefrontPrice(subtotalCustomerCurrency, currencyCode),
            };
        }

        // Extract the variant IDs from the cart items.
        const typedCartItems = ((cartItems || []) as unknown as CartItemQueryRow[]).map((item) => {
            const resolvedProduct = Array.isArray(item.product_id) ? item.product_id[0] : item.product_id;

            return {
                ...item,
                product_id: {
                    id: resolvedProduct?.id || "",
                    name: resolvedProduct?.name || "",
                },
            } satisfies CartItemRow;
        });
        const variantIds = typedCartItems.map((item) => item.product_id.id);

        // Colors live in the variant-color join table in the current schema.
        const { data: variantColors, error: variantColorsError } = await supabase
            .from('product_variant_colors')
            .select('product_variant_id, color_id(name, hex_code)')
            .in('product_variant_id', variantIds);

        if (variantColorsError) {
            throw new Error(variantColorsError.message || "Failed to fetch variant colors");
        }

        // Create a map that stores an object with both the color name and hex code.
        const colorMap = new Map(
            (variantColors || []).map((color: any) => {
                const relation = Array.isArray(color.color_id) ? color.color_id[0] : color.color_id;

                return [
                    color.product_variant_id,
                    relation ? { name: relation.name, hex: relation.hex_code } : null,
                ];
            })
        );

        // Fetch the main images of each variant using the corrected `.in()` filter.
        const { data: variantImages, error: variantImagesError } = await supabase
            .from('product_images')
            .select('image_url, product_variant_id')
            .in('product_variant_id', variantIds)
            .eq('is_main', true);

        if (variantImagesError) {
            throw new Error(variantImagesError.message || "Failed to fetch variant images");
        }

        // Create a map for the main images.
        const imageMap = new Map(variantImages.map((image) => [image.product_variant_id, image.image_url]));

        // Map the cart items with their corresponding main images and colors.
        const productsWithImages = typedCartItems.map((item) => {
            const variantId = item.product_id.id;
            const resolvedSizeRelation = Array.isArray(item.size_id)
                ? item.size_id[0]
                : item.size_id;
            const resolvedSizeName = Array.isArray(resolvedSizeRelation?.size_id)
                ? resolvedSizeRelation?.size_id[0]?.name
                : resolvedSizeRelation?.size_id?.name;

            return {
                ...item,
                product_name: item.variant_name_snapshot || item.product_name_snapshot || item.product_id.name,
                main_image_url: item.image_url_snapshot || imageMap.get(variantId) || null,
                variant_color: colorMap.get(variantId) || null, // <-- ADDED: Getting the color object from the new map
                size_name: item.size_name_snapshot || resolvedSizeName || "Unknown",
                currency_code: item.customer_currency || currencyCode,
                formatted_price: formatStorefrontPrice(
                    Number(item.unit_price_customer_currency || item.price || 0),
                    item.customer_currency || currencyCode
                ),
            };
        });

        const [
            { data: variantBrands },
            { data: productBrands },
            { data: brands },
            { data: productShippingDetails },
            { data: productShippingFees },
            { data: brandCountries },
            { data: productReturnPolicies },
        ] = await Promise.all([
            supabase
                .from("product_variants")
                .select("id, main_product_id")
                .in("id", variantIds),
            (async () => {
                const { data: variants } = await supabase
                    .from("product_variants")
                    .select("id, main_product_id")
                    .in("id", variantIds);

                const productIds = ((variants || []) as VariantBrandRow[]).map((variant) => variant.main_product_id);
                if (productIds.length === 0) {
                    return { data: [] };
                }

                return supabase
                    .from("products_list")
                    .select("id, brand_id, category_id")
                    .in("id", productIds);
            })(),
            (async () => {
                const { data: variants } = await supabase
                    .from("product_variants")
                    .select("id, main_product_id")
                    .in("id", variantIds);
                const productIds = ((variants || []) as VariantBrandRow[]).map((variant) => variant.main_product_id);
                if (productIds.length === 0) {
                    return { data: [] };
                }

                const { data: products } = await supabase
                    .from("products_list")
                    .select("id, brand_id")
                    .in("id", productIds);

                const brandIds = Array.from(new Set(((products || []) as ProductBrandRow[]).map((product) => product.brand_id)));
                if (brandIds.length === 0) {
                    return { data: [] };
                }

                return supabase
                    .from("brands_list")
                    .select("id, name")
                    .in("id", brandIds);
            })(),
            (async () => {
                const { data: variants } = await supabase
                    .from("product_variants")
                    .select("id, main_product_id")
                    .in("id", variantIds);
                const productIds = ((variants || []) as VariantBrandRow[]).map((variant) => variant.main_product_id);
                if (productIds.length === 0) {
                    return { data: [] };
                }

                return supabase
                    .from("product_shipping_details")
                    .select("id, product_id")
                    .in("product_id", productIds);
            })(),
            (async () => {
                const { data: variants } = await supabase
                    .from("product_variants")
                    .select("id, main_product_id")
                    .in("id", variantIds);
                const productIds = ((variants || []) as VariantBrandRow[]).map((variant) => variant.main_product_id);
                if (productIds.length === 0) {
                    return { data: [] };
                }

                const { data: shippingDetails } = await supabase
                    .from("product_shipping_details")
                    .select("id, product_id")
                    .in("product_id", productIds);

                const shippingDetailIds = ((shippingDetails || []) as ProductShippingDetailRow[]).map((detail) => detail.id);
                if (shippingDetailIds.length === 0) {
                    return { data: [] };
                }

                return supabase
                    .from("product_shipping_fees")
                    .select("product_shipping_id, method_type, zone_type, base_fee, additional_item_fee, currency_code, available, calculation_strategy")
                    .in("product_shipping_id", shippingDetailIds);
            })(),
            (async () => {
                const { data: variants } = await supabase
                    .from("product_variants")
                    .select("id, main_product_id")
                    .in("id", variantIds);

                const productIds = ((variants || []) as VariantBrandRow[]).map((variant) => variant.main_product_id);
                if (productIds.length === 0) {
                    return { data: [] };
                }

                const { data: products } = await supabase
                    .from("products_list")
                    .select("id, brand_id")
                    .in("id", productIds);

                const brandIds = Array.from(new Set(((products || []) as ProductBrandRow[]).map((product) => product.brand_id)));
                if (brandIds.length === 0) {
                    return { data: [] };
                }

                return supabase
                    .from("brand_legal_details")
                    .select("brand_id, country_of_registration")
                    .in("brand_id", brandIds);
            })(),
            (async () => {
                const { data: variants } = await supabase
                    .from("product_variants")
                    .select("id, main_product_id")
                    .in("id", variantIds);

                const productIds = ((variants || []) as VariantBrandRow[]).map((variant) => variant.main_product_id);
                if (productIds.length === 0) {
                    return { data: [] };
                }

                return supabase
                    .from("product_return_policy")
                    .select("product_id, version, is_returnable, return_window_days, return_shipping_responsibility")
                    .in("product_id", productIds)
                    .eq("is_active", true)
                    .order("version", { ascending: false });
            })(),
        ]);

        const variantToProductMap = new Map(
            ((variantBrands || []) as VariantBrandRow[]).map((variant) => [variant.id, variant.main_product_id])
        );
        const productToBrandMap = new Map(
            ((productBrands || []) as ProductBrandRow[]).map((product) => [product.id, product.brand_id])
        );
        const productToCategoryMap = new Map(
            ((productBrands || []) as ProductBrandRow[]).map((product) => [product.id, product.category_id || null])
        );
        const brandNameMap = new Map(
            ((brands || []) as BrandRow[]).map((brand) => [brand.id, brand.name || "Brand"])
        );
        const brandCountryMap = new Map(
            ((brandCountries || []) as BrandCountryRow[]).map((brand) => [brand.brand_id, brand.country_of_registration || null])
        );
        const productShippingDetailMap = new Map(
            ((productShippingDetails || []) as ProductShippingDetailRow[]).map((detail) => [detail.product_id, detail.id])
        );

        const shippingFeesByDetail = new Map<string, ProductShippingFeeRow[]>();
        for (const feeRow of ((productShippingFees || []) as ProductShippingFeeRow[])) {
            const currentFees = shippingFeesByDetail.get(feeRow.product_shipping_id) || [];
            currentFees.push(feeRow);
            shippingFeesByDetail.set(feeRow.product_shipping_id, currentFees);
        }

        const shippingCurrencies = Array.from(
            new Set(
                ((productShippingFees || []) as ProductShippingFeeRow[])
                    .map((feeRow) => feeRow.currency_code)
                    .filter((currencyCode): currencyCode is string => Boolean(currencyCode && currencyCode !== "USD"))
            )
        );

        const { data: shippingExchangeRates } = shippingCurrencies.length
            ? await supabase
                  .from("exchange_rates")
                  .select("target_currency, rate")
                  .in("target_currency", shippingCurrencies)
            : { data: [] };

        const shippingExchangeRateMap = new Map(
            (shippingExchangeRates || []).map((exchangeRate) => [exchangeRate.target_currency, Number(exchangeRate.rate || 0)])
        );

        const returnPolicyByProduct = new Map<string, ProductReturnPolicyRow>();
        for (const policy of ((productReturnPolicies || []) as ProductReturnPolicyRow[])) {
            if (!policy.product_id || returnPolicyByProduct.has(policy.product_id)) {
                continue;
            }

            returnPolicyByProduct.set(policy.product_id, policy);
        }

        const brandProductQuantities = new Map<string, Map<string, number>>();
        for (const item of typedCartItems) {
            const variantId = item.product_id.id;
            const productId = variantToProductMap.get(variantId);
            const brandId = productId ? productToBrandMap.get(productId) : null;

            if (!productId || !brandId) {
                continue;
            }

            const brandProducts = brandProductQuantities.get(brandId) || new Map<string, number>();
            brandProducts.set(productId, (brandProducts.get(productId) || 0) + Number(item.quantity || 0));
            brandProductQuantities.set(brandId, brandProducts);
        }

        const returnPolicyGroups = new Map<string, ReturnPolicyGroupSummary>();
        for (const [brandId, productMap] of brandProductQuantities.entries()) {
            const productIds = Array.from(productMap.keys());
            const policies = productIds
                .map((productId) => returnPolicyByProduct.get(productId))
                .filter((policy): policy is ProductReturnPolicyRow => Boolean(policy));

            if (policies.length === 0) {
                continue;
            }

            const allReturnable = policies.every((policy) => policy.is_returnable !== false);
            const noneReturnable = policies.every((policy) => policy.is_returnable === false);
            const returnWindowSet = new Set(
                policies
                    .map((policy) => policy.return_window_days)
                    .filter((value): value is number => value != null)
            );
            const responsibilitySet = new Set(
                policies.map((policy) => getResponsibilityLabel(policy.return_shipping_responsibility))
            );

            const uniformReturnWindow = returnWindowSet.size === 1 ? Array.from(returnWindowSet)[0] : null;
            const uniformResponsibility =
                responsibilitySet.size === 1
                    ? Array.from(responsibilitySet)[0]
                    : "Return shipping policy varies by item";

            const policySummary = (() => {
                if (noneReturnable) {
                    return "Final sale for this brand group";
                }

                if (!allReturnable) {
                    return "Return eligibility varies by item";
                }

                if (uniformReturnWindow != null) {
                    return `${uniformReturnWindow}-day returns`;
                }

                return "Return window varies by item";
            })();

            returnPolicyGroups.set(brandId, {
                brandId,
                brandName: brandNameMap.get(brandId) || "Brand",
                isReturnable: !noneReturnable,
                returnWindowDays: uniformReturnWindow,
                responsibilityLabel: uniformResponsibility,
                policySummary,
                returnPolicySnapshot: {
                    isReturnable: !noneReturnable,
                    returnWindowDays: uniformReturnWindow,
                    responsibilityLabel: uniformResponsibility,
                    policySummary,
                },
            });
        }

        const shippingGroups = new Map<string, ShippingGroupSummary>();
        for (const [brandId, productMap] of brandProductQuantities.entries()) {
            const productQuantities = Array.from(productMap.entries()).map(([productId, quantity]) => ({
                productId,
                quantity,
            }));

            if (productQuantities.length === 0) {
                continue;
            }

            const desiredZone = resolveShippingZoneForDestination(
                brandCountryMap.get(brandId) || null,
                destinationCountryCode || null
            );

            const productRuleOptions = productQuantities.map((productSummary) => {
                const shippingDetailId = productShippingDetailMap.get(productSummary.productId);
                const feeRows = shippingDetailId ? (shippingFeesByDetail.get(shippingDetailId) || []) : [];

                const rules = feeRows
                    .filter((feeRow) => feeRow.available && feeRow.base_fee != null)
                    .map((feeRow) => {
                        const methodType = normalizeMethodType(feeRow.method_type);
                        const zoneType = normalizeZoneType(feeRow.zone_type);
                        if (!methodType || !zoneType) {
                            return null;
                        }

                        return {
                            methodType,
                            zoneType,
                            baseFee: Number(feeRow.base_fee || 0),
                            additionalItemFee:
                                feeRow.currency_code && feeRow.currency_code !== "USD"
                                    ? Number(feeRow.additional_item_fee || 0) /
                                      Number(shippingExchangeRateMap.get(feeRow.currency_code) || 1)
                                    : Number(feeRow.additional_item_fee || 0),
                            strategy: feeRow.calculation_strategy || "base_incremental",
                        } satisfies ShippingRule;
                    })
                    .filter((rule): rule is ShippingRule => Boolean(rule));

                return {
                    ...productSummary,
                    rules,
                };
            });

            const candidateKeys = new Set<string>();
            if (desiredZone) {
                const firstProductKeys = productRuleOptions[0]?.rules
                    .filter((rule) => rule.zoneType === desiredZone)
                    .map((rule) => `${rule.methodType}:${rule.zoneType}`) || [];

                for (const key of firstProductKeys) {
                    if (
                        productRuleOptions.every((product) =>
                            product.rules.some((rule) => `${rule.methodType}:${rule.zoneType}` === key)
                        )
                    ) {
                        candidateKeys.add(key);
                    }
                }
            }

            if (candidateKeys.size === 0) {
                const firstProductKeys = productRuleOptions[0]?.rules.map((rule) => `${rule.methodType}:${rule.zoneType}`) || [];
                for (const key of firstProductKeys) {
                    if (
                        productRuleOptions.every((product) =>
                            product.rules.some((rule) => `${rule.methodType}:${rule.zoneType}` === key)
                        )
                    ) {
                        candidateKeys.add(key);
                    }
                }
            }

            let bestCandidate:
                | {
                      methodType: string;
                      zoneType: string;
                      shippingEstimateBase: number;
                  }
                | null = null;

            for (const candidateKey of candidateKeys) {
                const [methodType, zoneType] = candidateKey.split(":");
                const matchingRules = productRuleOptions.map((product) =>
                    product.rules.find(
                        (rule) => rule.methodType === methodType && rule.zoneType === zoneType
                    )
                );

                if (matchingRules.some((rule) => !rule)) {
                    continue;
                }

                const shippingEstimateBase = calculateRuleTotal(
                    matchingRules as ShippingRule[],
                    productQuantities
                );

                if (shippingEstimateBase == null) {
                    continue;
                }

                if (!bestCandidate || shippingEstimateBase < bestCandidate.shippingEstimateBase) {
                    bestCandidate = {
                        methodType,
                        zoneType,
                        shippingEstimateBase,
                    };
                }
            }

            if (!bestCandidate) {
                continue;
            }

            const shippingEstimateCustomerCurrency =
                exchangeRateUsed > 0
                    ? convertBaseCurrencyPrice(bestCandidate.shippingEstimateBase, exchangeRateUsed) || 0
                    : bestCandidate.shippingEstimateBase;

            shippingGroups.set(brandId, {
                brandId,
                brandName: brandNameMap.get(brandId) || "Brand",
                methodType: bestCandidate.methodType,
                zoneType: bestCandidate.zoneType,
                shippingEstimateBase: bestCandidate.shippingEstimateBase,
                shippingEstimateCustomerCurrency,
                formattedShippingEstimate: formatStorefrontPrice(
                    shippingEstimateCustomerCurrency,
                    currencyCode
                ),
                shippingRuleSnapshot: {
                    strategy: "base_incremental",
                    methodType: bestCandidate.methodType,
                    zoneType: bestCandidate.zoneType,
                    shippingEstimateBase: bestCandidate.shippingEstimateBase,
                    shippingEstimateCustomerCurrency,
                    currencyCode,
                    exchangeRateUsed,
                    destinationCountryCode: destinationCountryCode || null,
                },
            });
        }

        const groupedShippingEstimates = Array.from(shippingGroups.values());
        const shippingTotalCustomerCurrency = groupedShippingEstimates.reduce(
            (sum, group) => sum + group.shippingEstimateCustomerCurrency,
            0
        );
        const couponContext = await getCartCouponContext({
            cartId,
            cartItems: typedCartItems.map((item) => ({
                id: item.id,
                product_id: item.product_id.id,
                quantity: item.quantity,
                unit_price_base: item.unit_price_base,
                unit_price_customer_currency: item.unit_price_customer_currency,
                price: item.price,
                variant_name_snapshot: item.variant_name_snapshot,
                product_name_snapshot: item.product_name_snapshot,
            })),
            groupedShippingEstimates,
            currencyCode,
            exchangeRateUsed,
            brandNameMap,
            variantToProductMap,
            productToBrandMap,
            productToCategoryMap,
            injectedSupabase: supabase,
        });
        const grandTotalCustomerCurrency =
            subtotalCustomerCurrency + shippingTotalCustomerCurrency - couponContext.discountTotalCustomerCurrency;

        return {
            productsWithImages,
            totalPrice,
            currencyCode,
            formattedTotalPrice: formatStorefrontPrice(totalPrice, currencyCode),
            subtotalBase,
            subtotalCustomerCurrency,
            groupedShippingEstimates,
            groupedCouponDiscounts: couponContext.groupedCouponDiscounts.map((group) => ({
                brandId: group.brandId,
                brandName: group.brandName,
                couponId: group.couponId,
                couponCode: group.couponCode,
                couponName: group.couponName,
                discountType: group.discountType,
                appliesTo: group.appliesTo,
                discountBase: group.discountBase,
                discountCustomerCurrency: group.discountCustomerCurrency,
                formattedDiscount: group.formattedDiscount,
                couponSnapshot: group.couponSnapshot,
            })),
            discountTotalBase: couponContext.discountTotalBase,
            discountTotalCustomerCurrency: couponContext.discountTotalCustomerCurrency,
            formattedDiscountTotal: couponContext.formattedDiscountTotal,
            groupedReturnPolicies: Array.from(returnPolicyGroups.values()),
            shippingTotalCustomerCurrency,
            formattedShippingTotal: formatStorefrontPrice(shippingTotalCustomerCurrency, currencyCode),
            grandTotalCustomerCurrency,
            formattedGrandTotal: formatStorefrontPrice(grandTotalCustomerCurrency, currencyCode),
        };

    } catch (error) {
        console.error(error instanceof Error ? error.message : "Failed to fetch cart items");
        throw error;
    }
};
