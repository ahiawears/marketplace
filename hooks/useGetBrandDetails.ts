import { useState, useEffect } from "react";

interface BrandDetails {
    id: string;
    name: string;
    description: string;
    logo: string;
    banner: string;
    country_of_registration: string;
    social_links: {
        website: string;
        instagram: string;
        facebook: string;
        twitter: string;
        tiktok: string;
    }
}

interface BrandDetailsHookResult {
    loading: boolean;
    error: Error | null;
    brandDetails: BrandDetails | null; 
}

export const useGetBrandDetails = (brandId: string): BrandDetailsHookResult => {
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);
    const [ brandDetails, setBrandDetails ] = useState<BrandDetails | null>(null); // Corrected variable name

    useEffect(() => {
        const fetchBrandDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/getBrandDetails?id=${brandId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if(data.data === null){
                    setBrandDetails(null);
                }
                setBrandDetails(data.data); 
            } catch (error) {
                setError(error instanceof Error ? error : new Error("An unexpected error occurred"));
            } finally {
                setLoading(false);
            }
        };
        if (brandId) { 
            fetchBrandDetails();
        }
    }, [brandId])
    return { loading, error, brandDetails };
}