'use client';

import BrandProductItem from "@/components/ui/brand-product-detail"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { Product, ProductInformation } from '@/lib/types';
import { ProductsImagesThumbnailEdit } from "@/components/brand-product-preview/product-images-thumbnail";
import { createClient } from "@/supabase/client";


const BrandProductDetail: React.FC = () => {
    const params = useParams();
    let productId = params?.id || "";
    if (Array.isArray(productId)) {
        productId = productId[0];
    }
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [productData, setProductData] = useState<ProductInformation | null>(null);


    useEffect(() => {
        if (productId) {
            async function fetchProductDetails() {
                try {
                    const { data: {session}, error } = await createClient().auth.getSession();
                    if (error) {
                        throw new Error("Failed to get session.");
                    }
            
                    if (!session) {
                        throw new Error("User is not authenticated.");
                    }

                    const accessToken = session.access_token;

                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-product?variantId=${productId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    )
                    if (!res.ok) {
                        throw new Error("Failed to get products details");
                    }
                    const data = await res.json();
                    console.log("The product details are: ", data);
                    if (data.success) {
                        const holdData = data.data;
                        setProductData(holdData);                  
                    } else {
                        console.error("Error fetching product:", data.message);
                    }
            
                } catch (error) {
                    console.error("Error fetching product details:", error);
                } finally {
                    setLoading(false);
                }
            }
            fetchProductDetails();
        }
    }, [productId])

    useEffect(() => {
        if (productData) {
            console.log("Updated product data:", productData);
        }
    }, [productData]);
    //if (!product) return <p>Product not found</p>;

    if (loading) return <p>Loading...</p>;



    return (
        <div className="border-2 shadow mx-auto h-fit">
            {/* <BrandProductItem 
                productId={productId} 
                productName={product?.name || "Unknown Product"} 
                productPrice={product?.price || 0} 
                mainImage={product?.main_image_url || ""}
                thumbnails={product?.image_urls || []}
                description ={product?.description || "This product has no description"} 
                weight={product?.weight || 0} 
                categoryName={product?.categoryName || ""}
            /> */}
            {/* Add products variants grid here start */}
            {/* Add products variants grid here end */}

            
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:basis-3/5 basis-full">
                    {/* Add images and thumbnails here */}
                    <ProductsImagesThumbnailEdit 
                        productId={productId}
                    />
                </div>
            </div>
        </div> 
    )
}

export default BrandProductDetail