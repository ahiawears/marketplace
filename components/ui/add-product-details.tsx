

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
    
const AddProductDetails = ({ productData, setProductData, onVariantSaved, savedStatus, userId, accessToken }: { productData: ProductUploadData, setProductData: React.Dispatch<React.SetStateAction<ProductUploadData>>, onVariantSaved: (index: number, isSaved: boolean) => void,  savedStatus: boolean[], userId: string | null, accessToken: string }) => {
    const [sizes, setSizes] = useState<string[]>([]);
    const [isFirstAccordionCompleted, setIsFirstAccordionCompleted] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [user_id, setUserId] = useState("");
    const [access_token, setAccessToken] = useState("");

    useEffect(() => {
        if (userId && accessToken) {
            setUserId(userId);
            setAccessToken(accessToken);
        }
    }, [userId, accessToken]);

    const handleNextAccordion = () => {
        setActiveIndex(activeIndex === 0 ? activeIndex + 1 : activeIndex); 
    };

    const productCurrency = productData.generalDetails.currency;
    const productCurrencySymbol = currency.find((c) => c.code === productCurrency)?.symbol || "";

    const setGeneralDetails = async (detailsInput: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => {
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
        //setIsFirstAccordionCompleted(true);
    };

    const setProductVariants = async (variants: ProductVariantType[] | ((prev: ProductVariantType[]) => ProductVariantType[])) => {
        const productIdg = "12314567";
        const resolvedDetails: ProductVariantType[] = 
            typeof variants === 'function' 
                ? variants(productData.productVariants) 
                : variants;

        setProductData((prev) => ({
            ...prev, 
            productVariants: resolvedDetails,
        }));
        const result = await uploadProductVariants(resolvedDetails, productIdg, accessToken);
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
    };

    const setProductShippingConfiguration = async (productShippingDetails: ProductShippingDeliveryType | ((prev: ProductShippingDeliveryType) => ProductShippingDeliveryType)) => {
        const productIdg = "12314567";

        const resolvedDetails: ProductShippingDeliveryType = 
            typeof productShippingDetails === 'function'
                ? productShippingDetails(productData.shippingDelivery)
                : productShippingDetails;

        setProductData((prev) => ({
            ...prev,
            shippingDelivery: resolvedDetails
        }));
        const result = await uploadProductShippingDetails(resolvedDetails, productIdg, accessToken);
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
    };

    const setCareInstructions = async (careInstructions: ProductCareInstruction | ((prev: ProductCareInstruction) => ProductCareInstruction)) => {
        const productIdg = "12314567";
        const resolvedDetails: ProductCareInstruction = 
            typeof careInstructions === 'function'
                ? careInstructions(productData.careInstructions)
                : careInstructions;

        setProductData((prev) => ({
            ...prev,
            careInstructions: resolvedDetails
        }));
        const result = await uploadProductCareInstruction( resolvedDetails, productIdg, accessToken );
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
    }
    
    const accordionItems = [
        {
            title: "General Product Details",
            content:<GeneralProductDetails 
                        generalDetails={productData.generalDetails} 
                        setGeneralDetails={setGeneralDetails}
                        onSaveAndContinue={handleNextAccordion}
                        userId={userId}
                        accessToken={accessToken}
                    />,
            disabled: false,
        }, 
        {
            title: "Add Product Variants",
            content: <ProductVariantForm 
                        variants={productData.productVariants} 
                        setVariants={setProductVariants} 
                        originalProductName={productData.generalDetails.productName} 
                        sizes={sizes} 
                        currencySymbol={productCurrencySymbol} 
                        category={productData.generalDetails.category}
                        onVariantSaved={onVariantSaved}
                        savedStatus={savedStatus}

                    />,
            //disabled: !isFirstAccordionCompleted,
            disabled: false,
        },
        {
            title: "Product Shipping Details",
            content: <ProductShippingDetails 
                        userId={user_id}
                        accessToken={access_token}
                        currencySymbol={productCurrencySymbol}
                        onSaveShippingDetails={setProductShippingConfiguration}
                    />,
            disabled: false,
        },
        {
            title: "Care Instructions",
            content: <CareInstructions
                        initialCareInstructions={productData.careInstructions}
                        onSaveCareinstructions={setCareInstructions}
                    />,
            disabled: false,
        }
    ];

    return (
        <div className="rounded-lg shadow-sm mx-auto">
            <Accordion 
                items={accordionItems} 
                activeIndex={activeIndex} 
                setActiveIndex={setActiveIndex}
            />
        </div>
    );
}

export default AddProductDetails
