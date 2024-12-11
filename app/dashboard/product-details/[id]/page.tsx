'use client';

import BrandProductItem from "@/components/ui/brand-product-detail"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { Product } from '@/lib/types';

const BrandProductDetail: React.FC = () => {
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
                } catch (error) {
                    console.error("Error fetching product details:", error);
                }
            };
            fetchProductDetails();
            
        }
    }, [productId]);

    if (!product) return <p>Loading...</p>;
    console.log(product.categoryName);


    return (
        <div>
            <BrandProductItem 
                productId={productId} 
                productName={product?.name || "Unknown Product"} 
                productPrice={product?.price || 0} 
                mainImage={product?.main_image_url || ""}
                thumbnails={product?.image_urls || []}
                description ={product?.description || "This product has no description"} 
                weight={product?.weight || 0} 
                categoryName={product?.categoryName || ""}
            />
        </div> 
    )
}

export default BrandProductDetail