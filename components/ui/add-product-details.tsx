

import { useEffect, useState } from "react";
import { currency } from "../../lib/currencyList";
import { GeneralProductDetailsType, ProductCareInstruction, ProductShippingDeliveryType, ProductUploadData, ProductVariantType } from "../../lib/types";
import ProductVariantForm from "../upload-product/product-variant-form";
import GeneralProductDetails from "../upload-product/general-product-details";
import Accordion from "./Accordion";
import React from "react";
import ProductShippingDetails from "../upload-product/product-shipping-details";
import CareInstructions from "../upload-product/care-instructions";
    
const AddProductDetails = ({ productData, setProductData, onVariantSaved, savedStatus, userId, accessToken }: { productData: ProductUploadData, setProductData: React.Dispatch<React.SetStateAction<ProductUploadData>>, onVariantSaved: (index: number, isSaved: boolean) => void,  savedStatus: boolean[], userId: string | null, accessToken: string | null }) => {
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

    const setGeneralDetails = (details: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => {
        setProductData((prev) => ({
            ...prev,
            generalDetails: typeof details === 'function' ? details(prev.generalDetails) : details,
        }));
        setIsFirstAccordionCompleted(true);
    };

    const setProductVariants = (variants: ProductVariantType[] | ((prev: ProductVariantType[]) => ProductVariantType[])) => {
        setProductData((prev) => ({
            ...prev, 
            productVariants: typeof variants === 'function' ? variants(prev.productVariants) : variants,
        }));
    };

    const setProductShippingConfiguration = (productShippingDetails: ProductShippingDeliveryType | ((prev: ProductShippingDeliveryType) => ProductShippingDeliveryType)) => {
        setProductData((prev) => ({
            ...prev,
            shippingDelivery: typeof productShippingDetails === 'function' ? productShippingDetails(prev.shippingDelivery) : productShippingDetails,
        }));
    };

    const setCareInstructions = (careInstructions: ProductCareInstruction | ((prev: ProductCareInstruction) => ProductCareInstruction)) => {
        setProductData((prev) => ({
            ...prev,
            careInstructions: typeof careInstructions === 'function' ? careInstructions(prev.careInstructions) : careInstructions,
        }));
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

    useEffect(() => {
        console.log("General Details updated:", productData);
    }, [productData]);

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
