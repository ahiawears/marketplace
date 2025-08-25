import React from "react";
//import AddProductForm from "../../../components/ui/add-product-form"
import AddProductClient from "@/components/brand-dashboard/add-product/add-product-client";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { GetShippingConfig } from "@/actions/get-brand-details/get-shipping-config";
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
    //Fetch base currency exchange rate also and use it to show the users how the prices are stored

    const shippingConfig = await GetShippingConfig();
    return (
        <div>
            <div className="mx-auto shadow-2xl">
                <div className="mx-auto max-w-7xl border-2 p-4">
                    {/* <AddProductForm />   */}
                    <AddProductClient 
                        currencyCode={brandCurrency!}
                        shippingConfig={shippingConfig.data}
                    />
                </div>
            </div>
        </div>  
    )
}


export default AddProduct;