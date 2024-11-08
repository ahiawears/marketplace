"use client"

import React, { useEffect, useState } from 'react';
import CartItem from '@/components/ui/cart-item';
import OrderSummary from '@/components/ui/order-summary';

interface CartItem {
    id: number;
    image: string;
    name: string;
    color: string;        
    size: string;
    quantity: number;
    price: number;
}


const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch cart items from the backend
        const fetchCartItems = async () => {
            try {    
                const response = await fetch('/api/cart');
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

    const handleDelete = (id: number) => {
        // Update state locally and call API to update backend if necessary
        setCartItems((items) => items.filter((item) => item.id !== id));
        // Add API call to delete item in backend here if needed
    };

    const handleQuantityChange = (id: number, quantity: number) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
        // Add API call to update quantity in backend here if needed
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

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
                                onDelete={handleDelete}
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
