import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { ProductUploadData } from "@/lib/types";

interface ProductDetailsType {
    loading: boolean;
    error: Error | null;
    resetError: () => void;
    productDetails: any;
}

export const useGetProductDetails = (id: string, getProductType: string, accessToken?: string): ProductDetailsType => {
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);
    const [ productData, setProductData ] = useState<any>(null);

    const resetError = () => {
        setError(null);
    }
    useEffect(() => {
        if (!id || !getProductType) {
            if (!id) setError(new Error("Product ID is missing."));
            if (!getProductType) setError(new Error("Product fetch type is missing."));
            //setLoading(false);
            return;
        }

        const fetchProductDetails = async() => {
            setLoading(true);
            setError(null);
            switch (getProductType) {
                case "getProductForEdit":
                    if (accessToken === "") setError(new Error("User not authenticated."));

                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-product?productId=${id}&getProductType=${getProductType}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                }
                            }
                        );
                        if (!response.ok) {
                            throw new Error(`${response.status}`);
                        }
                        const data = await response.json();
                        if(data.success) {
                            const productDetails = data.data;
                            console.log("Fetched product details for edit:", productDetails);
                            setProductData(productDetails);
                        } else {
                            console.error("Error fetching product details:", data.message);
                            throw new Error(data.message);
                        }
                    } catch (fetchError) {
                        console.error("Error fetching product details for edit:", fetchError);
                        setError(fetchError instanceof Error ? fetchError : new Error("An unknown error occurred"));
                    } finally {
                        setLoading(false);
                    }
                    break;

                case "getProductDetails":
                    try {
                        const response = await fetch(`/api/getProductById?id=${id}`);
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);                        
                        }
                        const data = await response.json();
                        if (data.success) {
                            setProductData(data);
                        }
                    } catch (error) {
                        setError(error instanceof Error ? error : new Error("An unknown error occurred"));  
                    } finally {
                        setLoading(false);
                    }
                    break;
                default:
                    setError(new Error(`Unknown getProductType: ${getProductType}`));
                    setLoading(false);
                    break;
            }   
        }
        fetchProductDetails();
        
    }, [getProductType, id, accessToken]);
    return { loading, error, resetError, productDetails: productData };
}