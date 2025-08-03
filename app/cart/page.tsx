'use client';

import React, { useEffect, useState } from "react";
import CartItem from "@/components/ui/cart-item";
import OrderSummary from "@/components/ui/order-summary";
import { deleteCartItem, updateCartItemQuantity } from "@/actions/user-actions/userCartActions/updateCartItem";
import { Logo } from "@/components/ui/logo";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import CartListsSvg from "@/components/svg/cart-list-svg";
import { Button } from "@/components/ui/button";
import { useGetCartItems } from "@/hooks/useGetCartItems";
import LoadContent from "../load-content/page";
import { useAuth } from '@/hooks/useAuth';
import { getClientAnonymousId } from "@/lib/anon_user/client";


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
interface CartData {
    productsWithImages: CartItemData[];
    totalPrice: number;
}

const CartPage = () => {
    const { userId } = useAuth();
    const { cartLoading, cartError, cartItems } = useGetCartItems();
    const router = useRouter();
    const [cartItem, setCartItem] = useState<CartItemData[]>([]);

    // --- CORRECTED: Use a state variable for totalPrice, but initialize it to 0 ---
    const [totalPrice, setTotalPrice] = useState(0); 
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Use a useEffect to set the initial data from the hook
    useEffect(() => {
        if (!cartLoading && cartItems) {
            setCartItem(cartItems.productsWithImages);
            setTotalPrice(cartItems.totalPrice);
        }
    }, [cartLoading, cartItems]);

    const handleQuantityChange = async (
        qty: number,
        cartItemId: string,
        variantId: string,
        size: string
    ) => {
        setLoading(true);
        setError(null);
        try {
             // Optimistically update the UI first
            setCartItem(prevItems =>
                prevItems.map(item =>
                    item.id === cartItemId ? { ...item, quantity: qty } : item
                )
            );
            console.log("The quantity is: ", qty, " and the itemId is: ", cartItemId, "  and the varint id is: ", variantId);
            const userIdentifier = userId || getClientAnonymousId();
            const isAnonymous = !userId;

            console.log("isAnonymous? ", isAnonymous, " userIdentifier", userIdentifier);

            const response = await fetch(`/api/updateCart?updateType=quantityChange&${userId ? `userType=user&Id=${userIdentifier}` : `userType=anonymous&Id=${userIdentifier}`}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quantity: qty,
                    id: cartItemId,
                    variantId: variantId,
                    size: size
                })
            })

            const result = await response.json();

            if(!response.ok) {
                throw new Error(result.error instanceof Error ? result.error.message : "Failed to update item quantity");
            }

            if (result.success) {
                setTotalPrice(result.data.newTotal);
            }

        } catch (error) {
            console.error("Error updating quantity:", error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }

        //fetchCartItems();
    };

    if ( cartLoading || loading) {
        return <LoadContent />
    }

    if (cartError) {
        console.log("Cart error is ", cartError);
    }

    const handleCheckout = async () => {
        //router.push('/place-order')
        console.log("Checkout clicked!!!");
    }

    // const handleDelete = (mainCartId: string, cartItemId: string) => {
    //     if (confirm("Are you sure you want to delete this item?")) {
    //         try {
    //             deleteCartItem(mainCartId, cartItemId);
    //             setCartItems((prevItems) =>
    //                 prevItems.filter((item) => item.cart_item_id !== cartItemId)
    //             );
    //         } catch (error) {
    //             console.error("Error deleting item:", error);
    //         }
    //         fetchCartItems();
    //     }
    // };
   
    return (
        <div className="container mx-auto">
            <div className="flex border-2 p-4 w-full my-4">
                <div className="flex items-center justify-center gap-2 mx-auto">
                    <ShoppingCart size={24} className="text-gray-600" />
                    <h2 className="text-2xl font-normal">Your Shopping Cart</h2>
                </div>
            </div>
            {cartItem && cartItem.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto border-2">
                        {cartItem.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onDelete={() => console.log("Delete clicked")}
                                onQuantityChange={handleQuantityChange}
                                // onDelete={() => handleDelete(item.cart_id, item.id)}
                            />
                        ))}
                    </div>
                    <div className="w-full md:w-1/3">
                        <OrderSummary 
                            totalPrice={totalPrice}
                            onCheckOut={() => handleCheckout()}
                        />
                    </div>
                </div>
            ) : (
                <div className="mx-auto max-w-2xl lg:max-w-7xl w-full">
                    <div className="w-full p-8 text-center transform transition-all relative"> 
                        <div className="mx-auto">
                            <CartListsSvg className="w-64 h-64 mx-auto" width={256} height={256}/>
                            <p className="font-bold my-4">You have no items in your cart</p>

                            <div className="flex w-full flex-col md:flex-row mx-auto">
                                <div className="mx-auto">
                                    <Button>
                                        Go to favorited items
                                    </Button>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            )}  
        </div>
    );
};

export default CartPage;