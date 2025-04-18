"use client";

import ProductItem from '@/components/ui/product-item-detail'
import ProductsList from '@/components/ui/productsList'
import { Product } from '@/lib/types';
import { useParams } from "next/navigation";
import { useEffect, useState } from 'react';

const ProductDetail: React.FC = () => {
    const params = useParams();
    let productId = params?.id || "";
    if (Array.isArray(productId)) { 
        productId = productId[0];
    }
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (productId) {
            const fetchProductDetails = async () => {
                try {
                    const response = await fetch(`/api/getProductById/${productId}`);
                    const data = await response.json();
                    setProduct(data.data);
                } catch (error: any) {
                    console.error("Error fetching product details:", error);
                    throw new Error(`Error fetching product details: ${error}, ${error.message}, ${error.name}}`);
                }
            };
            fetchProductDetails();
        }
    }, [productId]);
    if (!product) return <p>Loading...</p>;

    return (
        <div>
             
            <ProductItem 
                productId={productId} 
                productName={product?.name || "Unknown Product"} 
                productPrice={product?.price || 0} 
                mainImage={product?.main_image_url || ""}
                thumbnails={product?.image_urls || []}
                description ={product?.description || "This product has no description"} 
            /> 
            {/* This should query the products table for category with same tag */}
            {/* Featured grids */}
            <h2 className='text-md text-2xl font-bold px-4 lg:px-8 sm:px-6 lg:w-full'>You might also like:</h2>
            {/* <ProductsList /> */}
        </div>
    )
}

export default ProductDetail   