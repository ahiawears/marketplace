"use client";

import PaymentForm from "@/components/place-order/user-payment-form";
import UserInfo from "@/components/place-order/user-shipping-details";
import Accordion from "@/components/ui/Accordion";
import Head from "next/head";
import React, { useEffect, useState } from "react";


const PlaceOrder = () => {

    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const accordionItems = [
        {
            title: "User Information",
            content: <UserInfo />
        },
        {
            title: "Shipping Address",
            content: "Hello Shipping"
        //   content: <ShippingAddresses addresses={addresses} />,
        },
        {
            title: "Payment Details",
            content: <PaymentForm />,
        },
    ];

    
    const getUserInfo = async () => {
        try {
            const response = await fetch("/api/getUserDetails");
            const data = await response.json();

            if (response.ok && data.data) {
                setFirstName(data.data.first_name || '');
				setLastName(data.data.last_name || '');
				setEmail(data.data.email || '');
            } else {
                console.error("Failed to fetch user details:", data.error);
                //take user to login page
            }
        } catch (error) {
            console.error("Some error occured:", error);
            //take user to login page
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        getUserInfo();
    }, [])

    if (loading) {
        return <div>Loading...</div>;
    }

  return (
    <>
        <div className="max-w-2xl mx-auto p-6">
            <Head>
                <meta name="robots" content="noindex" />
            </Head>
            <h1 className="text-3xl font-bold mb-6">Place Order</h1>
            <Accordion items={accordionItems} />
        </div>
    </>
    
  );
};

export default PlaceOrder;
