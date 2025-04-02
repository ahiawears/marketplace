"use client";

import { FC, useState } from "react";
import { OrderDetailsModal } from "../brand-dashboard/order-details-modal";
import { OrderType } from "@/lib/types";


interface OrderTableProps {
    orders: OrderType[];
}

const OrderTable: FC<OrderTableProps> = ({ orders }) => {
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

    
    const handleMarkAsShipped = (orderId: string) => {
        console.log(`Order ${orderId} marked as shipped`);
        // Update order status in the backend
        setSelectedOrder(null); 
    };
    
    const handleCancelOrder = (orderId: string) => {
        console.log(`Order ${orderId} cancelled`);
        // Update order status in the backend
        setSelectedOrder(null); 
    };
    return (
        <div>
            <div className="mx-auto py-10 sm:py-10 shadow-2xl border-2">
                <div className="mx-auto max-7xl px-6 lg:px-8">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-6">
                            Orders
                        </h1>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-2">
                                    <th className="p-2 text-left">Order ID</th>
                                    <th className="p-2 text-left">Date</th>
                                    <th className="p-2 text-left">Status</th>
                                    <th className="p-2 text-left">Total</th>
                                    <th className="p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-2">
                                        <td className="p-2">{order.id}</td>
                                        <td className="p-2">{order.date}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded ${order.status === "Shipped" ? "bg-green-100 text-green-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {order.status}
                                            </span>
                                        </td>
                                        <td className="p-2">${order.total.toFixed(2)}</td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))} 
                            </tbody>
                        </table> 

                        {/* Order Details Modal */}
                        {selectedOrder && (
                            <OrderDetailsModal
                                order={selectedOrder}
                                onClose={() => setSelectedOrder(null)}
                                onMarkAsShipped={() => handleMarkAsShipped(selectedOrder.id)}
                                onCancelOrder={() => handleCancelOrder(selectedOrder.id)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderTable;