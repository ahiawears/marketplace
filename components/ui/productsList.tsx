"use client";

import React, { useState } from 'react';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';



const products = [
    {
      id: 1,
      name: 'Basic Tee',
      href: '#',
      imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
      imageAlt: "Front of men's Basic Tee in black.",
      price: '$35',
      color: 'Black',
    },
    {
        id: 2,
        name: 'Basic Tee',
        href: '#',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-02.jpg',
        imageAlt: "Front of men's Basic Tee in black.",
        price: '$35',
        color: 'Black',
    },
    {
        id: 3,
        name: 'Basic Tee',
        href: '#',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-03.jpg',
        imageAlt: "Front of men's Basic Tee in black.",
        price: '$35',
        color: 'Black',
    },
    {
        id: 4,
        name: 'Basic Tee',
        href: '#',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-04.jpg',
        imageAlt: "Front of men's Basic Tee in black.",
        price: '$35',
        color: 'Black',
    },
    {
        id: 5,
        name: 'Basic Tee',
        href: '#',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-01.jpg',
        imageAlt: "Front of men's Basic Tee in black.",
        price: '$35',
        color: 'Black',
    },
]


const ProductsList = () => {
    // State to track liked items by product ID
    const [liked, setLiked] = useState<{ [key: number]: boolean }>({});

    // Toggle the like status for a product
    const toggleLike = (id: number) => {
        setLiked((prevLiked) => ({
            ...prevLiked,
            [id]: !prevLiked[id],
        }));
    };
    return (
        <div>
            <div className='bg-white'>
                <div className="mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:w-full lg:px-8">
                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-3">
                        {products.map((product) => (
                            <div key={product.id} className="group relative">
                                <div className="relative w-full h-[410px] rounded-md overflow-hidden bg-gray-200 group-hover:opacity-75">
                                    <img
                                        alt={product.imageAlt}
                                        src={product.imageSrc}
                                        className="h-full w-full object-cover object-center"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleLike(product.id);
                                        }}
                                        className="absolute top-2 right-2 p-2 cursor-pointer z-10 text-white group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out"
                                    >
                                        {liked[product.id] ? (
                                            <AiFillHeart className="text-red-500" size={24} />
                                        ) : (
                                            <AiOutlineHeart className="text-black" size={24} />
                                        )}
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
                                            <a href={product.href}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {product.name}
                                            </a>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{product.price}</p>
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