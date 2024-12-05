"use client";

import React, { useEffect, useState } from "react";
import CartItem from "@/components/ui/cart-item";
import OrderSummary from "@/components/ui/order-summary";
import { deleteCartItem, updateCartItemQuantity } from "@/actions/updateCartItem";

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
}

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchCartItems();
    }, []);

    const totalPrice = cartItems.length > 0 ? cartItems[0].cumPrice : 0;

    const handleDelete = (id: number, cart_item_id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            deleteCartItem(cart_item_id);
            setCartItems((items) => items.filter((item) => item.id !== id));
        }
    };

    const handleQuantityChange = (id: number, quantity: number, cart_item_id: string) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
        try {
            updateCartItemQuantity(quantity, cart_item_id);
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

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
                                onDelete={() => handleDelete(item.id, item.cart_item_id)}
                                onQuantityChange={(quantity) =>
                                    handleQuantityChange(item.id, quantity, item.cart_item_id)
                                }
                            />
                        ))}
                    </div>

                    {/* Right column: Order summary */}
                    <div className="w-full md:w-1/3">
                        <OrderSummary totalPrice={totalPrice} />
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <p>Your cart is empty!</p>
                </div>
            )}
        </div>
    );
};

export default CartPage;
