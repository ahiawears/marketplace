'use server';
import { CouponFormDetails } from "@/components/brand-dashboard/coupon-client";
import { CountryData } from "@/lib/country-data";
import { createClient } from "@/supabase/server";

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

        const { data: couponId, error: rpcError } = await supabase.rpc("create_coupon", {
            p_brand_id: brandId,
            p_name: couponData.name,
            p_code: couponData.code,
            p_description: couponData.description,
            p_discount_type: couponData.discountType,
            p_discount_value: couponData.discountValue || null,
            p_base_currency_discount_value: couponData.baseCurrencyDiscountValue || null,
            p_usage_limit: couponData.usageLimit,
            p_single_use_per_customer: couponData.singleUsePerCustomer === "active",
            p_min_order_amount: couponData.minOrderAmount,
            p_start_date: couponData.startDate,
            p_end_date: couponData.endDate,
            p_is_active: couponData.isActive === "active",
            p_auto_apply: couponData.autoApply === "active",
            p_applies_to: couponData.appliesTo,
            p_eligible_customers: couponData.eligibleCustomers,
            p_include_sale_items: couponData.includeSaleItems === "active",
            p_product_ids: productIds,
            p_category_ids: categoryIds,
            p_country_codes: countryIso2List,
        });

        if (rpcError) {
            console.error("Error creating coupon:", rpcError);
            // throw rpcError;
            let errorMessage;
            if (rpcError instanceof Error) {
                errorMessage = rpcError.message;
            } else {
                errorMessage = "An unknown error occurred.";
            }
            return {
                success: false,
                message: errorMessage,
                id: null
            }
        }

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