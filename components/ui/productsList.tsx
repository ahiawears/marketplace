"use client";

import React, { useEffect, useState } from 'react';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { ProductsListType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";
import addItemToUserLiked from '@/actions/add-to-user-saved';
import { fetchUserLikedItems } from '@/actions/fetch-user-liked-item';
import { Button } from './button';
import AddToCartModal from '../modals/add-to-cart-modal';
import ModalBackdrop from '../modals/modal-backdrop';


const ProductsList = () => { 
    const [liked, setLiked] = useState<{ [key: string]: boolean }>({});
    const [productsData, setProductsData] = useState<ProductsListType[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const query = searchParams.get("query") ?? "";
    const catQuery = searchParams.get("cat") ?? "";
    const router = useRouter();

    const handleAddToCartClick = (productId: string) => {
        setSelectedProductId(productId);
    }

    const handleAddToCart = async () => {
        console.log(`Item with ID ${selectedProductId} is added to cart`);
        setSelectedProductId(null);
    }

    const handleModalCancel = async () => {
        setSelectedProductId(null);
    }
    //Toggle the like status for a product
    const toggleLike = async (id: string) => {
        setLiked((liked) => {
          const isLiked = liked[id] || false;
          return {
            ...liked,
            [id]: !isLiked,
          };
        });
        await updateUserLikedItem(id, !liked[id]);
    };



    const updateUserLikedItem = async (id: string, isLiked: boolean) => {
        const item = { id, isLiked };
        try {
          await addItemToUserLiked(item);
          console.log(`Successfully updated liked status for product ID: ${id}`);
        } catch (error) {
          console.error(`Error updating liked status for product ID: ${id}`, error);
        }
    };
  
    

    useEffect(() => {
        const fetchProductsAndLikes = async () => {
            try {
                const endpoint = query
                    ? `/api/getProducts?query=${encodeURIComponent(query)}`
                    : `/api/getProductsinCategory?cat=${encodeURIComponent(catQuery)}`; 
                const response = await fetch(endpoint);
                const { data: products } = await response.json();
    
                if (!response.ok) throw new Error("Failed to fetch products");
    
                const savedItems = await fetchUserLikedItems();
                const likedMap: { [key: string]: boolean } = savedItems.reduce(
                    (acc, item) => ({ ...acc, [item.product_id]: true }),
                    {}
                );
                
                const updatedProducts = products.map((product: ProductsListType) => ({
                    ...product,
                    liked: likedMap[product.id] || false,
                }));
    
                setProductsData(updatedProducts);
    
                setLiked(likedMap);
            } catch (error) {
                console.error("Error fetching products or liked items:", error);
            }
        };
    
        fetchProductsAndLikes();
    }, [query, catQuery]);

    useEffect(() => {
        if (selectedProductId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [selectedProductId]);
    

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
                                        className="h-full w-full object-cover object-center hover:cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push(`/product-detail/${product.id}`); 
                                        }}
                                    />
                                    <button
                                        onClick={() => toggleLike(product.id)}
                                        className="absolute top-2 right-2 p-2 cursor-pointer z-10 text-white group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out"
                                    >
                                        {liked[product.id] ? (
                                            <AiFillHeart className="text-red-500" size={24} />
                                        ) : (
                                            <AiOutlineHeart className="text-black" size={24} />
                                        )} 
                                    </button>
                                    <Button
                                        onClick={() => handleAddToCartClick(product.id)}
                                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-black bg-opacity-50 text-white font-medium opacity-0 group-hover:opacity-100 duration-300 ease-in-out z-10 h-[40px] w-[200px] rounded-full"
                                    >
                                        Add to Cart
                                    </Button>
                                    
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
            {/* Modal outside the map */}
            {selectedProductId && (
                <>
                    <ModalBackdrop disableInteraction={true} />

                    <AddToCartModal 
                        productId={selectedProductId} 
                        onAdd={handleAddToCart} 
                        onCancel={handleModalCancel} 
                    />
                </>
            )}
        </div>
    )
}


export default ProductsList