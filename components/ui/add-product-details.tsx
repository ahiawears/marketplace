

import { useEffect, useState } from "react";
import { currency } from "../../lib/currencyList";
import { GeneralProductDetailsType, ProductCareInstruction, ProductShippingDeliveryType, ProductUploadData, ProductVariantType } from "../../lib/types";
import ProductVariantForm from "../upload-product/product-variant-form";
import GeneralProductDetails from "../upload-product/general-product-details";
import Accordion from "./Accordion";
import React from "react";
import ProductShippingDetails from "../upload-product/product-shipping-details";
import CareInstructions from "../upload-product/care-instructions";
import { uploadGeneralDetails, uploadProductCareInstruction, uploadProductShippingDetails, uploadProductVariant } from "@/actions/add-product/publish-product-action";
import LoadContent from "@/app/load-content/page";
import { toast } from "sonner";
import { useProductForm } from "@/app/contexts/product-form-context";
import { useBrandGetDetails } from "@/hooks/useBrandGetDetails"
import { useParams, useSearchParams } from "next/navigation";


interface SaveStatus {
    general: boolean;
    variants: boolean;
    shipping: boolean;
    care: boolean;
}
    
const AddProductDetails: React.FC = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const editProductId = (params.id as string) || (searchParams.get('id') as string || "");
    const { 
        productData, 
        setProductData, 
        handleVariantSaved: onVariantSaved, 
        variantSavedStatus: savedStatus, 
        userId, 
        accessToken, 
        productId, 
        setProductId, 
        setIsAllDetailsSaved 
    } = useProductForm();

    const { 
        error: legalDetailsError, 
        loading: legalDetailsLoading, 
        resetError: resetLegalDetailsError, 
        brandData: legalDetails 
    } = useBrandGetDetails(userId!, "legal-details", accessToken!);

    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [savingVariantIndex, setSavingVariantIndex] = useState<number | null>(null);
    const [userCurrency, setUserCurrency] = useState<string>("");

    const [saveStatus, setSaveStatus] = useState<SaveStatus>({
        general: false, variants: false, shipping: false, care: false
    });

    const getCurrencySymbol = (code: string): string => {
        const c = currency.find(curr => curr.code === code);
        return c ? c.symbol : '$';
    };

    useEffect(() => {
        const getBrandDetails = async () => {
            try {
                const brand_country = legalDetails?.country_of_registration
                const brandCurrency = currency.find((c) => c.country_alpha === brand_country);
                if (brandCurrency) {
                    setProductData(prev => ({
                        ...prev,
                        generalDetails: { ...prev.generalDetails, currency: brandCurrency.code }
                    }));
                    setUserCurrency(brandCurrency.code);
                }   
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(`Could not load brand settings: ${error.message}`);
                } else {
                    toast.error("An unexpected error occurred while fetching brand settings.");
                }
            }
        }
        if(legalDetails !== null){
            getBrandDetails();
        }
        
    }, [legalDetails]);

    const productCurrencySymbol = getCurrencySymbol(productData.generalDetails.currency);

    const setGeneralDetails = async (detailsInput: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => {
        setLoading(true);
        try {
            // Resolve detailsInput to the actual GeneralProductDetailsType object
            const resolvedDetails: GeneralProductDetailsType = 
                typeof detailsInput === 'function' 
                    ? detailsInput(productData.generalDetails) 
                    : detailsInput;

            const result = await uploadGeneralDetails(resolvedDetails, accessToken, editProductId);

            if (result.success) {
                toast.success("General details saved successfully!");
                setProductId(result.data);
                // Update context state only on success
                setProductData((prev) => ({
                    ...prev,
                    generalDetails: resolvedDetails,
                }));
                setSaveStatus(prev => ({ ...prev, general: true }));
                setActiveIndex(1);
            } else {
                // Handle controlled error from the action (e.g., validation failure)
                toast.error(`Failed to save details: ${result.message}`);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");

        } finally {
            setLoading(false);
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

    // This below function is used to save a single variant or all variants
    const saveSingleVariant = async (variantIndex: number) => {
        if (!productId) {
            toast.error("Cannot save variant. Product ID is missing. Please complete the general details step first.");
            return;
        }

        const variant = productData.productVariants[variantIndex];
        if (!variant) {
            toast.error(`Variant at index ${variantIndex} not found.`);
            return;
        }

        setSavingVariantIndex(variantIndex);
        try {
            const result = await uploadProductVariant(variant, productId, userCurrency, accessToken);
            if (result.success) {
                toast.success("Variant saved successfully!");
                onVariantSaved(variantIndex, true); // Notify that a specific variant is saved
            } else {
                toast.error(`Failed to save variant: ${result.message}`);
                onVariantSaved(variantIndex, false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred while saving the variant.");
        } finally {
            setSavingVariantIndex(null);
        }
    }
    // This above function is used to save a single variant or all variants


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
                toast.success("Shipping details saved successfully!");
                setSaveStatus(prev => ({ ...prev, shipping: true }));
                setActiveIndex(3); // Open next accordion
            } else {
                // Handle error from the action (e.g., show a message)
                toast.error(`Failed to save shipping details: ${result.message}`);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
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
                toast.success("Care instructions saved successfully!");
                setSaveStatus(prev => ({ ...prev, care: true }));
            } else {
                // Handle error from the action (e.g., show a message)
                toast.error(`Failed to save care instructions: ${result.message}`);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
        }
    }

    useEffect(() => {
        const allGeneralDetailsSaved = saveStatus.general;
        const allVariantsSaved = productData.productVariants.length > 0 &&
                                 productData.productVariants.length === savedStatus.length &&
                                 savedStatus.every(s => s);

        // Update variant save status
        if (allVariantsSaved !== saveStatus.variants) {
            setSaveStatus(prev => ({ ...prev, variants: allVariantsSaved }));
        }

        const allSaved = allGeneralDetailsSaved && allVariantsSaved && saveStatus.shipping && saveStatus.care;        setIsAllDetailsSaved(allSaved);
    }, [saveStatus, productData.productVariants, savedStatus, setIsAllDetailsSaved]);
    
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
                        saveVariant={saveSingleVariant}
                        savingVariantIndex={savingVariantIndex}

                    />,
            // disabled: !saveStatus.general,
            disabled: false,
        },
        {
            title: "Product Shipping Details",
            content: <ProductShippingDetails 
                        userId={userId!}
                        accessToken={accessToken}
                        currencySymbol={productCurrencySymbol}
                        productId={productId}
                        editProductShippingDetails={productData.shippingDelivery}
                        onSaveShippingDetails={setProductShippingConfiguration}
                    />,
            // disabled: !saveStatus.general || !saveStatus.variants,
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
            // disabled: !saveStatus.general || !saveStatus.variants || !saveStatus.shipping,
            disabled: false,
        }
    ];

    if (loading || legalDetailsLoading) {
        return <LoadContent />
    }

    if(legalDetailsError) {
        toast.error(`Error getting the brand details: ${legalDetailsError.message}`)
    }
    return (
        <div className="rounded-lg shadow-sm ">
            <Accordion 
                items={accordionItems} 
                activeIndex={activeIndex} 
                setActiveIndex={setActiveIndex}
            />
        </div>
    );
}

export default AddProductDetails