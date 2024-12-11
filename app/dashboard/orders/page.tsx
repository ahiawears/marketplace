"use client";

import PageLoading from "@/components/pageLoading";
import OrderTable from "@/components/ui/order-list-table";
import { OrderTableType } from "@/lib/types";
import { useEffect, useState } from "react";

const OrdersPage = () => {

    const [orders, setOrders] = useState<OrderTableType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/brandGetOrdersList`);
                const data = await response.json();
                if (response.ok) {
                    setOrders(data.data);
                } else {
                    console.error("Failed to fetch product items:", data.error);
                }
            } catch (error) {
                console.error("Error fetching product items:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, []);

    if (loading) {
		return <PageLoading />; //add the page loading page
	}

    return (
        <div>
            <div className="hidden lg:block">
                <div className="p-4">   
                    <OrderTable orders={orders}/> 
                </div>
            </div>
            <div className="w-full py-10 lg:hidden">
                <OrderTable
					orders={orders}
				/>
            </div>
        </div>
    );
}

export default OrdersPage;