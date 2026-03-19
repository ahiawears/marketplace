import ProductItem from '@/components/ui/product-item-detail'
import { getVariantBySlug } from "@/actions/user-actions/product-and-data/get-variant-by-id";
import { createClient } from '@/supabase/server';
import { getServerAnonymousId } from '@/lib/anon_user/server';
import { getSavedProductById } from '@/actions/user-actions/product-and-data/get-saved-product-by-id';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cache } from 'react';
import { getPreferredStorefrontCurrency } from '@/lib/storefront-currency.server';
import { GetExchangeRates } from '@/hooks/get-exchange-rate';
import { convertBaseCurrencyPrice, formatStorefrontPrice } from '@/lib/storefront-pricing';

interface Props {
    params: Promise<{ slug: string }>
}

const getProduct = cache(async (slug: string) => {
    return await getVariantBySlug(slug);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const variantData = await getProduct(slug);
    
    if (!variantData.success || !variantData.data) {
        return { title: "Product Not Found" };
    }
    
    return { title: variantData.data.name };
}

export default async function ProductDetail({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    const userIdentifier = userId || await getServerAnonymousId();
    const isAnonymous = !userId;

    const variantData = await getProduct(slug);
    
    if (!variantData.success || !variantData.data) {
        notFound();
    }

    const selectedCurrency = await getPreferredStorefrontCurrency();
    const exchangeRate =
        selectedCurrency === "USD"
            ? 1
            : await GetExchangeRates("USD", selectedCurrency);
    const displayPrice = convertBaseCurrencyPrice(
        variantData.data.base_currency_price,
        exchangeRate
    );
    const displayPriceFormatted = formatStorefrontPrice(displayPrice, selectedCurrency);

    const savedData = await getSavedProductById(variantData.data.id, userIdentifier, isAnonymous);

    return (
        <div className="">
            <ProductItem
                variantData={variantData.data}
                displayPriceFormatted={displayPriceFormatted}
                selectedCurrency={selectedCurrency}
                initialIsSaved={savedData.isSaved}
                serverUserIdentifier={userIdentifier}
                isAnonymous={isAnonymous}
            />
        </div>
    )
}
