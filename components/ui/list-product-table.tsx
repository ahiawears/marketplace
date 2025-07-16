"use client";

import Image from "next/image";
import { FC, Fragment, useState } from "react";
import { FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa";
import { VscPreview } from "react-icons/vsc"
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
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-2 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100 text-left border-2">
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Product Name</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Category</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Sub-Category</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Season</th>
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
                                <td className="px-6 py-4 text-sm text-gray-600 border-2">
                                    {product.name}
                                </td>

                                {/* Category */}
                                <td className="px-6 py-4 text-sm text-gray-600 border-2">
                                    {product.category_name}
                                </td>

                                {/* SubCategory */}
                                <td className="px-6 py-4 text-sm text-gray-600 border-2">
                                    {product.subCategory}
                                </td>

                                {/* Season */}
                                <td className="px-6 py-4 text-sm text-gray-600 border-2">
                                    {product.season}
                                </td>
                                {/* Action Icons */} 
                                <td className="px-2 py-4 border-2">
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
                                    <td colSpan={5} className="px-6 py-4 text-sm text-gray-600 border-2">
                                        {/* product variants  can go here */}
                                        <div>
                                            <p><strong>Product ID:</strong> {product.id}</p>
                                            {/* Add more details as needed */}
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
