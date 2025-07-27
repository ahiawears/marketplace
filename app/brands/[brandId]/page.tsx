'use client'; 

import { FilterSortProducts } from "@/components/customer-facing-components/brand-profile-component/filtersortproducts";
import { ProductCard } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { useGetBrandDetails } from "@/hooks/useGetBrandDetails";
import { useGetProducts } from "@/hooks/useGetProduct";
import { BrandProductFilterQueries, ProductListItemsDataType } from "@/lib/types";
import { generateFilterOptions } from "@/lib/utils/product-filters";
import { Facebook, Globe, Instagram, Twitter } from "lucide-react";
import React, { use, useEffect, useMemo, useState } from "react"; 
import { FaTiktok } from "react-icons/fa";


// Main component that handles the async params
export default function BrandProfilePage({ params }: { params: Promise<{ brandId: string }> }) {
    const [resolvedParams, setResolvedParams] = useState<{ brandId: string } | null>(null);

    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl">Loading...</div>;
    }

    return <BrandProfileContent brandId={resolvedParams.brandId} />;
}


// Wrapper component
function BrandProfileContent({ brandId }: { brandId: string }) {
    const [currentFilters, setCurrentFilters] = useState<Partial<Record<keyof BrandProductFilterQueries, string>>>({});

    const { loading, error, brandDetails } = useGetBrandDetails(brandId);
    const { 
        loading: productsLoading, 
        error: productsError, 
        products, 
        totalProducts 
    } = useGetProducts(currentFilters, brandId);

    const brandProductFilterOptions = React.useMemo(() => {
        return generateFilterOptions(products || []);
    }, [products]);
    // Handler for when a filter value changes
    const handleBrandProductFilterChange = (filters: Partial<Record<keyof BrandProductFilterQueries, string>>) => {
        setCurrentFilters(prevFilters => ({ ...prevFilters, ...filters }));
        console.log("Brand product filters changed:", { ...currentFilters, ...filters });
        // Here you would typically re-fetch brand-specific products based on these filters
        // or update a product display component.
    };

    // Flatten all product variants into a single array
    const allVariants = useMemo(() => {
        if (!products) return [];
            return products.flatMap(product => 
                product.product_variants.map(variant => ({
                    variant,
                    product
                })
            )
        );
    }, [products]);


    if (loading || productsLoading) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl">Loading brand details...</div>;
    }

    if (error) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl text-red-500">{error.message}</div>;
    }
    
    if (productsError) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl text-red-500">{productsError.message}</div>;
    }

    if (!brandDetails || brandDetails === null) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl">Brand not found.</div>;
    }

    if(products) {
        console.log("The fetched products are ", products, " and the totalProducts are ", totalProducts);
        // setProductList(products['product_variants']);
    }
    

    return (
        <div className="flex flex-1 flex-col">
            {/* Brand Banner */}
            <div className="relative w-full h-96 bg-cover bg-center border-b-2 overflow-hidden"
                 style={{ backgroundImage: `url(${brandDetails.banner})` }}>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    {brandDetails.logo && (
                        <img src={brandDetails.logo} alt={`${brandDetails.name} Logo`} className="w-24 h-24 object-contain rounded-full border-4 border-white shadow-lg mr-4"/>
                    )}
                    <h1 className="text-4xl font-bold text-white text-shadow-md">{brandDetails.name}</h1>
                </div>
            </div>

            {/* Brand Description */}
            <div className="container my-8 mx-auto ">
                <p className="text-gray-700 dark:text-gray-300 my-2 text-center">{brandDetails.description}</p>
            </div>

            {/* Brand Products Filter/Sort */}
            {/* Pass the specific filter options for brand products */}
            <FilterSortProducts
                filterOptions={brandProductFilterOptions}
                onFilterChange={handleBrandProductFilterChange}
            />

            {/* Placeholder for where brand products would be displayed based on filters */}
            <div className="container mx-auto my-8 py-4 h-auto bg-white dark:bg-gray-800 shadow-md border-2">
                <div className="px-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Products by {brandDetails.name}</h2>
                    {!productsLoading && (
                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
                            {totalProducts > 0
                                ? `${totalProducts} products found.`
                                : 'No products found.'}
                        </p>
                    )}
                </div>
                {/* You would fetch and display the actual products here,
                    likely using another hook or API call that consumes `currentFilters` */}
                {/* {products && products.length > 0 && <ProductGrid />} */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                        {allVariants.map(({ variant, product }) => (
                            <ProductCard 
                                key={`${product.id}-${variant.id}`}
                                variant={variant}
                                product={product}
                            />
                        ))}
                    </div>
            </div>

            {/* Brand Social Media Links */}
            {brandDetails.social_links && ( // Only render this div if social_links exists
                <div className="flex gap-4 justify-center my-4"> {/* Added justify-center for horizontal centering */}
                    {brandDetails.social_links.website && (
                        <a
                            href={brandDetails.social_links.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={`${brandDetails.name}'s website`}
                        >
                            <Globe size={24} />
                        </a>
                    )}
                    {brandDetails.social_links.instagram && (
                        <a
                            href={brandDetails.social_links.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={`${brandDetails.name}'s Instagram`}
                        >
                            <Instagram size={24} />
                        </a>
                    )}
                    {brandDetails.social_links.facebook && (
                        <a
                            href={brandDetails.social_links.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={`${brandDetails.name}'s Facebook`}
                        >
                            <Facebook size={24} />
                        </a>
                    )}
                    {brandDetails.social_links.twitter && (
                        <a
                            href={brandDetails.social_links.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={`${brandDetails.name}'s Twitter`}
                        >
                            <Twitter size={24} />
                        </a>
                    )}
                    {brandDetails.social_links.tiktok && (
                        <a
                            href={brandDetails.social_links.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={`${brandDetails.name}'s Tiktok`}
                        >
                            <FaTiktok size={24} />
                        </a>
                    )}
                </div>
            )}
        </div>
    )
}
