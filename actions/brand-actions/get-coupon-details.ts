'use server';

import { CouponFormDetails } from "@/components/brand-dashboard/coupon-client";
import { CountryData } from "@/lib/country-data";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

interface GetCouponDetailsResponse {
    success: boolean;
    message: string;
    data: CouponFormDetails | null;
}

export async function GetCouponDetails(couponId: string): Promise<GetCouponDetailsResponse> {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            redirect('/login-brand');
        }
        const brandId = user.id;

        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('id', couponId)
            .eq('brand_id', brandId)
            .single();

        if (couponError || !coupon) {
            return {
                success: false,
                message: couponError?.message || "Coupon not found or permission denied.",
                data: null
            };
        }

        const [
            { data: countriesData },
            { data: productsData },
            { data: categoriesData }
        ] = await Promise.all([
            supabase.from('coupon_countries').select('country_code').eq('coupon_id', couponId),
            supabase.from('coupon_products').select('products_list(name)').eq('coupon_id', couponId),
            supabase.from('coupon_categories').select('categories(name)').eq('coupon_id', couponId)
        ]);

        const allowedCountryCodes = countriesData?.map(c => c.country_code) || [];
        const allowedCountryNames = CountryData
            .filter(country => allowedCountryCodes.includes(country.iso2))
            .map(country => country.name);

        const includedProductNames = productsData?.flatMap(p => (p.products_list as any)?.name ? (p.products_list as any).name : []) || [];
        const includedCategoryNames = categoriesData?.flatMap(c => (c.categories as any)?.name ? (c.categories as any).name : []) || [];

        const couponFormDetails: CouponFormDetails = {
            id: coupon.id,
            name: coupon.name,
            code: coupon.code,
            description: coupon.description || "",
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value ?? undefined,
            baseCurrencyDiscountValue: coupon.base_currency_discount_value,
            currencyCode: coupon.currency_code, 
            usageLimit: coupon.usage_limit,
            singleUsePerCustomer: coupon.single_use_per_customer ? "active" : "inactive",
            minOrderAmount: coupon.min_order_amount,
            startDate: coupon.start_date,
            endDate: coupon.end_date || "",
            isActive: coupon.is_active ? "active" : "inactive",
            autoApply: coupon.auto_apply ? "active" : "inactive",
            appliesTo: coupon.applies_to,
            includedProductNames: includedProductNames,
            includedCategoryNames: includedCategoryNames,
            eligibleCustomers: coupon.eligible_customers,
            allowedCountries: allowedCountryNames,
            includeSaleItems: coupon.include_sale_items ? "active" : "inactive",
        };

        return { success: true, message: "Coupon details fetched successfully.", data: couponFormDetails };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching coupon details:", errorMessage);
        return { success: false, message: errorMessage, data: null };
    }
}