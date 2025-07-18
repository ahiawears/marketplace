import { BrandLegalDetails } from "@/lib/types";
import { useEffect, useState } from "react"

interface BrandGetDetailsType {
    error: Error | null;
    loading: boolean;
    resetError: () => void;
    brandData: BrandLegalDetails | undefined;
}

export const useBrandGetDetails = (brandId: string, dataName: string, accessToken: string): BrandGetDetailsType => {
    const [mappedData, setMappedData] = useState<BrandLegalDetails | undefined>(undefined);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const resetError = () => {
        setError(null);
    };

    useEffect(() => {
        const getBrandDetails = async() => {
            // Reset state on new fetch
            setLoading(true);
            setError(null);
            setMappedData(undefined);
            try {
                const response = await fetch (`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-details?data_name=${dataName}&brandId=${brandId}`, 
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                )

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Couldn't create a connection with the server");
                }

                const dataFromDb = await response.json();
                console.log("The data from the db ", dataFromDb.data);

                if (!dataFromDb.data) {
                    throw new Error("No data found for the user, please try again");
                }

                switch (dataName) {
                    case "legal-details":
                        const legalDetails: BrandLegalDetails = {
                            business_registration_name: dataFromDb.data.business_registration_name,
                            business_registration_number: dataFromDb.data.business_registration_number,
                            country_of_registration: dataFromDb.data.country_of_registration,
                        };
                        setMappedData(legalDetails);
                        break;
                
                    default:
                        setError(new Error(`Unsupported dataName: ${dataName}`));
                        setMappedData(undefined);
                }

            } catch (error) {
                setError(error instanceof Error ? error : new Error("An unexpected error occurred"));
                setMappedData(undefined);
            } finally {
                setLoading(false);
            }
        }

        if (brandId && dataName && accessToken) {
            getBrandDetails();

        } else {
            setLoading(false);
            setMappedData(undefined);
            setError(null);
        }
    }, [brandId, dataName, accessToken]);

    return { error, loading, resetError, brandData: mappedData };

}