"use client";

import React, { useEffect, useState } from "react";
import CartItem from "@/components/ui/cart-item";
import OrderSummary from "@/components/ui/order-summary";
import { deleteCartItem, updateCartItemQuantity } from "@/actions/updateCartItem";
import { Logo } from "@/components/ui/logo";
import { ShoppingCart } from "lucide-react";

interface CartItem {
    id: number;
    product_id: string;
    main_image_url: string;
    product_name: string;
    products_list: { name: string | null }[];
    sizes?: { size_name: string };
    color: string;
    size_name: string;
    size_id: string;
    quantity: number;
    price: number;
    cart_item_id: string;
    cumPrice: number;
    cart_id: string;
}

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCartItems = async () => {
        try {
            const response = await fetch("/api/cart");
            const data = await response.json();

            if (response.ok) {
                setCartItems(data.data); 
            } else {
                console.error("Failed to fetch cart items:", data.error);
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleQuantityChange = async (
        qty: number,
        mainCartId: string,
        cartItemId: string
    ) => {
        try {
            // Call server to update the quantity
            await updateCartItemQuantity(qty, mainCartId, cartItemId, 0);

            // Update cartItems locally
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.cart_item_id === cartItemId
                        ? { ...item, quantity: qty }
                        : item
                )
            );
        } catch (error) {
            console.error("Error updating quantity:", error);
        }

        fetchCartItems();
    };

    const handleDelete = (mainCartId: string, cartItemId: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                deleteCartItem(mainCartId, cartItemId);
                setCartItems((prevItems) =>
                    prevItems.filter((item) => item.cart_item_id !== cartItemId)
                );
            } catch (error) {
                console.error("Error deleting item:", error);
            }
            fetchCartItems();
        }
    };

    const totalPrice = cartItems.length > 0 ? cartItems[0].cumPrice : 0;

    if (loading) {
        return <div>Loading...</div>;
    }
   
    return (
        <div className="container mx-auto p-4 mt-16">
            {cartItems.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left column: Cart items */}
                    <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto">
                        {cartItems.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onDelete={() => handleDelete( item.cart_id, item.cart_item_id )}
                                onQuantityChange={handleQuantityChange}
                            />
                        ))}
                    </div>

                    {/* Right column: Order summary */}
                    <div className="w-full md:w-1/3">
                        <OrderSummary totalPrice={totalPrice}/>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <ShoppingCart 
                        className="mx-auto"
                        width={24}
                        height={24}
                    />
                    <p className="pt-7">Your cart is empty!</p>
                </div>
            )}
        </div>
    );
};

export default CartPage;
