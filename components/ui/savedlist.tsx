"use client";

import removeFavedItem from "@/actions/remove-faved-item";
import { ProductsListType } from "@/lib/types"
import { revalidatePath } from "next/cache";   
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react"
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from "./button";
import FavsListSVG from "../svg/fav-lists-svg";
import Image from "next/image";
import { AiOutlineDelete } from "react-icons/ai";
import { strictSerialize } from "@/lib/serialization";
import { checkVariantStock } from "@/actions/user-actions/userCartActions/checkVariantStock";
import { upsertCart } from "@/actions/user-actions/userCartActions/upsertCart";
import { saveProduct } from "@/actions/user-actions/userSavedProductActions/save-product";

interface SavedItemData {
    id: string;
    variant_id: {
        id: string;
        name: string;
        base_currency_price: number;
    }; 
    image: string;
    color: {
        name: string;
        hex: string;
    };
    size: string;
}

interface SavedListProps {
    item: SavedItemData;
    serverUserIdentifier: string;
    isAnonymous: boolean;
}

const SavedList: React.FC<SavedListProps> = ({item, serverUserIdentifier, isAnonymous}) => {

    const router = useRouter();
    const [savedProductsData, setSavedProductsData] = useState<ProductsListType[]>([]);
    const [hasBeenAdded, setHasBeenAdded] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isCartPending, startCartTransition] = useTransition();
    const [isDeletePending, startDeleteTransition] = useTransition();

    const handleDeleteSavedItem = () => {
        let size;
        if (!selectedSize) {
            size = "";
        } else {
            size = selectedSize;
        }

        if(!item.variant_id.id) {
            return;
        }

        startDeleteTransition(async () => {
            try {
                const result = await saveProduct({
                    variantId: item.variant_id.id,
                    size: size,
                    isAnonymous,
                    userId: serverUserIdentifier,
                    path: 'savedPage'
                })
                // If the server action failed, revert the UI state
                if (!result.success) {
                    console.error("Failed to save product:", result.error);
                }
            } catch (error) {
                console.error("Unexpected error in saveProduct:", error);
            }
        })
    }

    const handleAddToCart = async () => {
        const quantity = 1;
        if (!item.variant_id.id || !selectedSize) return;

        startCartTransition(async () => {
            try {
                const verifiedInput = strictSerialize({
                    variantId: item.variant_id.id,
                    size: selectedSize,
                    quantity
                });

                const stockResult = await checkVariantStock(
                    verifiedInput.variantId,
                    verifiedInput.size,
                    verifiedInput.quantity
                );

                const verifiedStock = strictSerialize(stockResult);
                if (!verifiedStock.success) throw new Error(verifiedStock.error);

                if (verifiedStock.sizeId === null) {
                    throw new Error("Size ID was not returned from stock check.");
                }

                const cartData = strictSerialize({
                    variantId: item.variant_id.id,
                    sizeId: verifiedStock.sizeId,
                    quantity,
                    isAnonymous,
                    userId: serverUserIdentifier
                });

                const cartResult = await upsertCart(cartData);
                const verifiedCart = strictSerialize(cartResult);

                if (!verifiedCart.success) throw new Error(verifiedCart.error);
                setHasBeenAdded(true);
                setTimeout(() => setHasBeenAdded(false), 3000); 

            } catch (error) {
                console.error("Nuclear error handling:", {
                    message: error instanceof Error ? error.message : String(error),
                    input: { variantId: item.variant_id.id, size: selectedSize },
                })
            }
        })
    }


    return (
        <div className="overflow-hidden hover:shadow-lg transition-shadow hover:cursor-pointer">
            <div className="group relative bg-gray-100 group-hover:opacity-75 overflow-hidden">
                {item.image ? (
                    <>
                        <Image
                            src={item.image}
                            alt={item.variant_id.name}
                            width={400}
                            height={400}
                            unoptimized={true}
                            className="object-cover"
                            quality={85}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
							loading="lazy"
                        />

                        <button
                            onClick={handleDeleteSavedItem}
                            className="absolute top-2 right-2 p-2 rounded-full cursor-pointer z-200 text-black group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out hover:shadow-lg"
                        >
                            <AiOutlineDelete size={20} className="outline-2" />
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500">No image available</span>
                    </div>
                )}
            </div>

            <div className="border-b-2 p-2">
                <p className="text-gray-600 font-semibold line-clamp-1 border-b-2 border-gray-200">{item.variant_id.name}</p>
                <div className="my-2 flex items-center gap-2 border-b-2 border-gray-200">
                    {item.color && (
                        <span 
                            className="w-4 h-4 border-2"
                            style={{ backgroundColor: item.color.hex }}
                            title={item.color.name}
                        />
                    )}
                    <span className="text-sm text-gray-500">
                        {item.color?.name}
                    </span>
                </div>
					
                <div className="mt-4 flex justify-between items-center border-b-2 border-gray-200">
                    <span className="font-bold">${item.variant_id.base_currency_price.toFixed(2)}</span>
                </div>
                <Button
                    className={`w-full py-3 text-white transition-colors disabled:bg-gray-400 border-2 border-black ${hasBeenAdded ? 'bg-green-500' : 'bg-black'}`}
                    onClick={handleAddToCart}
                    disabled={!selectedSize || isCartPending || hasBeenAdded}

                >
                    Add to cart
                </Button>
            </div>
        </div>
    )
}

export default SavedList