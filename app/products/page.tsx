import { createClient } from "@/supabase/server";
import { getServerAnonymousId } from "@/lib/anon_user/server";
import { getStorefrontProducts } from "@/actions/storefront/get-storefront-products";
import { StorefrontProductsClient } from "@/components/customer-facing-components/storefront/storefront-products-client";
import { getPreferredStorefrontCurrency } from "@/lib/storefront-currency.server";

interface ProductsPageProps {
  searchParams?: Promise<{
    query?: string;
    cat?: string;
    gender?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.query || "";
  const category = resolvedSearchParams.cat || "";
  const gender = resolvedSearchParams.gender || "";
  const selectedCurrency = await getPreferredStorefrontCurrency();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || null;
  const anonymousId = userId ? null : await getServerAnonymousId();
  const serverUserIdentifier = userId || anonymousId || "";
  const isAnonymous = !userId;
  

  const [products, savedListResult] = await Promise.all([
    getStorefrontProducts({ query, category, gender, currencyCode: selectedCurrency }),
    serverUserIdentifier
      ? supabase
          .from("saved_list")
          .select("id, saved_list_items(variant_id)")
          .eq(isAnonymous ? "anonymous_id" : "user_id", serverUserIdentifier)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const savedVariantIds = Array.isArray(savedListResult.data?.saved_list_items)
    ? savedListResult.data.saved_list_items
        .map((item) => item.variant_id)
        .filter((variantId): variantId is string => Boolean(variantId))
    : [];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <StorefrontProductsClient
          initialProducts={products.products}
          matchedCategories={products.matchedCategories}
          exactCategoryMatch={products.exactCategoryMatch}
          initialSavedVariantIds={savedVariantIds}
          initialQuery={query}
          initialCategory={category}
          initialGender={gender}
          selectedCurrency={selectedCurrency}
          serverUserIdentifier={serverUserIdentifier}
          isAnonymous={isAnonymous}
        />
      </div>
    </div>
  );
}
