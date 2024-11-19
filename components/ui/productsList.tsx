"use client";

import React, { useEffect, useState } from 'react';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { ProductsListType } from '@/lib/types';
import { useRouter } from 'next/navigation';

const ProductsList = () => {
    // State to track liked items by product ID
    const [liked, setLiked] = useState<{ [key: number]: boolean }>({});
    const [productsData, setProductsData] = useState<ProductsListType[]>([]);
    const router = useRouter();

    const handleClickedProduct = ( id: string ) => {
        console.log(`Product with id: ${id} clicked` );
    }


    // Toggle the like status for a product
    // const toggleLike = (id: number) => {
    //     setLiked((prevLiked) => ({
    //         ...prevLiked,
    //         [id]: !prevLiked[id],
    //     }));
    // };

    useEffect(() => {
        const fetchProductsItems = async () => {
            try {
                const response = await fetch('/api/getProducts');
                const data = await response.json();

                if (response.ok) {
                    setProductsData(data.data);
                } else {
                    console.error("Failed to fetch product items:", data.error);
                }
            } catch (error) {
                console.error("Error fetching product items:", error);
            }
        };
        fetchProductsItems();
    }, []);

    return (
        <div>
            <div className='bg-white'>
                <div className="mx-auto px-4 sm:px-6 lg:w-full lg:px-8">
                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-3">
                        {productsData.map((product) => (
                            <div key={product.id} className="group relative">
                                <div className="relative w-full h-[410px] rounded-md overflow-hidden bg-gray-200 group-hover:opacity-75">
                                <img
                                    alt={product.name}
                                    src={product.main_image_url}
                                    className="h-full w-full object-cover object-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log("The id clicked: ", product.id);
                                        router.push(`/product-detail/${product.id}`); // Navigate to product details page
                                    }}
                                />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            //toggleLike(product.id);
                                        }}
                                        className="absolute top-2 right-2 p-2 cursor-pointer z-10 text-white group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out"
                                    >
                                        {/* {liked[product.id] ? (
                                            <AiFillHeart className="text-red-500" size={24} />
                                        ) : (
                                            <AiOutlineHeart className="text-black" size={24} />
                                        )} */}
                                    </button>
                                    <button
                                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-black bg-opacity-50 text-white font-medium opacity-0 group-hover:opacity-100 duration-300 ease-in-out z-10 h-[40px] w-[200px] rounded-full"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700">
                                            <a 
                                                href= {`product-detail/${product.id}`}
                                                className="relative"
                                            >
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {product.name}
                                            </a>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductsList