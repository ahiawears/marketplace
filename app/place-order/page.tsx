import { getCartItems } from "@/actions/user-actions/userCartActions/getCartItems";
import PaymentForm from "@/components/place-order/user-payment-form";
import UserInfo from "@/components/place-order/user-shipping-details";
import Accordion from "@/components/ui/Accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/supabase/server";
import { Terminal } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CartItemData {
    id: string;
    product_id: {
        id: string;
        name: string;
    }; 
    product_name: string;
    main_image_url: string;
    variant_color: {
        name: string;
        hex: string;
    };
    size_id: {
        name: string;
    };
    quantity: number;
    price: number;
}

// Export the metadata object
export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default async function PlaceOrder ({ searchParams } : { searchParams?: { [key: string]: string | string[] | undefined }}) {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // Check for a logged-in user; redirect if not found
    if (userError || !userData) {
        // If there's no user, you could redirect to login or handle it differently.
        // For now, let's assume if there's no user, something is wrong.
        console.log("The userError from place-order is: ", userError);
        return notFound();
    }

    const message = searchParams?.message as string | undefined; 

    console.log("The message is ", message);
    const cartItems = await getCartItems(false, userData.user.id);
    console.log("The cart items are ", cartItems);

    if (!cartItems) {
        //handle if the user has no cart items saved
        console.log("No cart items found for user: ", cartItems)
        return notFound();
    }

    const item = cartItems.productsWithImages as CartItemData[];
    const serverTotal = cartItems.totalPrice as number;
    const calculatedTotalPrice = item.reduce((sum, it) => sum + it.price * it.quantity, 0)
    console.log('The server total is ', serverTotal, ' and the calculatedTotalPrice is ', calculatedTotalPrice);

  return (
    <div className="container mx-auto p-6">
            {message && (
                <Alert className="mb-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Confirm Your Email!</AlertTitle>
                    <AlertDescription>
                        {message}
                    </AlertDescription>
                </Alert>
            )}

    </div>
    
  );
};
