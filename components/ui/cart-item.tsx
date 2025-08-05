'use client';

import React, { useState, useTransition } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { Select } from "./select";
import { Button } from "./button";
import Image from "next/image";
import LoadContent from '@/app/load-content/page';
import { deleteCartItem, updateCartItemQuantity } from "@/actions/user-actions/userCartActions/updateCartItem";
import { checkVariantStock } from "@/actions/user-actions/userCartActions/checkVariantStock";

interface CartItemData {
    id: string;
    product_id: {
        id: string;
        name: string;
    }; 
    product_name: string;
    main_image_url: string;
    variant_color: {
        name: string;
        hex: string;
    };
    size_id: {
        name: string;
    };
    quantity: number;
    price: number;
}

interface CartItemProps {
    item: CartItemData;
    serverUserIdentifier: string;
    isAnonymous: boolean;
}

const CartItem: React.FC<CartItemProps> = ({ item, serverUserIdentifier, isAnonymous }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ isDeletePending, startDeleteTransition ] = useTransition();
    const [ isQuantityPending, startQuantityTransition ] = useTransition();

    const handleQuantityChange = async (qty: number) => {

        if (!qty) {
            return;
        }
        startQuantityTransition(async () => {
            try {
                const stockCheck = await checkVariantStock(item.product_id.id, item.size_id.name, qty);
                if (!stockCheck.success) {
                    console.error("Failed to check variant stock:", stockCheck.error);
                }
                const updateResult = await updateCartItemQuantity(qty, item.id, serverUserIdentifier, isAnonymous);
                if (!updateResult.success) {
                    console.error("Failed to update cart item quantity:", updateResult.error);
                }
            } catch (error) {
                console.error("Unexpected error in handleQuantityChange:", error);
            }
        })
    };

    const handleItemDelete = async (id: string) => {
        if (!id) {
            return;
        }
        console.log("handle item delete clicked");
        startDeleteTransition(async () => {
            try {
                const deleteItem = await deleteCartItem(id, serverUserIdentifier, isAnonymous);
                if (!deleteItem.success) {
                    console.error("Failed to save product:", deleteItem.error);
                }

            } catch (error) {
                console.error("Unexpected error in saveProduct:", error);
                // setIsSaved(initialIsSaved);
            }
        })
    }

    return (
        <div 
            className="flex flex-col sm:flex-row gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Product Image */}
            <div className="relative w-full sm:w-24 h-32 flex-shrink-0">
                <Image 
                    src={item.main_image_url} 
                    alt={item.product_name} 
                    fill
                    priority
                    unoptimized={true}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain border-2" 
                />
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <h3 className="font-medium text-lg cursor-pointer">{item.product_name}</h3>
                    
                    {/* Color with swatch */}
                    <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600 mr-2">Color:</span>
                        <div 
                            className="w-5 h-5 border-2 mr-2"
                            style={{ backgroundColor: item.variant_color.hex }}
                            title={item.variant_color.name}
                        />
                        <span className="text-sm">{item.variant_color.name}</span>
                    </div>
                    
                    {/* Size */}
                    <div className="mt-1">
                        <span className="text-sm text-gray-600 mr-2">Size:</span>
                        <span className="text-sm">{item.size_id.name}</span>
                    </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                    <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">
                        Qty:
                    </label>
                    <Select
                        id={`quantity-${item.id}`}
                        disabled={isUpdating}
                        value={item.quantity} // <-- CORRECTED: Use the prop's value
                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                        className="border-2 px-2 py-1 w-16 text-center"
                    >
                        {[1, 2, 3, 4, 5].map((qty) => (
                            <option key={qty} value={qty}>
                                {qty}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Price and Delete */}
                <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                    <button 
                        onClick={() => handleItemDelete(item.id)} 
                        className={`text-gray-500 hover:text-black hover:shadow-lg transition-colors ${isHovering ? 'opacity-150' : 'opacity-0 sm:opacity-100'} bg-transparent`}
                        aria-label="Remove item"
                    >
                        <AiOutlineDelete size={20} className="outline-2" />
                    </button>
                </div>
            </div>
            {isUpdating && <span className="text-sm text-gray-500">Updating...</span>}
            {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
    );
};

export default CartItem;