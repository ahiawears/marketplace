import { BrandProductFilterQueries, ProductListItemsDataType } from "@/lib/types";
import { useEffect, useState } from "react";

interface ProductsHookResult {
    loading: boolean;
    error: Error | null;
    products: ProductListItemsDataType[] | null;
    totalProducts: number;
}

export const useGetProducts = (filters: Partial<Record<string, string>> = {}, brandId?: string): ProductsHookResult => {
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);
    const [ products, setProducts ] = useState<ProductListItemsDataType[] | null>(null);
    const [ totalProducts, setTotalProducts ] = useState<number>(0);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams();
                // Add brandId to query params if it exists
                if (brandId) {
                    queryParams.append('brandId', brandId);
                }
                for (const key in filters) {
                    // Ensure the key belongs to the object and the value is not null/undefined
                    if (Object.prototype.hasOwnProperty.call(filters, key)) {
                        const value = filters[key];
                        // Only append the filter if it has a value (is not an empty string)
                        if (value) {
                            queryParams.append(key, value);
                        }
                    }
                }
                const url = `/api/getProducts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.statusText}`);
                }
                // const data: ProductListItemsDataType[] = await response.json();
                const data = await response.json();
                setProducts(data.data.products);
                setTotalProducts(data.data.totalPublishedVariantsCount || 0);
            } catch (error) {
                setError(error instanceof Error ? error : new Error("An unexpected error occurred"));
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();

    }, [JSON.stringify(filters), brandId]);
    return { loading, error, products, totalProducts };
}