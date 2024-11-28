import { FC } from "react";

interface OrderData {
    order_id: string;
    customer_name: string;
    status: string;
}

interface OrderTableProps {
    products: OrderData;
}

const OrderTable: FC<OrderTableProps> = ({ products }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Order ID</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Customer</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700 border-b">Status</th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </div>
    )
}

export default OrderTable;