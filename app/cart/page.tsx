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
    products_list: { name: string | null } | { name: any }[];
    sizes?: { size_name: string };
    color: string;
    size_name: string;
    size_id: string;
    quantity: number;
    price: number;
    cart_item_id: string;
    cumPrice: number; // cumPrice is now a number
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
                    setCartItems(data.data); // Assuming data.data holds the array of cart items
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

    // Compute totalPrice as cumPrice value which type is numberic
    const totalPrice = cartItems.length > 0 ? cartItems[0].cumPrice : 0;
    console.log(totalPrice);

    const handleDelete = (id: string) => {
        console.log("Delete clicked for item ID:", id);
        deleteCartItem(id);
        //setCartItems((items) => items.filter((item) => item.id !== id));
        // Add API call to delete item in backend here if needed
        //get the item clicked id
    };

    const handleQuantityChange = (
        id: number,
        quantity: number,
        cart_item_id: string
    ) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
        try {
            updateCartItemQuantity(quantity, cart_item_id);
        } catch (error) {
            console.log("Error from the page is:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4 mt-16">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column: Cart Items */}
                <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto">
                    {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onDelete={() => handleDelete(item.cart_item_id)}
                                onQuantityChange={handleQuantityChange}
                            />
                        ))
                    ) : (
                        <div>Your cart is empty</div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="w-full md:w-1/3">
                
                    <OrderSummary totalPrice={totalPrice} />
                </div>
            </div>
        </div>
    );
};

export default CartPage;
