

import { useEffect, useState } from "react";
import { currency } from "../../lib/currencyList";
import { GeneralProductDetailsType, ProductCareInstruction, ProductShippingDeliveryType, ProductUploadData, ProductVariantType } from "../../lib/types";
import ProductVariantForm from "../upload-product/product-variant-form";
import GeneralProductDetails from "../upload-product/general-product-details";
import Accordion from "./Accordion";
import React from "react";
import ProductShippingDetails from "../upload-product/product-shipping-details";
import CareInstructions from "../upload-product/care-instructions";
import { uploadGeneralDetails, uploadProductCareInstruction, uploadProductShippingDetails, uploadProductVariants } from "@/actions/add-product/publish-product-action";
import LoadContent from "@/app/load-content/page";

interface AddProductDetailsProps {
    productData: ProductUploadData;
    setProductData: React.Dispatch<React.SetStateAction<ProductUploadData>>;
    onVariantSaved: (index: number, isSaved: boolean) => void;
    savedStatus: boolean[];
    userId: string | null;
    accessToken: string;
    setMainProductId: (id: string) => void;
    setIsAllDetailsSaved: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SaveStatus {
    general: boolean;
    variants: boolean;
    shipping: boolean;
    care: boolean;
}
    
const AddProductDetails: React.FC<AddProductDetailsProps> = ({ productData, setProductData, onVariantSaved, savedStatus, userId, accessToken, setMainProductId, setIsAllDetailsSaved }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [productId, setProductId] = useState<string>("");
    const [product_currency, setProductCurrency] = useState<string>("");
    const [productCurrencySymbol, setProductCurrencySymbol] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [savingVariantIndex, setSavingVariantIndex] = useState<number | null>(null);

    const [ generalDetailsSaved, setGeneralDetailsSaved ] = useState<boolean>(false);
    const [ productVariantsSaved, setProductVariantsSaved ] = useState<boolean>(false);
    const [ productShippingSaved, setProductShippingSaved ] = useState<boolean>(false);
    const [ careInstructionsSaved, setCareInstructionsSaved ] = useState<boolean>(false);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>({
        general: false, variants: false, shipping: false, care: false
    });

    useEffect(() => {
        if (userId && accessToken) {
            const getBrandDetails = async () => {
                const dataName = "legal-details";
                try {
                    const response = await fetch (`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-details?data_name=${dataName}&userId=${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            }
                        }
                    )
    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Couldn't create a connection with the server");
                    }
    
                    const data = await response.json();
    
                    if (!data.data) {
                        throw new Error("No data found for the user, please try again");
                    }

                    const brand_country = data.data.country_of_registration;
                    const brandCurrency = currency.find((c) => c.country_alpha === brand_country);
                    if (brandCurrency) {
                        setProductCurrency(brandCurrency?.code.toString());
                        setProductCurrencySymbol(brandCurrency?.symbol.toString());
                        
                    }    
                } catch (error) {
                    //set error here
                    if (error instanceof Error) {
                        console.error("Error fetching brand details:", error.message);
                        //setErrorMessage(error.message || "An error occurred while fetching brand details.");
                    } else {
                        console.log("An unexpected error occurred.");
                        //setErrorMessage("An unexpected error occurred.");
                    }
                }
            }
            getBrandDetails();
        }
    }, [userId, accessToken]);

    const handleNextAccordion = () => {
        setActiveIndex(activeIndex === 0 ? activeIndex + 1 : activeIndex); 
    };


    const setGeneralDetails = async (detailsInput: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => {
        setLoading(true);
        setError(null);
        try {
            // Resolve detailsInput to the actual GeneralProductDetailsType object
            const resolvedDetails: GeneralProductDetailsType = 
                typeof detailsInput === 'function' 
                    ? detailsInput(productData.generalDetails) 
                    : detailsInput;

            setProductData((prev) => ({
                ...prev,
                generalDetails: resolvedDetails,
            }));

            const result = await uploadGeneralDetails(resolvedDetails, accessToken);

            if (result.success) {
                console.log("General details saved, Product ID:", result.data);
                setProductId(result.data); 
                setMainProductId(result.data);
                setSaveStatus(prev => ({ ...prev, general: true }));
                setActiveIndex(1); // Open next accordion
            } else {
                // Handle controlled error from the action (e.g., validation failure)
                console.error("Failed to upload general details:", result.message);
                setError(result.message);
            }
        } catch (error) {
            console.error("An unexpected error occurred during general details upload:", error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const setProductVariants = async (variants: ProductVariantType[] | ((prev: ProductVariantType[]) => ProductVariantType[])) => {
        if (productId !== null ) {
            const resolvedDetails: ProductVariantType[] = 
            typeof variants === 'function' 
                ? variants(productData.productVariants) 
                : variants;

            setProductData((prev) => ({
                ...prev, 
                productVariants: resolvedDetails,
            }));
            const result = await uploadProductVariants(resolvedDetails, productId, product_currency, accessToken);
            try {
                if (result.success) {
                    console.log(result.message);
                } else {
                    // Handle error from the action (e.g., show a message)
                    console.error("Failed to upload general details:", result.message);
                }
            } catch (error) {
                console.error("Error during general details upload:", error);
            }
            
        } else {
            //let the accordionn be locked, BUT YOU ARE STILL TESTING
        }
        
    };

     // This function ONLY updates the local component state
    const updateLocalVariants = (variants: ProductVariantType[] | ((prev: ProductVariantType[]) => ProductVariantType[])) => {
        const resolvedVariants = typeof variants === 'function'
            ? variants(productData.productVariants)
            : variants;

        setProductData(prev => ({
            ...prev,
            productVariants: resolvedVariants,
        }));
    };

    // This function handles the API call to save all variants
    const saveProductVariants = async (variantIndex?: number) => {
        if (!productId) {
            setError("Cannot save variants. Product ID is missing. Please complete the general details step first.");
            return;
        }

        let variantsToSave: ProductVariantType[];

        if (typeof variantIndex === 'number') {
            // Logic to save a single variant
            const variant = productData.productVariants[variantIndex];
            if (!variant) {
                setError(`Variant at index ${variantIndex} not found.`);
                return;
            }
            variantsToSave = [variant];
        } else {
            // Logic to save all variants (e.g., for a "Save and Continue" button)
            if (productData.productVariants.length === 0) {
                setError("Please add at least one variant to save.");
                return;
            }
            variantsToSave = productData.productVariants;
        }

        console.log("Uploading variants:", variantsToSave);

        // Use per-variant loading state if saving a single variant
        if (typeof variantIndex === 'number') {
            setSavingVariantIndex(variantIndex);
        } else {
            setLoading(true); // Use global loading for "save all"
        }
        setError(null);

        try {
            const result = await uploadProductVariants(variantsToSave, productId, product_currency, accessToken);
            if (result.success) {
                console.log("Product variants saved successfully:", result.message);
                setProductVariantsSaved(true);     
                if (typeof variantIndex === 'number') {
                    onVariantSaved(variantIndex, true); // Notify that a specific variant is saved
                } else {
                    setSaveStatus(prev => ({ ...prev, variants: true }));
                    setActiveIndex(2); // Move to next accordion on "save all"                
                }    
            } else {
                setError(result.message);
                if (typeof variantIndex === 'number') {
                    onVariantSaved(variantIndex, false);
                }
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred while saving variants.");
        } finally {
            // Reset the correct loading state
            if (typeof variantIndex === 'number') {
                setSavingVariantIndex(null);
            } else {
                setLoading(false);
            }
        }
    };

    const setProductShippingConfiguration = async (productShippingDetails: ProductShippingDeliveryType | ((prev: ProductShippingDeliveryType) => ProductShippingDeliveryType)) => {
        const resolvedDetails: ProductShippingDeliveryType = 
            typeof productShippingDetails === 'function'
                ? productShippingDetails(productData.shippingDelivery)
                : productShippingDetails;

        setProductData((prev) => ({
            ...prev,
            shippingDelivery: resolvedDetails
        }));
        const result = await uploadProductShippingDetails(resolvedDetails, accessToken);
        try {
            if (result.success) {
                console.log("Shipping details saved:", result.message);
                setSaveStatus(prev => ({ ...prev, shipping: true }));
                setActiveIndex(3); // Open next accordion
            } else {
                // Handle error from the action (e.g., show a message)
                console.error("Failed to upload general details:", result.message);
            }
        } catch (error) {
            console.error("Error during general details upload:", error);
        }
    };

    const setCareInstructions = async (careInstructions: ProductCareInstruction | ((prev: ProductCareInstruction) => ProductCareInstruction)) => {
        const resolvedDetails: ProductCareInstruction = 
            typeof careInstructions === 'function'
                ? careInstructions(productData.careInstructions)
                : careInstructions;

        setProductData((prev) => ({
            ...prev,
            careInstructions: resolvedDetails
        }));
        const result = await uploadProductCareInstruction( resolvedDetails, accessToken );
        try {
            if (result.success) {
                console.log("Care instructions saved:", result.message);
                setSaveStatus(prev => ({ ...prev, care: true }));
            } else {
                // Handle error from the action (e.g., show a message)
                console.error("Failed to upload general details:", result.message);
            }
        } catch (error) {
            console.error("Error during general details upload:", error);
        }
    }

    useEffect(() => {
        if ((generalDetailsSaved && productVariantsSaved && productShippingSaved && careInstructionsSaved) === true){
            setIsAllDetailsSaved(true);
        }
    }, [generalDetailsSaved, productVariantsSaved, productShippingSaved, careInstructionsSaved]);
    
    const accordionItems = [
        {
            title: "General Product Details",
            content:<GeneralProductDetails 
                        generalDetails={productData.generalDetails} 
                        setGeneralDetails={setGeneralDetails}
                        userId={userId}
                        accessToken={accessToken}
                    />,
            disabled: false,
        }, 
        {
            title: "Add Product Variants",
            content: <ProductVariantForm 
                        variants={productData.productVariants} 
                        setVariants={updateLocalVariants} 
                        originalProductName={productData.generalDetails.productName} 
                        productId={productId}
                        currencySymbol={productCurrencySymbol} 
                        category={productData.generalDetails.category}
                        onVariantSaved={onVariantSaved}
                        savedStatus={savedStatus}
                        saveVariant={saveProductVariants}
                        savingVariantIndex={savingVariantIndex}

                    />,
            //disabled: !isFirstAccordionCompleted,
            disabled: false,
        },
        {
            title: "Product Shipping Details",
            content: <ProductShippingDetails 
                        userId={userId!}
                        accessToken={accessToken}
                        currencySymbol={productCurrencySymbol}
                        productId={productId}
                        onSaveShippingDetails={setProductShippingConfiguration}
                    />,
            disabled: false,
        },
        {
            title: "Care Instructions",
            content: <CareInstructions
                        initialCareInstructions={productData.careInstructions}
                        onSaveCareinstructions={setCareInstructions}
                        productId={productId}
                        userId={userId!}
                        accessToken={accessToken}
                    />,
            disabled: false,
        }
    ];

    if (loading) {
        return <LoadContent />
    }

    return (
        <div className="rounded-lg shadow-sm mx-auto">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <Accordion 
                items={accordionItems} 
                activeIndex={activeIndex} 
                setActiveIndex={setActiveIndex}
            />
        </div>
    );
}

export default AddProductDetails
