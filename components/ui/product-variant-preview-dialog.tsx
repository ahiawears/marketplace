"use client";

import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";
import { ProductTableType } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export type ProductVariantPreviewSelection = {
    product: ProductTableType;
    variantId: string;
} | null;

interface ProductVariantPreviewDialogProps {
    previewSelection: ProductVariantPreviewSelection;
    onOpenChange: (open: boolean) => void;
}

const ProductVariantPreviewDialog: FC<ProductVariantPreviewDialogProps> = ({
    previewSelection,
    onOpenChange,
}) => {
    const variants = previewSelection?.product.variants || [];
    const initialVariant = variants.find((variant) => variant.id === previewSelection?.variantId) || variants[0] || null;
    const [activeVariantId, setActiveVariantId] = useState<string | null>(initialVariant?.id || null);
    const [selectedImage, setSelectedImage] = useState<string | null>(initialVariant?.mainImageUrl || initialVariant?.images[0] || null);

    useEffect(() => {
        const nextVariant = variants.find((variant) => variant.id === previewSelection?.variantId) || variants[0] || null;
        setActiveVariantId(nextVariant?.id || null);
        setSelectedImage(nextVariant?.mainImageUrl || nextVariant?.images[0] || null);
    }, [previewSelection, variants]);

    const activeVariant = useMemo(
        () => variants.find((variant) => variant.id === activeVariantId) || null,
        [activeVariantId, variants]
    );

    const measurementSizes = activeVariant ? Object.keys(activeVariant.measurements || {}) : [];

    return (
        <Dialog open={Boolean(previewSelection)} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
                {previewSelection && activeVariant && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{previewSelection.product.name}</DialogTitle>
                            <DialogDescription>
                                Customer-style preview for the selected variant.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-4">
                                <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-md border bg-stone-50 p-6">
                                    {selectedImage ? (
                                        <Image
                                            src={selectedImage}
                                            alt={activeVariant.name}
                                            fill
                                            className="object-contain p-4"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-400">No image available</div>
                                    )}
                                </div>

                                {activeVariant.images.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {activeVariant.images.map((image, index) => (
                                            <button
                                                key={`${image}-${index}`}
                                                type="button"
                                                className={`relative h-20 w-20 overflow-hidden rounded-md border bg-stone-50 ${
                                                    selectedImage === image ? "ring-2 ring-black" : ""
                                                }`}
                                                onClick={() => setSelectedImage(image)}
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${activeVariant.name} thumbnail ${index + 1}`}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {variants.length > 1 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-gray-900">Other Variants</p>
                                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            {variants.map((variant) => (
                                                <button
                                                    key={variant.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveVariantId(variant.id);
                                                        setSelectedImage(variant.mainImageUrl || variant.images[0] || null);
                                                    }}
                                                    className={`flex items-center gap-3 rounded-md border p-3 text-left transition ${
                                                        variant.id === activeVariant.id
                                                            ? "border-black bg-stone-100"
                                                            : "border-gray-200 hover:border-gray-400"
                                                    }`}
                                                >
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-stone-50">
                                                        {variant.mainImageUrl ? (
                                                            <Image
                                                                src={variant.mainImageUrl}
                                                                alt={variant.name}
                                                                fill
                                                                className="object-contain p-1"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                                                                No image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-gray-900">{variant.name}</p>
                                                        <p className="truncate text-xs text-gray-500">{variant.colorSummary || "No color info"}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-2xl font-semibold text-gray-900">{activeVariant.name}</p>
                                    <p className="mt-2 text-lg text-gray-700">
                                        {activeVariant.price != null ? activeVariant.price.toLocaleString() : "—"}
                                    </p>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><span className="font-semibold text-gray-900">SKU:</span> {activeVariant.sku || "—"}</p>
                                    <p><span className="font-semibold text-gray-900">Product Code:</span> {activeVariant.productCode || "—"}</p>
                                    <p><span className="font-semibold text-gray-900">Status:</span> {activeVariant.status}</p>
                                    <p><span className="font-semibold text-gray-900">Colors:</span> {activeVariant.colorSummary || "—"}</p>
                                    {activeVariant.availableDate && (
                                        <p><span className="font-semibold text-gray-900">Available Date:</span> {activeVariant.availableDate}</p>
                                    )}
                                </div>

                                {activeVariant.colorHexes.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-900">Color Chips</p>
                                        <div className="flex flex-wrap gap-2">
                                            {activeVariant.colorHexes.map((hex) => (
                                                <span
                                                    key={hex}
                                                    className="h-8 w-8 rounded-full border"
                                                    style={{ backgroundColor: hex }}
                                                    title={hex}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {previewSelection.product.description && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-900">Description</p>
                                        <p className="text-sm leading-6 text-gray-600">{previewSelection.product.description}</p>
                                    </div>
                                )}

                                {measurementSizes.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-gray-900">Size & Measurements</p>
                                        <div className="overflow-x-auto rounded-md border">
                                            <table className="min-w-full bg-white text-sm">
                                                <thead className="bg-stone-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Size</th>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {measurementSizes.map((size) => (
                                                        <tr key={size} className="border-t align-top">
                                                            <td className="px-4 py-3 font-medium text-gray-900">{size}</td>
                                                            <td className="px-4 py-3 text-gray-600">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {Object.entries(activeVariant.measurements[size] || {}).map(([key, value]) => (
                                                                        <span key={`${size}-${key}`} className="rounded-full border bg-stone-50 px-2.5 py-1 text-xs">
                                                                            {key}: {value}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ProductVariantPreviewDialog;
