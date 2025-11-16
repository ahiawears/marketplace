import { createClient } from "@/supabase/server";
import PaymentSettingsClient from "@/components/brand-dashboard/payment-setting-client";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { FetchFlutterwaveBanks } from "@/lib/flutterwave/fetchFlutterwaveBanks";
import { CountryData } from "@/lib/country-data";
import { GetBrandBeneficiaryDetails } from "@/actions/get-brand-details/get-brand-beneficiary-details";

export const metadata: Metadata = {
    title: "Payment Settings",
}

export interface BankListType {
    id: number;
    name: string;
    code: string;
}

interface BeneficiaryData {
    id: string;
    beneficiary_id: number;
    beneficiary_name: string;
    bank_name: string;
    bank_code: string;
    account_number: string;
    currency: string;
    created_at: string;
}

export default async function PaymentSettings() {
    const supabase = await createClient();
    
    try {
        // Fetch user data on the server
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            redirect("/login-brand");
        }
        const userId = user.id;
        let userCountry;

        const brandLegalData = await GetBrandLegalDetails(userId);
        if(!brandLegalData.success) {
            //add a proper error here
            redirect("/login-brand");
        } 
        

        if (brandLegalData.success && brandLegalData.data !== null) {
            userCountry = brandLegalData.data.country_of_registration;
        }

        if (userCountry === null || userCountry === undefined) {
            redirect("/login-brand");
        }

        const beneficiaryData = await GetBrandBeneficiaryDetails(userId);
        const beneficiaryList = beneficiaryData.data as BeneficiaryData[];
        console.log("The beneficiaryList is:", beneficiaryList);

        const bankList = await FetchFlutterwaveBanks("NG") as BankListType[];

        const country = CountryData.find(c => c.iso2 === "NG")
        const currency = country?.currency;
        return (
            <PaymentSettingsClient 
                userId={user.id}
                currency={currency!}
                bankList={bankList}
                beneficiaryData={beneficiaryList!}
            />
        );
        
    } catch (error) {
        console.error("Error in PaymentSettings server component:", error);
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-red-800">Error</h2>
                    <p className="text-red-600">Failed to load payment settings. Please try again.</p>
                </div>
            </div>
        );
    }
}