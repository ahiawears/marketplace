"use client";

import { FC } from "react";

interface OrderData {
    order_id: string;
    customer_id: string;
    status: string;
}

interface OrderTableProps {
    orders: OrderData[];
}

const OrderTable: FC<OrderTableProps> = ({ orders }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Order ID</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Customer ID</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.order_id} className="hover:bg-gray-50">

                            <td className="px-3 py-1 flex items-center space-x-4">
                                {/* {order.} */}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default OrderTable;