"use client";

import Image from "next/image";
import { FC, Fragment, useState } from "react";
import { Button } from "./button";
import { EyeOff, Pencil, ScanEye, Trash } from "lucide-react";
import { ProductTableType } from "@/lib/types";


interface ProductTableProps {
    products: ProductTableType[];
    onHideProduct: (id: string) => void;
    onEditProduct: (id: string) => void;
    onDeleteProduct: (id: string) => void;
    onPreviewProduct: (id: string) => void;
}

const ProductTable: FC<ProductTableProps> = ({ products, onHideProduct, onEditProduct, onDeleteProduct, onPreviewProduct }) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        console.log(`Toggling row with id: ${id}`);
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);
    };
    return (
        <div className="overflow-x-auto border-2">
            <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100 text-left ">
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Product Name</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Category</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Sub-Category</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Season</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Variants</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <Fragment key={product.id}>
                            <tr 
                                className="hover:bg-gray-50"
                                onClick={() => toggleRow(product.id)}
                            >
                                {/* Product Name */}
                                <td className="px-6 py-4 text-sm text-gray-600 ">
                                    {product.name}
                                </td>

                                {/* Category */}
                                <td className="px-6 py-4 text-sm text-gray-600 ">
                                    {product.category_name}
                                </td>

                                {/* SubCategory */}
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {product.subCategory}
                                </td>

                                {/* Season */}
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {product.season}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {product.variantCount}
                                </td>
                                {/* Action Icons */} 
                                <td className="px-2 py-4">
                                    <div className="flex space-x-4 text-gray-500">
                                        <Button onClick={() => onHideProduct(product.id)} title="Hide Product" className="bg-transparent hover:bg-gray-100">
                                            <EyeOff className="w-5 h-5 hover:text-gray-700" color="#000000"/>
                                        </Button>
                                        <Button onClick={() => onEditProduct(product.id)} title="Edit Product" className="bg-transparent hover:bg-gray-100">
                                            <Pencil className="w-5 h-5 hover:text-gray-700" color="#000000"/>
                                        </Button>
                                        <Button onClick={() => onPreviewProduct(product.id)} title="Preview Product" className="bg-transparent hover:bg-gray-100">
                                            <ScanEye className="w-5 h-5 hover:text-gray-700" color="#000000"/>
                                        </Button>
                                        <Button onClick={() => onDeleteProduct(product.id)} title="Delete Product" className="bg-transparent hover:bg-gray-100">
                                            <Trash className="w-5 h-5 hover:text-gray-700" color="#FF0000"/>
                                        </Button>
                                    </div>
                                </td>
                            </tr>

                            {expandedRows.has(product.id) && (
                                <tr className="bg-gray-50">
                                    <td colSpan={6} className="px-6 py-4 text-sm text-gray-600 border-y-2">
                                        <div className="space-y-4">
                                            <div>
                                                <p><strong>Product ID:</strong> {product.id}</p>
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
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {product.variants.map((variant) => (
                                                                <tr key={variant.id} className="border-t align-top">
                                                                    <td className="px-4 py-3">
                                                                        <div className="relative h-14 w-14 overflow-hidden rounded-md border bg-stone-100">
                                                                            {variant.mainImageUrl ? (
                                                                                <Image
                                                                                    src={variant.mainImageUrl}
                                                                                    alt={variant.name}
                                                                                    fill
                                                                                    className="object-cover"
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
                                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                                variant.status === "active"
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : "bg-gray-200 text-gray-700"
                                                                            }`}
                                                                        >
                                                                            {variant.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3">{variant.colorSummary || "—"}</td>
                                                                    <td className="px-4 py-3">{variant.sizeSummary || "—"}</td>
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
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
