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
import { createClient } from '@/supabase/server';
import { getServerAnonymousId } from '@/lib/anon_user/server';
import { getCartItems } from "@/actions/user-actions/userCartActions/getCartItems";

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
export default async function CartPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    const userIdentifier = userId || await getServerAnonymousId();
    const isAnonymous = !userId;

    const cartItems = await getCartItems(isAnonymous, userIdentifier);
    console.log("The cart items are ", cartItems);

    return (
        <div className="container mx-auto">
            {cartItems.productsWithImages.length > 0 ? (
               <div>
                    <div className="flex border-2 p-4 w-full my-4">
                        <div className="flex items-center justify-center gap-2 mx-auto">
                            <ShoppingCart size={24} className="text-gray-600" />
                            <h2 className="text-2xl font-normal">Your Shopping Cart</h2>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto border-2">
                            {cartItems.productsWithImages.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    serverUserIdentifier={userIdentifier}
                                    isAnonymous={isAnonymous}
                                />
                            ))}
                        </div>

                        <div className="w-full md:w-1/3">
                            <OrderSummary 
                                totalPrice={cartItems.totalPrice}
                                serverUserIdentifier={userIdentifier}
                                isAnonymous={isAnonymous}
                            />
                        </div>
                    </div>
               </div>
            ) : (
                <div className="mx-auto max-w-2xl lg:max-w-7xl w-full">
                    <div className="w-full p-8 text-center transform transition-all relative"> 
                        <div className="mx-auto">
                            <CartListsSvg className="w-64 h-64 mx-auto" width={256} height={256}/>
                            <p className="font-bold my-4">You have no items in your cart</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
// const CartPage = () => {
//     const { userId } = useAuth();
//     const { cartLoading, cartError, cartItems } = useGetCartItems();
//     const router = useRouter();
//     const [cartItem, setCartItem] = useState<CartItemData[]>([]);

//     const [totalPrice, setTotalPrice] = useState(0); 
//     const [loading, setLoading] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);

//     // Add these new state variables to your CartPage component
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

//     // Use a useEffect to set the initial data from the hook
//     useEffect(() => {
//         if (!cartLoading && cartItems) {
//             setCartItem(cartItems.productsWithImages);
//             setTotalPrice(cartItems.totalPrice);
//         }
//     }, [cartLoading, cartItems]);

//     const handleQuantityChange = async (
//         qty: number,
//         cartItemId: string,
//         variantId: string,
//         size: string
//     ) => {
//         setLoading(true);
//         setError(null);
//         try {
//             setCartItem(prevItems =>
//                 prevItems.map(item =>
//                     item.id === cartItemId ? { ...item, quantity: qty } : item
//                 )
//             );
//             const userIdentifier = userId || getClientAnonymousId();

//             const response = await fetch(`/api/updateCart?updateType=quantityChange&${userId ? `userType=user&Id=${userIdentifier}` : `userType=anonymous&Id=${userIdentifier}`}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     quantity: qty,
//                     id: cartItemId,
//                     variantId: variantId,
//                     size: size
//                 })
//             })

//             const result = await response.json();

//             if(!response.ok) {
//                 throw new Error(result.error instanceof Error ? result.error.message : "Failed to update item quantity");
//             }

//             if (result.success) {
//                 setTotalPrice(result.data.newTotal);
//             }

//         } catch (error) {
//             setError(error instanceof Error ? error.message : "An unexpected error occurred");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if ( cartLoading || loading) {
//         return <LoadContent />
//     }

//     if (cartError) {
//         console.log("Cart error is ", cartError);
//     }

//     const handleCheckout = async () => {
//         //router.push('/place-order')
//         console.log("Checkout clicked!!!");
//     }

//     const handleDelete = (id: string) => {
//         // Set the item ID and open the modal
//         setItemToDeleteId(id);
//         setIsModalOpen(true);
//     };
//     const handleConfirmDelete = async () => {
//         if (!itemToDeleteId) return;
//         setLoading(true);
//         setError(null);

//         // Here you'll put your actual deletion logic
//         try{
//             const userIdentifier = userId || getClientAnonymousId();

//             const response = await fetch(`/api/updateCart?updateType=itemDeletion&${userId ? `userType=user&Id=${userIdentifier}` : `userType=anonymous&Id=${userIdentifier}`}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     cartId: itemToDeleteId
//                 })
//             })
//             const result = await response.json();

//             if(!response.ok) {
//                 throw new Error(result.error instanceof Error ? result.error.message : "Failed to delete cart item");
//             }

//             if (result.success) {
//                 setTotalPrice(result.data.newTotal);
//             }

//             setCartItem(prevItems => prevItems.filter(item => item.id !== itemToDeleteId));
//         } catch ( error ) {
//             console.error("Error deleting item:", error);
//             setError(error instanceof Error ? error.message : "An unexpected error occurred");
//         } finally {
//             setIsModalOpen(false);
//             setItemToDeleteId(null);
//             setLoading(false);
//         }

//         // Call your server action to delete the item
//         // You'll need to pass the user ID and cart item ID here
//         // For now, let's just use console.log as a placeholder
//         // try {
//         //     await deleteCartItem(cartId, itemToDeleteId);
//         //     // Optimistically remove the item from the local state
//         //     setCartItem(prevItems => prevItems.filter(item => item.id !== itemToDeleteId));
//         // } catch (error) {
//         //     console.error("Failed to delete item:", error);
//         //     // Handle error, e.g., show a toast notification
//         // }

//     };

//     const handleCancelDelete = () => {
//         // Simply close the modal without deleting anything
//         setIsModalOpen(false);
//         setItemToDeleteId(null);
//     };
   
//     return (
//         <div className="container mx-auto">
//             <div className="flex border-2 p-4 w-full my-4">
//                 <div className="flex items-center justify-center gap-2 mx-auto">
//                     <ShoppingCart size={24} className="text-gray-600" />
//                     <h2 className="text-2xl font-normal">Your Shopping Cart</h2>
//                 </div>
//             </div>
//             {cartItem && cartItem.length > 0 ? (
//                 <div className="flex flex-col md:flex-row gap-8">
//                     <div className="w-full md:w-2/3 max-h-[70vh] overflow-y-auto border-2">
//                         {cartItem.map((item) => (
//                             <CartItem
//                                 key={item.id}
//                                 item={item}
//                                 onDelete={ handleDelete }
//                                 onQuantityChange={handleQuantityChange}
//                                 // onDelete={() => handleDelete(item.cart_id, item.id)}
//                             />
//                         ))}
//                     </div>
//                     <div className="w-full md:w-1/3">
//                         <OrderSummary 
//                             totalPrice={totalPrice}
//                             onCheckOut={() => handleCheckout()}
//                         />
//                     </div>
//                 </div>
//             ) : (
//                 <div className="mx-auto max-w-2xl lg:max-w-7xl w-full">
//                     <div className="w-full p-8 text-center transform transition-all relative"> 
//                         <div className="mx-auto">
//                             <CartListsSvg className="w-64 h-64 mx-auto" width={256} height={256}/>
//                             <p className="font-bold my-4">You have no items in your cart</p>

//                             <div className="flex w-full flex-col md:flex-row mx-auto">
//                                 <div className="mx-auto">
//                                     <Button>
//                                         Go to favorited items
//                                     </Button>
//                                 </div>
                                
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}  
//             {/* Deletion Confirmation Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 border-2 shadow-xl max-w-sm w-full">
//                         <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
//                         <p className="text-sm text-gray-700 mb-6">
//                             Are you sure you want to remove this item from your cart?
//                         </p>
//                         <div className="flex justify-end gap-2">
//                             <Button variant="secondary" className="border-2 hover:bg-opacity-25" onClick={handleCancelDelete}>
//                                 Cancel
//                             </Button>
//                             <Button onClick={handleConfirmDelete}>
//                                 Remove Item
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

