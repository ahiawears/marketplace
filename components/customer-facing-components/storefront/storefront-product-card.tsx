"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
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
            className="object-cover transition duration-300 group-hover:scale-[1.02] border-b-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            No image available
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 py-2 px-3">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/product/${product.variantId}`} className="block min-w-0 flex-1">
            <h2 className="line-clamp-2 text-base font-semibold leading-6 text-stone-900">
              {product.variantName}
            </h2>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSaved(product.variantId)}
              className="px-2 transition hover:border-stone-900"
              aria-label={isSaved ? "Remove from saved items" : "Save item"}
            >
              <Heart className={cn("h-5 w-5", isSaved && "fill-current text-red-500")} />
            </button>
            <button type="button" onClick={() => onQuickAdd(product)} className="gap-2">
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-md font-medium text-stone-900">{formatPrice(product.price)}</p>
        </div>
      </div>
    </article>
  );
}
