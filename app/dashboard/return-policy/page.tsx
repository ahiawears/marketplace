import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { getBrandGlobalReturnPolicy } from "@/actions/return-policy/get-brand-global-return-policy";
import ReturnPolicyForm from "@/components/brand-dashboard/return-policy-form";
import { GetExchangeRates } from "@/hooks/get-exchange-rate";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Return Policy",
};

function getCurrencyByIso2(iso2Code: string | undefined, countryData: CountryDataType[]): string | null {
    if (!iso2Code) return null;
    const iso2Lower = iso2Code.toLowerCase();
    const country = countryData.find(
        (country) => country.iso2.toLowerCase() === iso2Lower
    );
    return country ? country.currency : null;
}

const ReturnPolicy = async () => {
    const supabase = await createClient();

    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user.user) {
        redirect("/login-brand");
    }  

    const userId = user.user.id;

    // const brandReturnPolicy = await getBrandGlobalReturnPolicy(userId);
    const [brandReturnPolicy, brandLegal] = await Promise.all([
        getBrandGlobalReturnPolicy(userId),
        GetBrandLegalDetails(userId),
    ]);
    let brandReturnPolicyData;

    if (!brandReturnPolicy.success) {
        // Return a notFound or error page if the policy is not found or fails
        // You could also render a message on the page instead
        // return notFound();
        console.log(brandReturnPolicy.message);
    }

    brandReturnPolicyData = brandReturnPolicy.success ? brandReturnPolicy.data : null;


    if (!brandLegal.success) {
        // If legal details are not found, we can't get the country or currency.
        redirect("/login-brand");
    }

    let brand_country;
    if (brandLegal.success && brandLegal.data !== null) {
        brand_country = brandLegal.data.country_of_registration;
    }

    const brandCurrency = getCurrencyByIso2(brand_country, CountryData);

    if (!brandCurrency) {
        redirect('/login-brand');
    }

    const todaysRate = brandCurrency === "USD" ? 1 : await GetExchangeRates("USD", brandCurrency);

    return (
        <div className="my-4">
            <ReturnPolicyForm 
                userId={userId} 
                currencyCode={brandCurrency}
                todayExchangeRate={todaysRate}
                data={brandReturnPolicyData}
            />
        </div>
    )
}

export default ReturnPolicy;