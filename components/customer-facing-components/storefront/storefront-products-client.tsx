"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { saveProduct } from "@/actions/user-actions/userSavedProductActions/save-product";
import { Button } from "@/components/ui/button";
import { StorefrontProductCard } from "@/components/customer-facing-components/storefront/storefront-product-card";
import { StorefrontQuickAddDialog } from "@/components/customer-facing-components/storefront/storefront-quick-add-dialog";
import { StorefrontProductCardData } from "@/components/customer-facing-components/storefront/types";

interface StorefrontProductsClientProps {
  initialProducts: StorefrontProductCardData[];
  matchedCategories: string[];
  exactCategoryMatch: string | null;
  initialSavedVariantIds: string[];
  initialQuery: string;
  initialCategory: string;
  initialGender: string;
  selectedCurrency: string;
  serverUserIdentifier: string;
  isAnonymous: boolean;
}

export function StorefrontProductsClient({
  initialProducts,
  matchedCategories,
  exactCategoryMatch,
  initialSavedVariantIds,
  initialQuery,
  initialCategory,
  initialGender,
  selectedCurrency,
  serverUserIdentifier,
  isAnonymous,
}: StorefrontProductsClientProps) {
  const [savedVariantIds, setSavedVariantIds] = useState<string[]>(initialSavedVariantIds);
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProductCardData | null>(null);
  const [, startSavingTransition] = useTransition();

  const resultsLabel = useMemo(() => {
    if (initialCategory) {
      return `Browsing ${initialCategory}`;
    }

    if (initialQuery && exactCategoryMatch) {
      return `Showing results for "${initialQuery}" across ${exactCategoryMatch}`;
    }

    if (initialQuery) {
      return `Showing results for "${initialQuery}"`;
    }

    if (initialGender) {
      return `Browsing ${initialGender}`;
    }

    return "Browse the catalog";
  }, [exactCategoryMatch, initialCategory, initialGender, initialQuery]);

  const handleToggleSaved = (variantId: string) => {
    const currentlySaved = savedVariantIds.includes(variantId);
    const nextSavedIds = currentlySaved
      ? savedVariantIds.filter((id) => id !== variantId)
      : [...savedVariantIds, variantId];

    setSavedVariantIds(nextSavedIds);

    startSavingTransition(async () => {
      const result = await saveProduct({
        variantId,
        size: "",
        isAnonymous,
        userId: serverUserIdentifier,
        path: "productsPage",
      });

      if (!result.success) {
        setSavedVariantIds(savedVariantIds);
        toast.error(result.error || "Failed to update saved items.");
        return;
      }

      toast.success(result.isSaved ? "Saved to your list." : "Removed from your list.");
    });
  };

  return (
    <>
      <div className="space-y-8">
        <section className="border-2 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Storefront</p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Products</h1>
              <p className="text-sm leading-6 text-stone-600 sm:text-base">
                {resultsLabel}. Explore live variants, open the full product detail page, or add a size directly to your cart.
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Prices shown in {selectedCurrency}
              </p>
              {matchedCategories.length > 0 && !initialCategory ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="self-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Matched categories
                  </span>
                  {matchedCategories.slice(0, 6).map((category) => {
                    const params = new URLSearchParams();
                    params.set("cat", category);
                    if (initialGender) {
                      params.set("gender", initialGender);
                    }

                    return (
                      <Button
                        key={category}
                        asChild
                        variant="outline"
                        className="h-auto rounded-none border-2 px-3 py-2 text-xs uppercase tracking-[0.18em]"
                      >
                        <Link href={`/products?${params.toString()}`}>{category}</Link>
                      </Button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {(initialQuery || initialCategory || initialGender) && (
              <Button asChild variant="outline">
                <Link href="/products">Clear filters</Link>
              </Button>
            )}
          </div>
        </section>

        {initialProducts.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {initialProducts.map((product) => (
              <StorefrontProductCard
                key={product.variantId}
                product={product}
                isSaved={savedVariantIds.includes(product.variantId)}
                onToggleSaved={handleToggleSaved}
                onQuickAdd={setSelectedProduct}
              />
            ))}
          </section>
        ) : (
          <section className="border-2 border-dashed bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-stone-900">No matching products found</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Try a different search term or category. Once more products are published from the dashboard, they will
              appear here automatically.
            </p>
          </section>
        )}
      </div>

      <StorefrontQuickAddDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
          }
        }}
        serverUserIdentifier={serverUserIdentifier}
        isAnonymous={isAnonymous}
      />
    </>
  );
}
