'use client'; 

import { FilterSortProducts } from "@/components/customer-facing-components/brand-profile-component/filtersortproducts";
import { useGetBrandDetails } from "@/hooks/useGetBrandDetails";
import { BrandProductFilterQueries, FilterOption } from "@/lib/types";
import { Facebook, Globe, Instagram, Twitter } from "lucide-react";
import React, { use, useState } from "react"; 
import { FaTiktok } from "react-icons/fa";

export default function BrandProfilePage({params,}: {params: Promise<{ brandId: string }>; }) {    
    const { brandId } = use(params);
    const [currentFilters, setCurrentFilters] = useState<Partial<Record<keyof BrandProductFilterQueries, string>>>({});

    if (!brandId) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl">Error: Brand ID is missing.</div>;
    }

    const { loading, error, brandDetails } = useGetBrandDetails(brandId);

    if (loading) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl">Loading brand details...</div>;
    }

    if (error) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl text-red-500">{error.message}</div>;
    }

    if (!brandDetails || brandDetails === null) {
        return <div className="flex flex-1 items-center justify-center h-screen text-xl">Brand not found.</div>;
    }

    const brandProductFilterOptions: Record<string, FilterOption> = {
        category: {
            label: "Category",
            key: "category",
            options: [
                { label: "Electronics", value: "electronics" },
                { label: "Apparel", value: "apparel" },
                { label: "Home Goods", value: "home-goods" },
                // ... more categories
            ],
        },
        productType: {
            label: "Product Type",
            key: "productType",
            options: [
                { label: "Smartphones", value: "smartphones" },
                { label: "T-Shirts", value: "t-shirts" },
                { label: "Lamps", value: "lamps" },
                // ... more product types
            ],
        },
        color: {
            label: "Color",
            key: "color",
            options: [
                { label: "Red", value: "red" },
                { label: "Blue", value: "blue" },
                { label: "Green", value: "green" },
                // ... more colors
            ],
        },
        // priceRange: {
        //     label: "Price Range",
        //     key: "priceRange",
        //     options: [
        //         { label: "Under $50", value: "under-50" },
        //     ]
        // },
        material: {
            label: "Material",
            key: "material",
            options: [
                { label: "Leather", value: "leather" },
                { label: "Plastic", value: "plastic" },
                { label: "Metal", value: "metal" },
                // ... more materials
            ]
        },
        // sizeRange: {
        //     label: "Size Range",
        //     key: "sizeRange",
        //     options: [
        //         { label: "XS", value: "xs" },
        //         { label: "S", value: "s" },
        //         { label: "M", value: "m"}
        //     ]
        // }
        // Add other brand-specific product filters here
    };

    // Handler for when a filter value changes
    const handleBrandProductFilterChange = (filters: Partial<Record<keyof BrandProductFilterQueries, string>>) => {
        setCurrentFilters(prevFilters => ({ ...prevFilters, ...filters }));
        console.log("Brand product filters changed:", { ...currentFilters, ...filters });
        // Here you would typically re-fetch brand-specific products based on these filters
        // or update a product display component.
    };

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
            <div className="container mx-auto my-8 p-4 h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Products by {brandDetails.name}</h2>
                <p className="text-gray-700 dark:text-gray-300">
                    Display products here based on filters: {JSON.stringify(currentFilters)}
                </p>
                {/* You would fetch and display the actual products here,
                    likely using another hook or API call that consumes `currentFilters` */}
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