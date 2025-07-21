'use client';

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { ProductInformation } from '@/lib/types';
import { ProductsImagesThumbnailEdit } from "@/components/brand-product-preview/product-images-thumbnail";
import { createClient } from "@/supabase/client";
import { ProductDataDetailsEdit } from "@/components/brand-product-preview/product-data-details";
import { useGetProductDetails } from "@/hooks/useGetProductDetails";
import { useAuth } from "@/hooks/useAuth";
import LoadContent from "@/app/load-content/page";
import AddProductForm from "@/components/ui/add-product-form";

const BrandProductDetail: React.FC = () => {
    const params = useParams();
    let productId = params?.id || "";
    if (Array.isArray(productId)) {
        productId = productId[0];
    }

    return (
         <div>
            <div className="mx-auto shadow-2xl">
                <div className="mx-auto max-w-7xl border-2">
                    <AddProductForm />  
                </div>
            </div>
        </div> 
    )
}

export default BrandProductDetail