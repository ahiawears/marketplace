import React from "react";
import AddProductClient from "@/components/brand-dashboard/add-product/add-product-client";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { GetShippingConfig } from "@/actions/get-brand-details/get-shipping-config";
import { GetExchangeRates } from "@/hooks/get-exchange-rate";
export const metadata = {
    title: "Add Product",
}

function getCurrencyByIso2(iso2Code: string, countryData: CountryDataType[]): string | null {
    const country = countryData.find(
        (country) => country.iso2.toLowerCase() === iso2Code.toLowerCase()
    );
    return country ? country.currency : null;
}

const AddProduct = async () => {
    const supabase = await createClient();
    const {data: user } = await supabase.auth.getUser();
    if (!user.user) {
        redirect('/login-brand');
    }
    const brandId = user.user.id;
    const brandData = await GetBrandLegalDetails(brandId);

    if (!brandData) {
        redirect('/login-brand');
    }
    const brandCountry = brandData.country_of_registration;
    const brandCurrency = getCurrencyByIso2(brandCountry!, CountryData);
    console.log("Brand Currency is ", brandCurrency);

    //Fetch base currency exchange rate also and use it to show the users how the prices are stored
    let todaysRate;
    if(brandCurrency !== null) {
        todaysRate = await GetExchangeRates('USD', brandCurrency);
    }
    if (brandCurrency === 'USD' ) {
        todaysRate = 1;
    } 
    
    const shippingConfig = await GetShippingConfig();
    return (
        <div>
            <div className="mx-auto shadow-2xl">
                <div className="mx-auto max-w-7xl border-2 p-4">
                    <AddProductClient 
                        currencyCode={brandCurrency!}
                        todayExchangeRate={todaysRate!}
                        shippingConfig={shippingConfig.data}
                    />
                </div>
            </div>
        </div>  
    )
}


export default AddProduct;