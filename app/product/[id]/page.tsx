"use client";

import LoadContent from '@/app/load-content/page';
import ProductItem from '@/components/ui/product-item-detail'
import ProductsList from '@/components/ui/productsList'
import { useGetProductDetails } from '@/hooks/useGetProductDetails';
import { Product } from '@/lib/types';
import { useParams } from "next/navigation";
import { useEffect, useState } from 'react';

export default function ProductDetail({ params }: { params: Promise<{ id: string }>}) {
    const [ resolvedParams, setResolvedParams ] = useState<{ id: string } | null>(null);

    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl">Loading...</div>;
    }

    return <ProductDetailsContent id={resolvedParams.id} />
}

function ProductDetailsContent({ id }: { id: string }) {
    const { loading: productDetailsLoading, error: productDetailsError, productDetails } = useGetProductDetails(id, "getProductDetails");

    if (productDetailsLoading) {
        return <LoadContent />
    }

    if(productDetailsError) {
        console.log("Error getting product details", productDetailsError);
    }

    if(productDetails) {
        console.log("The product details is ", productDetails);
    }

    return (
        <div>
            <div className="">
                <ProductItem
                    variantData={productDetails.data}
                />
            </div>
        </div>
    )
}