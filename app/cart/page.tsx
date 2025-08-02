'use client';

import React, { useEffect, useState } from "react";
import CartItem from "@/components/ui/cart-item";
import OrderSummary from "@/components/ui/order-summary";
import { deleteCartItem, updateCartItemQuantity } from "@/actions/updateCartItem";
import { Logo } from "@/components/ui/logo";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import CartListsSvg from "@/components/svg/cart-list-svg";
import { Button } from "@/components/ui/button";
import { useGetCartItems } from "@/hooks/useGetCartItems";
import LoadContent from "../load-content/page";

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
    const { cartLoading, cartError, cartItems } = useGetCartItems();
    const router = useRouter();
    const cartData = cartItems?.productsWithImages;
    const totalPrice = cartItems?.totalPrice || 0;
    if ( cartLoading ) {
        return <LoadContent />
    }

    if (cartError) {
        console.log("Cart error is ", cartError);
    }
    
    

    
    // const handleQuantityChange = async (
    //     qty: number,
    //     mainCartId: string,
    //     cartItemId: string
    // ) => {
    //     try {
    //         // Call server to update the quantity
    //         await updateCartItemQuantity(qty, mainCartId, cartItemId, 0);

    //         // Update cartItems locally
    //         setCartItems((prevItems) =>
    //             prevItems.map((item) =>
    //                 item.cart_item_id === cartItemId
    //                     ? { ...item, quantity: qty }
    //                     : item
    //             )
    //         );
    //     } catch (error) {
    //         console.error("Error updating quantity:", error);
    //     }

    //     fetchCartItems();
    // };

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
                <p className="text-center mx-auto">
                    Hello this is the cart header
                </p>
            </div>
            {cartData && cartData.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto border-2">
                        {cartData.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onDelete={() => console.log("Delete clicked")}
                                onQuantityChange={() => console.log("Quantity Changed")}
                                // onDelete={() => handleDelete(item.cart_id, item.id)}
                                // onQuantityChange={handleQuantityChange}
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
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto">
                        <CartItem
                            key={item.id}
                            item={item}
                            onDelete={() => handleDelete(item.cart_id, item.cart_item_id)}
                            onQuantityChange={handleQuantityChange}
                        />
                    </div> */}

                    {/* <div className="w-full md:w-1/3">
                        <OrderSummary 
                            totalPrice={cart}
                            onCheckOut={() => handleCheckout()}
                        />
                    </div> */}
                </div>
                
        </div>
    );
};

export default CartPage;
