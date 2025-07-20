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

const BrandProductDetail: React.FC = () => {
    const params = useParams();
    let productId = params?.id || "";
    if (Array.isArray(productId)) {
        productId = productId[0];
    }
    const { userId, userSession, loading: authLoading, error: authError, resetError: authResetError } = useAuth();
    const { loading: productLoading, error: productError, productDetails } = useGetProductDetails(productId, "getProductForEdit", userSession?.access_token!);

    if(authLoading) {
        return <LoadContent />;
    }

    if (authError) {
        return <p>Error in authentication: {authError.message}</p>;
    }

    if (productLoading) {
        return <LoadContent />;
    }

    if (productError) {
        return <p>Error loading product details: {productError.message}</p>;
    }

    if (!productDetails) {
        return <p>No product details found.</p>;
    }


    return (
        <div>
        
            
        </div> 
    )
}

export default BrandProductDetail