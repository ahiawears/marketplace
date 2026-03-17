"use client";

import Image from "next/image";
import { FC, Fragment, useMemo, useState } from "react";
import { Button } from "./button";
import { Eye, EyeOff, Pencil, ScanEye, Trash } from "lucide-react";
import { ProductTableType } from "@/lib/types";
import ProductVariantPreviewDialog, { ProductVariantPreviewSelection } from "@/components/ui/product-variant-preview-dialog";
import { Input } from "./input";
import { Select } from "./select";

interface ProductTableProps {
    products: ProductTableType[];
    onHideProduct: (productId: string, variantId: string) => void;
    onEditProduct: (productId: string, variantId: string) => void;
    onDeleteProduct: (productId: string, variantId: string) => void;
}

const ProductTable: FC<ProductTableProps> = ({
    products,
    onHideProduct,
    onEditProduct,
    onDeleteProduct,
}) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [previewSelection, setPreviewSelection] = useState<ProductVariantPreviewSelection>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);
    };

    const filteredProducts = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return products.filter((product) => {
            const matchesStatus =
                statusFilter === "all" ||
                product.variants.some((variant) => variant.status === statusFilter);

            if (!normalizedQuery) {
                return matchesStatus;
            }

            const productMatches =
                product.name.toLowerCase().includes(normalizedQuery) ||
                product.category_name.toLowerCase().includes(normalizedQuery) ||
                product.subCategory.toLowerCase().includes(normalizedQuery) ||
                product.season.toLowerCase().includes(normalizedQuery);

            const variantMatches = product.variants.some((variant) =>
                [
                    variant.name,
                    variant.sku,
                    variant.productCode,
                    variant.slug,
                    variant.colorSummary,
                    variant.sizeSummary,
                ]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedQuery))
            );

            return matchesStatus && (productMatches || variantMatches);
        });
    }, [products, searchQuery, statusFilter]);

    return (
        <>
            <div className="mb-4 grid gap-3 rounded-none border-2 bg-white p-4 md:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_220px_auto]">
                <div className="min-w-0">
                    <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search products, variants, SKU, product code, color, or size"
                        className="w-full"
                    />
                </div>

                <div className="min-w-0">
                    <Select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
                        className="w-full border-2"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active variants</option>
                        <option value="inactive">Inactive variants</option>
                    </Select>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm text-gray-500 xl:justify-end">
                    <span>
                        Showing {filteredProducts.length} of {products.length} products
                    </span>
                    {(searchQuery || statusFilter !== "all") && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            <div className="min-w-0 max-w-full overflow-x-auto border-2 bg-white">
                <table className="min-w-[980px] w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100 text-left ">
                            <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Product Name</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Category</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Sub-Category</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Season</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Variants</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <Fragment key={product.id}>
                                <tr className="hover:bg-gray-50" onClick={() => toggleRow(product.id)}>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.category_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.subCategory}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.season}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.variantCount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        Click row to manage variants
                                    </td>
                                </tr>

                                {expandedRows.has(product.id) && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={6} className="px-6 py-4 text-sm text-gray-600 border-y-2">
                                            <div className="space-y-4">
                                                <div>
                                                    <p><strong>Product ID:</strong> {product.id}</p>
                                                    {product.description && (
                                                        <p className="mt-2 max-w-4xl text-sm text-gray-600">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {product.variants.length > 0 ? (
                                                    <div className="overflow-x-auto rounded-md border bg-white">
                                                        <table className="min-w-full">
                                                            <thead className="bg-stone-50">
                                                                <tr className="text-left">
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Image</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Variant</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">SKU</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Code</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Price</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Colors</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Sizes</th>
                                                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {product.variants.map((variant) => (
                                                                    <tr key={variant.id} className="border-t align-top">
                                                                        <td className="px-4 py-3">
                                                                            <div className="relative h-14 w-14 overflow-hidden rounded-none border-2 bg-stone-100">
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
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="space-y-1">
                                                                                <p className="font-medium text-gray-900">{variant.name}</p>
                                                                                {variant.slug && (
                                                                                    <p className="text-xs text-gray-500">{variant.slug}</p>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3">{variant.sku || "—"}</td>
                                                                        <td className="px-4 py-3">{variant.productCode || "—"}</td>
                                                                        <td className="px-4 py-3">{variant.price != null ? variant.price.toLocaleString() : "—"}</td>
                                                                        <td className="px-4 py-3">
                                                                            <span
                                                                                className={`inline-flex rounded-none px-2.5 py-1 text-xs font-medium ${
                                                                                    variant.status === "active"
                                                                                        ? "bg-green-100 text-green-800 border-2 border-green-800"
                                                                                        : "bg-gray-200 text-gray-700 border-2 border-gray-800"
                                                                                }`}
                                                                            >
                                                                                {variant.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3">{variant.colorSummary || "—"}</td>
                                                                        <td className="px-4 py-3">{variant.sizeSummary || "—"}</td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="flex space-x-3 text-gray-500">
                                                                                <Button
                                                                                    type="button"
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        onHideProduct(product.id, variant.id);
                                                                                    }}
                                                                                    title={variant.status === "active" ? "Archive Variant" : "Reactivate Variant"}
                                                                                    className="bg-transparent hover:bg-gray-100"
                                                                                >
                                                                                    {variant.status === "active" ? (
                                                                                        <EyeOff className="w-5 h-5 hover:text-gray-700" color="#000000" />
                                                                                    ) : (
                                                                                        <Eye className="w-5 h-5 hover:text-gray-700" color="#000000" />
                                                                                    )}
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        onEditProduct(product.id, variant.id);
                                                                                    }}
                                                                                    title="Edit Product"
                                                                                    className="bg-transparent hover:bg-gray-100"
                                                                                >
                                                                                    <Pencil className="w-5 h-5 hover:text-gray-700" color="#000000" />
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        setPreviewSelection({ product, variantId: variant.id });
                                                                                    }}
                                                                                    title="Preview Variant"
                                                                                    className="bg-transparent hover:bg-gray-100"
                                                                                >
                                                                                    <ScanEye className="w-5 h-5 hover:text-gray-700" color="#000000" />
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        const confirmed = window.confirm(
                                                                                            "Delete this variant permanently? This only works when the variant has no order history."
                                                                                        );
                                                                                        if (!confirmed) {
                                                                                            return;
                                                                                        }
                                                                                        onDeleteProduct(product.id, variant.id);
                                                                                    }}
                                                                                    title="Delete Variant"
                                                                                    className="bg-transparent hover:bg-gray-100"
                                                                                >
                                                                                    <Trash className="w-5 h-5 hover:text-gray-700" color="#FF0000" />
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No variants saved for this product yet.</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}

                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No products match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ProductVariantPreviewDialog
                previewSelection={previewSelection}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewSelection(null);
                    }
                }}
            />
        </>
    );
};

export default ProductTable;
