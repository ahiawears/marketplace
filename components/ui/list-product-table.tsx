"use client";

import { FC } from "react";
import { FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa";

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
}

const placeholderThumbnail = "https://placehold.co/600x400?text=Hello+World"; 

const ProductTable: FC<ProductTableProps> = ({ products, onHideProduct, onEditProduct, onDeleteProduct }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100 text-left">
                    <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Product Name</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Category</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            {/* Product Name and Thumbnail */}
                            <td className="px-3 py-1 flex items-center space-x-4">
                                {product.main_image_url ? (
                                    <img
                                        src={product.main_image_url || placeholderThumbnail}
                                        alt={product.main_image_url ? `${product.name} thumbnail` : `No image for ${product.name}`}
                                        className="w-16 h-16 object-cover" 
                                    />
                                ) : (
                                    <p>No image available</p>
                                )}
                                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4 text-sm text-gray-600">{product.category_name}</td>

                            {/* Action Icons */} 
                            <td className="px-6 py-4">
                                <div className="flex space-x-4 text-gray-500">
                                    <button onClick={() => onHideProduct(product.id)} title="Hide Product">
                                        <FaEyeSlash className="w-5 h-5 hover:text-gray-700" />
                                    </button>
                                    <button onClick={() => onEditProduct(product.id)} title="Edit Product">
                                        <FaEdit className="w-5 h-5 hover:text-gray-700" />
                                    </button>
                                    <button onClick={() => onDeleteProduct(product.id)} title="Delete Product">
                                        <FaTrash className="w-5 h-5 hover:text-gray-700" />
                                    </button>
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
