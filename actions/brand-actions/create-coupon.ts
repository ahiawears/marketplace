'use server';
import { CouponFormDetails } from "@/components/brand-dashboard/coupon-client";
import { CountryData } from "@/lib/country-data";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

function roundCurrencyAmount(amount: number) {
    return Number(amount.toFixed(2));
}

async function convertToBaseCurrency(
    supabase: Awaited<ReturnType<typeof createClient>>,
    amount: number | null | undefined,
    currencyCode: string
) {
    if (amount == null) {
        return null;
    }

    if (currencyCode === "USD") {
        return roundCurrencyAmount(amount);
    }

    const { data, error } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("target_currency", currencyCode)
        .single<{ rate: number }>();

    if (error || !data?.rate || data.rate <= 0) {
        throw new Error(`No valid exchange rate found for ${currencyCode}.`);
    }

    return roundCurrencyAmount(amount / data.rate);
}

export async function CreateCoupon (couponData: CouponFormDetails) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error("User not authenticated");
        }
        const brandId = user.id;

        let countryIso2List: string[] = [];
        if (couponData.allowedCountries && couponData.allowedCountries.length > 0) {
            countryIso2List = CountryData
                .filter(country => couponData.allowedCountries?.includes(country.name))
                .map(country => country.iso2);
            console.log("The countryIso2List is:", countryIso2List);
        }

        let productIds: string[] = [];
        if (couponData.appliesTo === 'products') {
            for (const productName of couponData.includedProductNames || []) {
                const { data: productId, error: productIdError } = await supabase
                    .from('products_list')
                    .select('id')
                    .eq('name', productName)
                    .eq('brand_id', brandId)
                    .single();
            
                if (productIdError) {
                    if (productIdError.code === 'PGRST116') {
                        throw new Error(`Product with name "${productName}" not found for this brand`);
                    }  
                    throw productIdError;
                }
                if (productId) {
                    productIds.push(productId.id);
                }
            }
        }
        console.log("The productIds are:", productIds);

        //Get included category ids if appliesTo is categories
        let categoryIds: string[] = [];
        if (couponData.appliesTo === 'categories') {
            for (const categoryName of couponData.includedCategoryNames || []) {
                const { data: categoryId, error: categoryIdError } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('name', categoryName)
                    .single();
            
                if (categoryIdError) {
                    if (categoryIdError.code === 'PGRST116') {
                        throw new Error(`Category with name "${categoryName}" not found`);
                    }  
                    throw categoryIdError;
                }
                if (categoryId) {
                    categoryIds.push(categoryId.id);
                }
            }
        }
        console.log("The categoryIds are:", categoryIds);

        const currencyCode = couponData.currencyCode || "USD";
        const normalizedCode = couponData.code.trim().toUpperCase();
        const baseCurrencyDiscountValue =
            couponData.discountType === "fixed"
                ? await convertToBaseCurrency(
                    supabase,
                    couponData.discountValue ?? null,
                    currencyCode
                )
                : null;
        const baseCurrencyMinOrderAmount = await convertToBaseCurrency(
            supabase,
            couponData.minOrderAmount ?? null,
            currencyCode
        );

        const { data: createdCoupon, error: couponInsertError } = await supabase
            .from("coupons")
            .insert({
                brand_id: brandId,
                name: couponData.name,
                code: normalizedCode,
                description: couponData.description || null,
                discount_type: couponData.discountType,
                discount_value: couponData.discountType === "free_shipping" ? null : couponData.discountValue ?? null,
                base_currency_discount_value: baseCurrencyDiscountValue,
                currency_code: currencyCode,
                usage_limit: couponData.usageLimit || null,
                single_use_per_customer: couponData.singleUsePerCustomer === "active",
                min_order_amount: couponData.minOrderAmount ?? 0,
                base_currency_min_order_amount: baseCurrencyMinOrderAmount,
                start_date: couponData.startDate,
                end_date: couponData.endDate || null,
                is_active: couponData.isActive === "active",
                auto_apply: couponData.autoApply === "active",
                applies_to: couponData.appliesTo,
                eligible_customers: couponData.eligibleCustomers,
                include_sale_items: couponData.includeSaleItems === "active",
            })
            .select("id")
            .single<{ id: string }>();

        if (couponInsertError || !createdCoupon?.id) {
            let errorMessage;
            if (couponInsertError instanceof Error) {
                errorMessage = couponInsertError.message;
            } else {
                errorMessage = "An unknown error occurred.";
            }
            return {
                success: false,
                message: errorMessage,
                id: null
            };
        }

        const couponId = createdCoupon.id;

        const relationshipInserts: PromiseLike<{ error: Error | null }>[] = [];

        if (countryIso2List.length > 0) {
            relationshipInserts.push(
                supabase
                    .from("coupon_countries")
                    .insert(countryIso2List.map((countryCode) => ({
                        coupon_id: couponId,
                        country_code: countryCode,
                    })))
            );
        }

        if (productIds.length > 0) {
            relationshipInserts.push(
                supabase
                    .from("coupon_products")
                    .insert(productIds.map((productId) => ({
                        coupon_id: couponId,
                        product_id: productId,
                    })))
            );
        }

        if (categoryIds.length > 0) {
            relationshipInserts.push(
                supabase
                    .from("coupon_categories")
                    .insert(categoryIds.map((categoryId) => ({
                        coupon_id: couponId,
                        category_id: categoryId,
                    })))
            );
        }

        const relationshipResults = await Promise.all(relationshipInserts);
        const relationshipError = relationshipResults.find((result) => result.error);
        if (relationshipError?.error) {
            await supabase.from("coupons").delete().eq("id", couponId);
            return {
                success: false,
                message: relationshipError.error.message,
                id: null
            };
        }

        revalidatePath('/dashboard/coupons');

        return {
            success: true,
            message: "Coupon created successfully.",
            id: couponId
        };

    } catch (error) {
        let errorMessage;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred.";
        }
        // throw new Error(errorMessage);
        return {
            success: false,
            message: errorMessage,
            id: null
        }
    }
}
