"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorefrontProductCardData } from "@/components/customer-facing-components/storefront/types";

interface StorefrontProductCardProps {
  product: StorefrontProductCardData;
  isSaved: boolean;
  onToggleSaved: (variantId: string) => void;
  onQuickAdd: (product: StorefrontProductCardData) => void;
}

function formatPrice(price: number | null) {
  if (price == null) {
    return "Price unavailable";
  }

  return `$${price.toFixed(2)}`;
}

export function StorefrontProductCard({
  product,
  isSaved,
  onToggleSaved,
  onQuickAdd,
}: StorefrontProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border-2 bg-white">
      <Link href={`/product/${product.variantId}`} className="relative block aspect-[4/5] overflow-hidden bg-stone-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.variantName}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            No image available
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              {product.categoryName || "Catalog"}
            </p>
            <div className="space-y-1">
              <Link href={`/product/${product.variantId}`} className="block">
                <h2 className="text-base font-semibold leading-6 text-stone-900">
                  {product.variantName}
                </h2>
              </Link>
              {product.variantName !== product.productName && (
                <p className="text-sm text-stone-500">{product.productName}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSaved(product.variantId)}
            className="rounded-none border-2 border-stone-300 p-2 text-stone-900 transition hover:border-stone-900"
            aria-label={isSaved ? "Remove from saved items" : "Save item"}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current text-red-500")} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-stone-600">
          {product.colorHex ? (
            <span
              className="h-3.5 w-3.5 border border-stone-300"
              style={{ backgroundColor: product.colorHex }}
              aria-hidden="true"
            />
          ) : null}
          <span>{product.colorName || "Variant color"}</span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-stone-600">
          {product.description || "Explore this item and view full sizing, images, and purchase details."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-stone-900">{formatPrice(product.price)}</p>
          <Button type="button" onClick={() => onQuickAdd(product)} className="gap-2 rounded-none border-2">
            <ShoppingBag className="h-4 w-4" />
            Quick add
          </Button>
        </div>
      </div>
    </article>
  );
}
