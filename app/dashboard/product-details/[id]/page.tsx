'use client';

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { ProductInformation } from '@/lib/types';
import { ProductsImagesThumbnailEdit } from "@/components/brand-product-preview/product-images-thumbnail";
import { createClient } from "@/supabase/client";
import { ProductDataDetailsEdit } from "@/components/brand-product-preview/product-data-details";


const BrandProductDetail: React.FC = () => {
    const params = useParams();
    let productId = params?.id || "";
    if (Array.isArray(productId)) {
        productId = productId[0];
    }
    const [loading, setLoading] = useState(true);
    const [productData, setProductData] = useState<ProductInformation | null>(null);
    const [variantImagesData, setVariantImagesData] = useState<ProductInformation["variantImages"] | null>(null);
    const [variantTextsData, setVariantTextsData] = useState<ProductInformation["variantTexts"] | null>(null);
    const [variantTagsData, setVariantTagsData] = useState<ProductInformation["variantTags"] | null>(null);
    const [variantMeasurementsData, setVariantMeasurementsData] = useState<ProductInformation["measurementsData"] | null>(null);


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
                    );
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
                        throw new Error(`Error fetching product. ${data.message}`);
                    }
            
                } catch (error: any) {
                    console.error("Error fetching product details:", error);
                    throw new Error(`Error fetching product details. ${error}, ${error.message}`);
                } finally {
                    setLoading(false);
                }
            }
            fetchProductDetails();
        }
    }, [productId])

    useEffect(() => {
        if (productData) {
            //console.log("Updated product data:", productData);
            setVariantImagesData(productData.variantImages);
            setVariantTextsData(productData.variantTexts);
            setVariantTagsData(productData.variantTags);
            setVariantMeasurementsData(productData.measurementsData);
        }
    }, [productData]);


    if (loading) return <p>Loading...</p>;
    if (!productData || productData === undefined) return <p>Product not found</p>;
    if (!variantImagesData) return <p>No images found</p>;

    return (
        <div>
        
            {/* Add products variants grid here start */}
            {/* Add products variants grid here end */}

            
            <div className="flex flex-col lg:flex-row md:flex-row sm:flex-col gap-4">
                <div className="w-full lg:basis-3/5 md:basis-3/5 sm:basis-full justify-between">
                    {/* Add images and thumbnails here */}
                    <ProductsImagesThumbnailEdit 
                        {...variantImagesData}
                    />
                </div>
                <div className="w-full lg:basis-2/5 md:basis-2/5 sm:basis-full">
                    {/* Edit Product details */}
                    <ProductDataDetailsEdit 
                        variantTags={variantTagsData}
                        variantTexts={variantTextsData}
                        measurementsData={variantMeasurementsData}
                    />
                </div>
            </div>
        </div> 
    )
}

export default BrandProductDetail