"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SizeSelect from "@/components/ui/size-select";
import { checkVariantStock } from "@/actions/user-actions/userCartActions/checkVariantStock";
import { upsertCart } from "@/actions/user-actions/userCartActions/upsertCart";
import { strictSerialize } from "@/lib/serialization";
import { StorefrontProductCardData } from "@/components/customer-facing-components/storefront/types";

interface SizeOption {
  size_id: string;
  quantity: number;
  name: string;
}

interface StorefrontQuickAddDialogProps {
  product: StorefrontProductCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverUserIdentifier: string;
  isAnonymous: boolean;
}

export function StorefrontQuickAddDialog({
  product,
  open,
  onOpenChange,
  serverUserIdentifier,
  isAnonymous,
}: StorefrontQuickAddDialogProps) {
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !product) {
      setSizes([]);
      setSelectedSize(null);
      setSizeError(null);
      return;
    }

    let cancelled = false;

    const fetchSizes = async () => {
      setIsLoadingSizes(true);
      setSizeError(null);

      try {
        const response = await fetch(`/api/getProductSizes/${product.variantId}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load sizes.");
        }

        if (!cancelled) {
          setSizes(result.data?.sizes || []);
        }
      } catch (error) {
        if (!cancelled) {
          setSizeError(error instanceof Error ? error.message : "Failed to load sizes.");
          setSizes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSizes(false);
        }
      }
    };

    fetchSizes();

    return () => {
      cancelled = true;
    };
  }, [open, product]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      toast.error("Select a size before adding to cart.");
      return;
    }

    startTransition(async () => {
      try {
        const verifiedInput = strictSerialize({
          variantId: product.variantId,
          size: selectedSize.name,
          quantity: 1,
        });

        const stockResult = await checkVariantStock(
          verifiedInput.variantId,
          verifiedInput.size,
          verifiedInput.quantity
        );

        const verifiedStock = strictSerialize(stockResult);
        if (!verifiedStock.success || !verifiedStock.sizeId) {
          throw new Error(verifiedStock.error || "Unable to verify stock.");
        }

        const cartPayload = strictSerialize({
          variantId: product.variantId,
          sizeId: verifiedStock.sizeId,
          quantity: 1,
          isAnonymous,
          userId: serverUserIdentifier,
        });

        const cartResult = await upsertCart(cartPayload);
        const verifiedCart = strictSerialize(cartResult);

        if (!verifiedCart.success) {
          throw new Error(verifiedCart.error || "Failed to add item to cart.");
        }

        toast.success(`${product.variantName} added to cart.`);
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add item to cart.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {product ? (
          <>
            <DialogHeader>
              <DialogTitle>{product.variantName}</DialogTitle>
              <DialogDescription>
                Choose a size to add this variant straight to the cart without leaving the product grid.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden border-2 bg-stone-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.variantName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-stone-500">
                      No image available
                    </div>
                  )}
                </div>

                {product.gallery.length > 1 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {product.gallery.slice(0, 4).map((imageUrl) => (
                      <div key={imageUrl} className="relative aspect-square overflow-hidden border-2 bg-stone-100">
                        <Image
                          src={imageUrl}
                          alt={product.variantName}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
                    <span className="border-2 border-stone-300 px-2 py-1">
                      {product.categoryName || "Catalog"}
                    </span>
                    {product.colorName ? (
                      <span className="flex items-center gap-2 border-2 border-stone-300 px-2 py-1">
                        {product.colorHex ? (
                          <span
                            className="h-3.5 w-3.5 border border-stone-300"
                            style={{ backgroundColor: product.colorHex }}
                          />
                        ) : null}
                        {product.colorName}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-2xl font-semibold text-stone-900">
                    {product.displayPriceFormatted}
                  </p>
                  <p className="text-sm leading-6 text-stone-600">
                    {product.description || "Open the product page for more details, measurements, and related variants."}
                  </p>
                </div>

                <div className="space-y-3">
                  {isLoadingSizes ? <p className="text-sm text-stone-500">Loading sizes...</p> : null}
                  {sizeError ? <p className="text-sm text-red-600">{sizeError}</p> : null}
                  {!isLoadingSizes && !sizeError && sizes.length > 0 ? (
                    <SizeSelect sizes={sizes} onSelectSize={setSelectedSize} />
                  ) : null}
                  {!isLoadingSizes && !sizeError && sizes.length === 0 ? (
                    <p className="text-sm text-stone-500">No purchasable sizes are available for this variant right now.</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isPending || !selectedSize}
                    className="rounded-none border-2"
                  >
                    {isPending ? "Adding..." : "Add to cart"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
