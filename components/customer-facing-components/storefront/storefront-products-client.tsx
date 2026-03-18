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
  initialSavedVariantIds: string[];
  initialQuery: string;
  initialCategory: string;
  initialGender: string;
  serverUserIdentifier: string;
  isAnonymous: boolean;
}

export function StorefrontProductsClient({
  initialProducts,
  initialSavedVariantIds,
  initialQuery,
  initialCategory,
  initialGender,
  serverUserIdentifier,
  isAnonymous,
}: StorefrontProductsClientProps) {
  const [savedVariantIds, setSavedVariantIds] = useState<string[]>(initialSavedVariantIds);
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProductCardData | null>(null);
  const [, startSavingTransition] = useTransition();

  const resultsLabel = useMemo(() => {
    if (initialQuery) {
      return `Showing results for "${initialQuery}"`;
    }

    if (initialCategory) {
      return `Browsing ${initialCategory}`;
    }

    if (initialGender) {
      return `Browsing ${initialGender}`;
    }

    return "Browse the catalog";
  }, [initialCategory, initialGender, initialQuery]);

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Storefront</p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Products</h1>
              <p className="text-sm leading-6 text-stone-600 sm:text-base">
                {resultsLabel}. Explore live variants, open the full product detail page, or add a size directly to your cart.
              </p>
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
