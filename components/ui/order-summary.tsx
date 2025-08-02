// components/OrderSummary.tsx
import React from 'react';
import { Button } from './button';

interface OrderSummaryProps {
    totalPrice: number;
    onCheckOut: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalPrice, onCheckOut }) => {  

    return (
        <div className="p-6 bg-white border-2 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-4">
                <span>Total Price:</span>
                <span>${totalPrice}</span>
            </div>
            <Button
                onClick={onCheckOut}
                
                className="w-full text-white font-semibold py-2 rounded my-5"
            >
                Checkout
            </Button>
        </div>
    );
};

export default OrderSummary;
