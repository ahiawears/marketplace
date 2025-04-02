"use client";

import removeFavedItem from "@/actions/remove-faved-item";
import { ProductsListType } from "@/lib/types"
import { revalidatePath } from "next/cache";   
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from "./button";
import FavsListSVG from "../svg/fav-lists-svg";

const FavsList = () => {

    const router = useRouter();
    const [savedProductsData, setSavedProductsData] = useState<ProductsListType[]>([]);

    const fetchUserLikedItemList = async () => {
        try {
            const response = await fetch("/api/userFavList");
            const { data: products } = await response.json();

            if (!response.ok) throw new Error("Failed to fetch products");

            const favoritesItems = products.map((product: ProductsListType) => ({
                ...product,
            }));
            setSavedProductsData(favoritesItems);
        } catch (error) {
            console.error("Error fetching saved items", error);
        }
    };

    const removeFavItem = async (id: string) => {
        try {
            console.log("Removing saved product:", id);
            await removeFavedItem(id);
            setSavedProductsData((prev) =>
                prev.filter((product) => product.id !== id)
            );
            router.refresh();
        } catch (error) {
            console.error("Error removing item", error);
        }
    };

    // useEffect(() => {
    //     fetchUserLikedItemList();
    // }, []);

    return (
        <div className="container mx-auto">

            {savedProductsData.length > 0 ? (
                <div>

                </div>
            ) : (
                <div className="mx-auto max-w-2xl lg:max-w-7xl w-full">
                    <div className="w-full p-8 text-center transform transition-all relative"> {/* Added relative positioning */}
                        <div className="mx-auto ">
                            <FavsListSVG className="w-64 h-64 mx-auto" width={256} height={256} />
                            <p className="font-bold my-4">You have no favorited items yet</p>
                            <Button>
                                
                            </Button>
                        </div>
                    </div>
                </div>
            )}


            {/* <div className="bg-white">
                <div className="mx-auto px-4 sm:px-6 lg:w-full lg:px-8">
                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-3">
                        {savedProductsData.map((product) => (
                            <div key={product.id} className="group relative">
                                <div className="relative w-full h-[410px] rounded-md overflow-hidden bg-gray-200 group-hover:opacity-75">
                                    <img 
                                        src={product.main_image_url} 
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center hover:cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push(`/product-detail/${product.id}`);
                                        }}
                                    />
                                    <Button
                                        onClick={() => removeFavItem(product.id)}
                                        className="absolute top-2 right-2 p-2 cursor-pointer z-10 text-white group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out bg-transparent hover:bg-transparent"
                                    >
                                        <FaRegTrashAlt className="text-black" size={24} />
                                    </Button>

                                    <Button
                                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-black bg-opacity-50 text-white font-medium opacity-0 group-hover:opacity-100 duration-300 ease-in-out z-10 h-[40px] w-[200px] rounded-full"
                                    >
                                        Add to Cart
                                    </Button>

                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700">
                                            <a 
                                                href={`product-detail/${product.id}`}
                                                className="relative"
                                            >
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {product?.name}
                                            </a>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product?.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default FavsList