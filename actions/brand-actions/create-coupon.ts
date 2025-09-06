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

        //Get included products id if appliesTo is products
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
            throw rpcError;
        }

        return {
            success: true,
            id: couponId
        }; 

        // const generalCouponData = {
        //     brand_id: brandId,
        //     name: couponData.name,
        //     code: couponData.code,
        //     description: couponData.description,
        //     discount_type: couponData.discountType,
        //     discount_value: couponData.discountValue ? couponData.discountValue : null,
        //     base_currency_discount_value: couponData.baseCurrencyDiscountValue ? couponData.baseCurrencyDiscountValue : null,
        //     usage_limit: couponData.usageLimit,
        //     single_use_per_customer: couponData.singleUsePerCustomer === 'active' ? true : false,
        //     min_order_amount: couponData.minOrderAmount,
        //     start_date: couponData.startDate,
        //     end_date: couponData.endDate,
        //     is_active: couponData.isActive === 'active' ? true : false,
        //     auto_apply: couponData.autoApply === 'active' ? true : false,
        //     applies_to: couponData.appliesTo,
        //     eligible_customers: couponData.eligibleCustomers,
        //     include_sale_items: couponData.includeSaleItems === 'active' ? true : false,
        // }

        // const { data: insertedCoupon, error: insertError } = await supabase
        //     .from('coupons')
        //     .insert(generalCouponData)
        //     .select('id')
        //     .single();
            
        // if (insertError) {
        //     console.error("Error inserting coupon:", insertError);
        //     throw insertError;
        // }

        // const couponId = insertedCoupon.id;
        // console.log("The inserted coupon ID is:", couponId);


        // // Insert included products
        // if (couponData.appliesTo === 'products') {
        //     if (!couponData.includedProductNames || couponData.includedProductNames.length === 0) {
        //         throw new Error("No products selected for the coupon");
        //     }
        //     if (productIds.length === 0) {
        //         throw new Error("No valid product IDs found for the selected product names");
        //     }
        
        //     const productInserts = productIds.map(productId => ({
        //         coupon_id: couponId,
        //         product_id: productId,
        //     }));
        //     console.log("Inserting product ID:", productInserts);

        //     const { error: productInsertError } = await supabase
        //         .from('coupon_products')
        //         .insert(productInserts);
        //     if (productInsertError) {
        //         console.error("Error inserting coupon products:", productInsertError);
        //         throw productInsertError;
        //     }
            
        // }

        // // Insert included categories
        // if (couponData.appliesTo === 'categories') {
        //     if (!couponData.includedCategoryNames || couponData.includedCategoryNames.length === 0) {
        //         throw new Error("No categories selected for the coupon");
        //     }
        //     if (categoryIds.length === 0) {
        //         throw new Error("No valid category IDs found for the selected category names");
        //     }
        //     const categoryInserts = categoryIds.map(categoryId => ({
        //         coupon_id: couponId,
        //         category_id: categoryId,
        //     }));
        //     const { error: categoryInsertError } = await supabase
        //         .from('coupon_categories')
        //         .insert(categoryInserts);
        //     if (categoryInsertError) {
        //         console.error("Error inserting coupon categories:", categoryInsertError);
        //         throw categoryInsertError;
        //     }
                     
        // }

        // // Insert allowed countries if limit by country is enabled
        // if (couponData.allowedCountries && couponData.allowedCountries.length > 0) {
        //     if (!countryIso2List || countryIso2List.length === 0) {
        //         throw new Error("No valid country ISO2 codes found for the selected country names, please contact support");
        //     }
        //     console.log("Inserting allowed country ISO2 codes:", countryIso2List);

        //     const countryInserts = countryIso2List.map(iso2 => ({
        //         coupon_id: couponId,
        //         country_code: iso2,
        //     }));
        //     const { error: countryInsertError } = await supabase
        //         .from('coupon_countries')
        //         .insert(countryInserts);
            
        //     if ( countryInsertError ) throw countryInsertError;
        // }

    } catch (error) {
        let errorMessage;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred.";
        }
        throw new Error(errorMessage);
    }
}