"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from 'react';
import AddProductForm from '@/components/ui/add-product-form';
import { fetchProductById } from "@/lib/brandUpdateProduct";
import { ProductData, ProductDetails, mapProductDetailsToProductData } from "@/lib/types";

const page = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        const loadProductData = async () => {
            if (id) {
                const response = await fetch(`/api/brandGetProductDetail?id=${id}`);
                const productData = await response.json();
                setData(productData);
            }
        };
        loadProductData();
    }, [id]);

    return (
        <div>
            The current product id is {id}
            <div className="hidden lg:block">
                <div className="p-4"> 
                    {data ? (
                        <AddProductForm initialData={data} />
                    ) : (
                        <p>Loading product details...</p>
                    )} 
                </div>
            </div>
            <div className="w-full py-10 lg:hidden">
                <AddProductForm  />
            </div>
        </div>
    )
}

export default page