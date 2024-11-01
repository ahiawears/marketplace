"use client"

import React, { useState } from 'react';
import CartItem from '@/components/ui/cart-item';
import OrderSummary from '@/components/ui/order-summary';

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      image: 'https://via.placeholder.com/150',
      name: 'Item 1',
      color: 'Red',
      size: 'M',
      quantity: 1,
      price: 29.99,
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/150',
      name: 'Item 2',
      color: 'Blue',
      size: 'L',
      quantity: 2,
      price: 49.99,
    },
  ]);

  const handleDelete = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="container mx-auto p-4 mt-16">
            <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Cart Items */}
            <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto">
                {cartItems.map((item) => (
                <CartItem
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    onQuantityChange={handleQuantityChange}
                />
                ))}
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
