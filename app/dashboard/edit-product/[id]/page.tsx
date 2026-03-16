import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import AddProductClient from "@/components/brand-dashboard/add-product/add-product-client";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { GetShippingConfig } from "@/actions/get-brand-details/get-shipping-config";
import { GetExchangeRates } from "@/hooks/get-exchange-rate";
import { getBrandGlobalReturnPolicy } from "@/actions/return-policy/get-brand-global-return-policy";
import { loadProductEditorData } from "@/actions/add-product/load-product-editor-data";

export const metadata = {
    title: "Edit Product",
};

function getCurrencyByIso2(iso2Code: string | undefined, countryData: CountryDataType[]): string | undefined {
    return countryData.find((c) => c.iso2.toLowerCase() === iso2Code?.toLowerCase())?.currency;
}

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
    const { id } = await params;
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
        redirect("/login-brand");
    }

    const brandId = user.user.id;
    const brandData = await GetBrandLegalDetails(brandId);

    if (!brandData.success || !brandData.data) {
        redirect("/login-brand");
    }

    const brandCountry = brandData.data.country_of_registration;
    const brandCurrency = getCurrencyByIso2(brandCountry, CountryData);

    if (!brandCurrency) {
        redirect("/login-brand");
    }

    const todaysRate = brandCurrency === "USD"
        ? 1
        : await GetExchangeRates("USD", brandCurrency);

    const shippingConfig = await GetShippingConfig();
    if (shippingConfig.message === "Unauthorized") {
        redirect("/login-brand");
    }

    const globalReturnPolicy = await getBrandGlobalReturnPolicy(brandId);
    const initialProductData = await loadProductEditorData(supabase, brandId, id);

    return (
        <div>
            <div className="mx-auto shadow-2xl">
                <div className="mx-auto max-w-7xl border-2 p-4">
                    <AddProductClient
                        currencyCode={brandCurrency}
                        todayExchangeRate={todaysRate}
                        shippingConfig={shippingConfig.data}
                        globalReturnPolicy={globalReturnPolicy.success ? globalReturnPolicy.data : null}
                        mode="edit"
                        initialProductData={initialProductData}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;
