"use client";

// useProductDetails.ts
import { fetchProductById } from '@/lib/brandUpdateProduct';
import { useEffect, useState } from 'react';

// Define a type for the product if available (example below)
interface Product {
    category: string;
    subCategory: string;
    tags?: string[];
    sku: string;
    images?: string[];
    sizes: { name: string; quantity: number }[];
}

const useProductDetails = ( id: string) => {

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sku, setSku] = useState<string>('');
    const [images, setImages] = useState<string[]>(["", "", "", ""]);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const fetchProductDetails = async () => {
        const id: Product | null = await fetchProductById(id); // Replace with actual fetch function
        if (product) {
            setSelectedCategory(product.category);
            setSelectedSubcategory(product.subCategory);
            setSelectedTags(product.tags || []);
            setSku(product.sku);
            setImages(product.images || ["", "", "", ""]);
            setQuantities(
                product.sizes.reduce((acc, size) => ({ ...acc, [size.name]: size.quantity }), {})
            );
        }
    };

    return {
        selectedCategory,
        selectedSubcategory,
        selectedTags,
        sku,
        images,
        quantities,
    };
};

export default useProductDetails;
