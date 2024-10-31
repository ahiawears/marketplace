// components/OrderSummary.tsx
import React from 'react';

interface OrderSummaryProps {
    totalPrice: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalPrice }) => {
    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-4">
                <span>Total Price</span>
                <span className="font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded">
                Checkout
            </button>
        </div>
    );
};

export default OrderSummary;
