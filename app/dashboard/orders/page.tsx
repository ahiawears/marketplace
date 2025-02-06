"use client";

import NavTab from "@/components/navtab";
import OrderTable from "@/components/ui/order-list-table";
import { OrderType } from "@/lib/types";
import { useState } from "react";

const OrdersPage = () => {

    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchOrder = async () => {
    //         try {
    //             const response = await fetch(`/api/brandGetOrdersList`);
    //             const data = await response.json();
    //             if (response.ok) {
    //                 setOrders(data.data);
    //             } else {
    //                 console.error("Failed to fetch product items:", data.error);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching product items:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     fetchOrder();
    // }, []);

    // if (loading) {
	// 	return <PageLoading />; //add the page loading page
	// }    
    
    //const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
    const allOrders: OrderType[] = [
        {
            id: "12345",
            date: "2023-10-01",
            status: "New",
            total: 150.0,
            customer: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    shippingAddress: "123 Main St, Springfield, IL, 62701",
                },
            products: [
                {
                    name: "Streetwear Hoodie",
                    image: "/images/hoodie.jpg",
                    quantity: 1,
                    price: 100.0,
                },
                {
                    name: "Sneakers",
                    image: "/images/sneakers.jpg",
                    quantity: 1,
                    price: 50.0,
                },
            ],
                shipping: {
                    method: "Standard",
                    trackingNumber: undefined,
                    estimatedDelivery: "2023-10-10",
                },
        },
        {
            id: "53865",
            date: "2023-25-11",
            status: "Shipped",
            total: 150.0,
            customer: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    shippingAddress: "123 Main St, Springfield, IL, 62701",
                },
            products: [
                {
                    name: "Streetwear Hoodie",
                    image: "/images/hoodie.jpg",
                    quantity: 1,
                    price: 100.0,
                },
                {
                    name: "Sneakers",
                    image: "/images/sneakers.jpg",
                    quantity: 1,
                    price: 50.0,
                },
            ],
                shipping: {
                    method: "Standard",
                    trackingNumber: undefined,
                    estimatedDelivery: "2023-10-10",
                },
        },
        {
            id: "576849",
            date: "2023-10-01",
            status: "Shipped",
            total: 150.0,
            customer: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    shippingAddress: "123 Main St, Springfield, IL, 62701",
                },
            products: [
                {
                    name: "Streetwear Hoodie",
                    image: "/images/hoodie.jpg",
                    quantity: 1,
                    price: 100.0,
                },
                {
                    name: "Sneakers",
                    image: "/images/sneakers.jpg",
                    quantity: 1,
                    price: 50.0,
                },
            ],
                shipping: {
                    method: "Standard",
                    trackingNumber: undefined,
                    estimatedDelivery: "2023-10-10",
                },
        },
        {
            id: "969704",
            date: "2023-10-01",
            status: "Delivered",
            total: 150.0,
            customer: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    shippingAddress: "123 Main St, Springfield, IL, 62701",
                },
            products: [
                {
                    name: "Streetwear Hoodie",
                    image: "/images/hoodie.jpg",
                    quantity: 1,
                    price: 100.0,
                },
                {
                    name: "Sneakers",
                    image: "/images/sneakers.jpg",
                    quantity: 1,
                    price: 50.0,
                },
            ],
                shipping: {
                    method: "Standard",
                    trackingNumber: undefined,
                    estimatedDelivery: "2023-10-10",
                },
        },
        {
            id: "112322",
            date: "2023-10-01",
            status: "Delivered",
            total: 150.0,
            customer: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    shippingAddress: "123 Main St, Springfield, IL, 62701",
                },
            products: [
                {
                    name: "Streetwear Hoodie",
                    image: "/images/hoodie.jpg",
                    quantity: 1,
                    price: 100.0,
                },
                {
                    name: "Sneakers",
                    image: "/images/sneakers.jpg",
                    quantity: 1,
                    price: 50.0,
                },
            ],
                shipping: {
                    method: "Standard",
                    trackingNumber: undefined,
                    estimatedDelivery: "2023-10-10",
                },
        },
        {
            id: "23554",
            date: "2023-10-01",
            status: "Cancelled",
            total: 150.0,
            customer: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    shippingAddress: "123 Main St, Springfield, IL, 62701",
                },
            products: [
                {
                    name: "Streetwear Hoodie",
                    image: "/images/hoodie.jpg",
                    quantity: 1,
                    price: 100.0,
                },
                {
                    name: "Sneakers",
                    image: "/images/sneakers.jpg",
                    quantity: 1,
                    price: 50.0,
                },
            ],
                shipping: {
                    method: "Standard",
                    trackingNumber: undefined,
                    estimatedDelivery: "2023-10-10",
                },
        },
        {
            id: "059376",
            date: "2023-10-01",
            status: "Shipped",
            total: 150.0,
            customer: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    shippingAddress: "123 Main St, Springfield, IL, 62701",
                },
            products: [
                {
                    name: "Streetwear Hoodie",
                    image: "/images/hoodie.jpg",
                    quantity: 1,
                    price: 100.0,
                },
                {
                    name: "Sneakers",
                    image: "/images/sneakers.jpg",
                    quantity: 1,
                    price: 50.0,
                },
            ],
                shipping: {
                    method: "Standard",
                    trackingNumber: undefined,
                    estimatedDelivery: "2023-10-10",
                },
        },
    ];

    const [selectedTab, setSelectedTab] = useState('All');
    const [filteredOrders, setFilteredOrders] = useState<OrderType[]>(allOrders);

    const tabs = [
        { label: 'All', value: 'All' },
        { label: 'New', value: 'New' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Cancelled', value: 'Cancelled' },
    ];

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
        if (value === 'All') {
            setFilteredOrders(allOrders);
        } else {
        const filtered = allOrders.filter((order) => order.status === value);
            setFilteredOrders(filtered);
        }
    };

    return (

        <div className="container mx-auto p-4">
            <NavTab tabs={tabs} onTabChange={handleTabChange} initialTab="All"/>

            <div className="mt-4">
                <OrderTable orders={filteredOrders} />
            </div>
        </div>
    );
}

export default OrdersPage;