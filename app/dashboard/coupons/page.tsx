import CouponClient from "@/components/brand-dashboard/coupon-client";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { CountryData } from "@/lib/country-data";

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

        // TODO: Fetch actual coupon list from the database
        const couponList = [] as any[]; 
        
        // TODO: Fetch coupon form details if editing
        const couponFormDetails = {
            name: "",
            code: "",
            discountType: "percentage",
            singleUsePerCustomer: false,
            startDate: "",
            isActive: true,
            appliesTo: "entire_store",
            eligibleCustomers: "all_customers",
        };

        return (
            <div className="p-4">
                <CouponClient 
                    userId={userId}
                    currency={currency}
                    couponList={couponList}
                    couponFormDetails={couponFormDetails as any}
                />
            </div>
        )
    } catch (error) {
        console.error("Error in Coupons page:", error);
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-red-800">Error</h2>
                    <p className="text-red-600">Failed to load coupon data. Please try again.</p>
                </div>
            </div>
        );
    }
}
