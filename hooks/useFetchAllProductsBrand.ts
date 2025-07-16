import { ProductTableType } from "@/lib/types"
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

interface BrandProductsTableType {
    products: ProductTableType[];
    loading: boolean;
    error: Error | null;
    resetError: () => void;
}

export const useFetchAllProductsBrand = (brandId?: string): BrandProductsTableType => {
    const { userId, userSession, loading: authLoading, error: authError, resetError: authResetError } = useAuth();
    const [products, setProducts] = useState<ProductTableType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null); 

    const resetError = () => {
        setError(null);
    };

    useEffect(() => {
        // Wait for authentication to complete
        // If authentication is still loading, wait.
        if (authLoading) {
            setLoading(true); // Keep loading true while auth is in progress
            return;
        }

        // If there's an authentication error, set it and stop.
        if (authError) {
            setError(authError);
            setLoading(false); // Stop loading if auth failed
            return;
        }
        
        if (!userId || !userSession) {
            setError(new Error("User not authenticated"));
            return;
        }

        // If no brandId and no userId, can't fetch
        if (!brandId && (!userId || !userSession)) {
            setError(new Error("User not authenticated"));
            return;
        }

        // Determine the ID to use for fetching
        // Use brandId if provided, else use userId (assuming userId is the brand's id)

        const idToUse = brandId || userId;

        // If neither brandId nor userId is available, there's nothing to fetch.
        // This case should ideally be caught by the unauthenticated check above,
        // but it's a final safeguard if logic upstream allows an unauthenticated path.
        if (!idToUse) {
            setError(new Error("No brand ID or user ID available to fetch products."));
            setLoading(false);
            return;
        }

        const fetchProducts = async() => {

            setLoading(true); // Start loading before fetch
            setError(null); // Clear previous errors

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/fetch-brand-products?brandId=${idToUse}`,
                    {
                        headers: {
                            Authorization: `Bearer ${userSession?.access_token ?? ""}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                    throw new Error(errorData.message || `Error fetching shipping config: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.error) throw new Error(data.error);
                const mappedProducts: ProductTableType[] = (data.data || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category_name: item.category_id.name,
                    subCategory: item.subcategory_id.name,
                    season: item.season_id.name,
                }));

                setProducts(mappedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError(error instanceof Error ? error : new Error("An unexpected error occurred"));
            }
            finally {
                setLoading(false);
            }
        }

        fetchProducts();
        
    }, [userId, userSession, authLoading, authError, brandId]);

    return {
        products, loading, error, resetError
    };
}