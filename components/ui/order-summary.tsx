// components/OrderSummary.tsx
import React from 'react';

interface OrderSummaryProps {
    totalPrice: number;
    onCheckOut: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalPrice, onCheckOut }) => {  

    return (
        <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-4">
                <span>Total Price:</span>
                <span>${totalPrice}</span>
            </div>
            <button
                onClick={onCheckOut}
                
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded my-5"
            >
                Checkout
            </button>
        </div>
    );
};

export default OrderSummary;
