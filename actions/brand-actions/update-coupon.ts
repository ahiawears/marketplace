'use server';

import { CouponFormDetails } from "@/components/brand-dashboard/coupon-client";
import { createClient } from "@/supabase/server";
import { CountryData } from "@/lib/country-data";
import { revalidatePath } from "next/cache";

async function getProductIdsByNames(supabase: any, productNames: string[], brandId: string): Promise<string[]> {
    if (!productNames || productNames.length === 0) return [];
    const { data, error } = await supabase
        .from('products_list')
        .select('id')
        .in('name', productNames)
        .eq('brand_id', brandId);
    if (error) throw new Error(`Failed to get product IDs: ${error.message}`);
    return data.map((p: any) => p.id);
}

async function getCategoryIdsByNames(supabase: any, categoryNames: string[]): Promise<string[]> {
    if (!categoryNames || categoryNames.length === 0) return [];
    const { data, error } = await supabase
        .from('categories')
        .select('id')
        .in('name', categoryNames);
    if (error) throw new Error(`Failed to get category IDs: ${error.message}`);
    return data.map((c: any) => c.id);
}


export async function UpdateCoupon(formData: CouponFormDetails) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Authentication required.");
    }
    if (!formData.id) {
        throw new Error("Coupon ID is missing for update.");
    }

    const brandId = user.id;
    const couponId = formData.id;

    try {
        // 1. Update the main coupon details
        const { error: couponUpdateError } = await supabase
            .from('coupons')
            .update({
                name: formData.name,
                code: formData.code,
                description: formData.description,
                discount_type: formData.discountType,
                discount_value: formData.discountValue,
                base_currency_discount_value: formData.baseCurrencyDiscountValue,
                currency_code: formData.currencyCode,
                usage_limit: formData.usageLimit,
                single_use_per_customer: formData.singleUsePerCustomer === 'active',
                min_order_amount: formData.minOrderAmount,
                start_date: formData.startDate,
                end_date: formData.endDate || null,
                is_active: formData.isActive === 'active',
                auto_apply: formData.autoApply === 'active',
                applies_to: formData.appliesTo,
                eligible_customers: formData.eligibleCustomers,
                include_sale_items: formData.includeSaleItems === 'active',
            })
            .eq('id', couponId)
            .eq('brand_id', brandId);

        if (couponUpdateError) throw new Error(`Failed to update coupon: ${couponUpdateError.message}`);

        // 2. Handle many-to-many relationships (delete old, insert new)
        await Promise.all([
            supabase.from('coupon_countries').delete().eq('coupon_id', couponId),
            supabase.from('coupon_products').delete().eq('coupon_id', couponId),
            supabase.from('coupon_categories').delete().eq('coupon_id', couponId),
        ]);

        const insertPromises = [];

        if (formData.allowedCountries?.length) {
            // The form sends country names, so we need to convert them back to ISO2 codes.
            const countryIso2List = CountryData
                .filter(country => formData.allowedCountries?.includes(country.name))
                .map(country => country.iso2);

            const countriesToInsert = countryIso2List.map(code => ({ coupon_id: couponId, country_code: code }));
            if (countriesToInsert.length > 0) insertPromises.push(supabase.from('coupon_countries').insert(countriesToInsert));
        }

        if (formData.appliesTo === 'products' && formData.includedProductNames?.length) {
            const productIds = await getProductIdsByNames(supabase, formData.includedProductNames, brandId);
            const productsToInsert = productIds.map(id => ({ coupon_id: couponId, product_id: id }));
            if (productsToInsert.length > 0) insertPromises.push(supabase.from('coupon_products').insert(productsToInsert));
        }

        if (formData.appliesTo === 'categories' && formData.includedCategoryNames?.length) {
            const categoryIds = await getCategoryIdsByNames(supabase, formData.includedCategoryNames);
            const categoriesToInsert = categoryIds.map(id => ({ coupon_id: couponId, category_id: id }));
            if (categoriesToInsert.length > 0) insertPromises.push(supabase.from('coupon_categories').insert(categoriesToInsert));
        }

        await Promise.all(insertPromises);

        revalidatePath('/dashboard/coupons');
        return { success: true, message: "Coupon updated successfully." };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, message: errorMessage };
    }
}