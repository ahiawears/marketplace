import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { FetchBrandShippingConfig } from "@/actions/shipping-config/fetch-brand-shipping-config";
import ShippingConfigurationForm from "@/components/brand-dashboard/shipping-configuration-form";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: "Shipping Configuration",
};

function getCurrencyByIso2(iso2Code: string, countryData: CountryDataType[]): string | null {
    const country = countryData.find(
        (country) => country.iso2.toLowerCase() === iso2Code.toLowerCase()
    );
    return country ? country.currency : null;
}

const ShippingConfiguration = async () => {
    const supabase = await createClient();

    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user.user) {
        redirect("/login-brand");
    }   
    
    const userId = user.user.id;

    // Fetch both the shipping configuration and legal details in parallel
    const [brandConfig, brandLegal] = await Promise.all([
        FetchBrandShippingConfig(userId),
        GetBrandLegalDetails(userId),
    ]);

    // Handle errors from the parallel fetches
    if (!brandConfig.success) {
        // Return a notFound or error page if the config is not found or fails
        // You could also render a message on the page instead
        // return notFound();
        console.log(brandConfig.message);
    }

    if (!brandLegal.success) {
        // If legal details are not found, we can't get the country or currency.
        // It's best to return an error state.
        return notFound();
    }

    const brand_country = brandLegal.country_of_registration;
    const brand_currency = getCurrencyByIso2(brand_country!, CountryData);

    return (
        <div className="my-4">
            <ShippingConfigurationForm
                userId={userId}
                data={brandConfig.data!}
                brandCountry={brand_country!}
                brandCurrency={brand_currency!}
            />
        </div>
    );
};

export default ShippingConfiguration;