"use client";

import { createContext, useContext, ReactNode } from 'react';
import { ProductUploadData } from '@/lib/types';

// Define the shape of the context state
export interface ProductFormContextType {
    productData: ProductUploadData;
    setProductData: React.Dispatch<React.SetStateAction<ProductUploadData>>;
    productId: string;
    setProductId: React.Dispatch<React.SetStateAction<string>>;
    isAllDetailsSaved: boolean;
    setIsAllDetailsSaved: React.Dispatch<React.SetStateAction<boolean>>;
    userId: string | null;
    accessToken: string;
    variantSavedStatus: boolean[];
    handleVariantSaved: (index: number, isSaved: boolean) => void;
}

// Create the context with a default value of undefined
const ProductFormContext = createContext<ProductFormContextType | undefined>(undefined);

// Create a provider component that will wrap our form
export const ProductFormProvider = ({ children, value }: { children: ReactNode, value: ProductFormContextType }) => {
    return (
        <ProductFormContext.Provider value={value}>
            {children}
        </ProductFormContext.Provider>
    );
};

// Create a custom hook for easy access to the context
export const useProductForm = (): ProductFormContextType => {
    const context = useContext(ProductFormContext);
    if (context === undefined) {
        throw new Error('useProductForm must be used within a ProductFormProvider');
    }
    return context;
};