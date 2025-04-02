"use client";

import Image from "next/image";
import { FC } from "react";
import { FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa";
import { VscPreview } from "react-icons/vsc"
import { Button } from "./button";
import { EyeOff, Pencil, ScanEye, Trash } from "lucide-react";

interface Product {
    id: string;
    name: string;
    main_image_url: string;
    category_name: string;
    sku: string;
}

interface ProductTableProps {
    products: Product[];
    onHideProduct: (id: string) => void;
    onEditProduct: (id: string) => void;
    onDeleteProduct: (id: string) => void;
    onPreviewProduct: (id: string) => void;
}

const placeholderThumbnail = "https://placehold.co/600x400?text=Hello+World"; 

const ProductTable: FC<ProductTableProps> = ({ products, onHideProduct, onEditProduct, onDeleteProduct, onPreviewProduct }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-2 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100 text-left border-2">
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Product Name</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Category</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            {/* Product Name and Thumbnail */}
                            <td className="px-3 py-1 flex items-center space-x-4 border-b-2">
                                {product.main_image_url ? (
                                    <Image  
                                        src={product.main_image_url || placeholderThumbnail}
                                        alt={product.main_image_url ? `${product.name} thumbnail` : `No image for ${product.name}`}
                                        objectFit="cover"
                                        className="object-cover w-16 h-16 border-2"
                                        width={64}
                                        height={64}
                                    />
                                ) : (
                                    <p>No image available</p>
                                )}
                                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4 text-sm text-gray-600 border-2">{product.category_name}</td>

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
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
