import CouponClient, { CouponFormDetails } from "@/components/brand-dashboard/coupon-client";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { CountryData } from "@/lib/country-data";
import { FetchBrandProducts } from "@/actions/get-products-list/fetchBrandProducts";
import { GetCoupons } from "@/actions/brand-actions/get-coupons";
import { stat } from "fs";

export const metadata: Metadata = {
    title: "Coupons",
}

export default async function Coupons () {
    const supabase = await createClient();
    
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            redirect("/login-brand");
        }
        const userId = user.id;

        // Fetch brand's country to determine currency
        const brandLegalData = await GetBrandLegalDetails(userId);
        let currency = "USD"; // Default currency
        if (brandLegalData.success && brandLegalData.country_of_registration) {
            const country = CountryData.find(c => c.iso2 === brandLegalData.country_of_registration);
            if (country) {
                currency = country.currency;
            }
        }

        const brandProducts = await FetchBrandProducts(userId);
        if (!brandProducts.success) {
            // Handle the case where products fail to load, as they are needed for creating some coupons.
            return (
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200  p-4">
                        <h2 className="text-lg font-semibold text-red-800">Error Loading Products</h2>
                        <p className="text-red-600">
                            We couldn't load your products, which are required to create or manage product-specific coupons. 
                            Please try refreshing the page. If the problem persists, contact support.
                        </p>
                    </div>
                </div>
            );
        } else if (brandProducts.success && brandProducts.data === null) {
            return (
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200  p-4">
                        <h2 className="text-lg font-semibold text-red-800">No Products Found</h2>
                        <p>
                            You have to upload some products before you can create coupons  
                        </p>
                    </div>
                </div>
            )
        }
        const products = brandProducts.data;

        const brandCoupons = await GetCoupons();
        if (!brandCoupons.success) {
            throw new Error(brandCoupons.message);
        }
        const couponList = brandCoupons.data || [];

        
        // TODO: Fetch coupon form details if editing
        const couponFormDetails: CouponFormDetails = {
            name: "",
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: undefined,
            baseCurrencyDiscountValue: undefined,
            currencyCode: currency,

            usageLimit: 0,
            singleUsePerCustomer: "active",
            minOrderAmount: 0.00,

            startDate: new Date().toISOString().split('T', 1)[0],
            endDate: "",
            isActive: "active",

            appliesTo: "entire_store",
            includedProductNames: [],
            eligibleCustomers: "all_customers",
            allowedCountries: [],
            includeSaleItems: "inactive",
            autoApply: "inactive",
            includedCategoryNames: [],
        }

        return (
            <div className="p-4">
                <CouponClient 
                    userId={userId}
                    currency={currency}
                    couponList={couponList} 
                    couponFormDetails={couponFormDetails}
                    brandProducts={products || []}
                />
            </div>
        )
    } catch (error) {
        console.error("Error in Coupons page:", error);
        let errorMessage;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = String(error);
        }
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-red-800">Error</h2>
                    <p className="text-red-600">{`Failed to load coupons: ${errorMessage}`}</p>
                </div>
            </div>
        );
    }
}
