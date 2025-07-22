// hooks/useGetAllBrands.ts (This is a Client Component Hook)
import { useState, useEffect } from "react";

interface Brand {
    id: string;
    name: string;
    description: string;
    logo: string;
    banner: string;
    legal_details: {
        business_registration_name: string;
        business_registration_number: string;
        country_of_registration: string;
    } | null; // This is crucial: legal_details can be null
}

interface BrandsResponse {
    success: boolean;
    message: string;
    data: Brand[] | null;
}

export const useGetAllBrands = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [brands, setBrands] = useState<Brand[] | null>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true);
            setError(null);
            try {
                // Call your API Route here
                const response = await fetch("/api/getAllBrands"); 

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const result: BrandsResponse = await response.json();

                if (result.success) {
                    setBrands(result.data);
                } else {
                    throw new Error(result.message || "Failed to fetch brands.");
                }

            } catch (error) {
                setError(error instanceof Error ? error : new Error("An unexpected error occurred"));
                console.error("Error in useGetAllBrands:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    return { loading, error, brands };
};