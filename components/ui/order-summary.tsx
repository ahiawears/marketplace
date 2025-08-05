'use client';

import React, { useTransition } from 'react';
import { Button } from './button';


interface OrderSummaryProps {
    totalPrice: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalPrice }) => {  
    const [ checkoutPending, startCheckoutTransition ] = useTransition();
    const onCheckout = async() => {
        console.log("On checkout clicked")
    }
    return (
        <div className="p-6 bg-white border-2 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-4">
                <span>Sub Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Button
                onClick={onCheckout}
                className="w-full text-white font-semibold py-2 rounded my-5"
            >
                Checkout
            </Button>
        </div>
    );
};

export default OrderSummary;