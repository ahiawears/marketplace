

import { useEffect, useState } from "react";
import { currency } from "@/lib/currencyList";
import { GeneralProductDetailsType, ProductUploadData, ProductVariantType } from "@/lib/types";
import ProductVariantForm from "../upload-product/product-variant-form";
import GeneralProductDetails from "../upload-product/general-product-details";
import Accordion from "./Accordion";
import MainProductForm from "../upload-product/main-product-form";
    
const AddProductDetails = ({ productData, setProductData }: { productData: ProductUploadData, setProductData: React.Dispatch<React.SetStateAction<ProductUploadData>> }) => {
    const [sizes, setSizes] = useState<string[]>([]);
    const [isFirstAccordionCompleted, setIsFirstAccordionCompleted] = useState(false);
    const [isSecondAccordionCompleted, setIsSecondAccordionCompleted] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Gather all form data
        // const productData = {
        //     generalDetails, // Include general details
        //     // Add other state variables here, e.g., images, variants, etc.
        // };

        console.log("Product Data Submitted:", productData);

        // TODO: Send `productData` to the backend or further processing
    };

    const handleNextAccordion = () => {
        setActiveIndex(1); // Open the second accordion (index 1)
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

    const setProductInformation = (info: ProductVariantType | ((prev: ProductVariantType) => ProductVariantType)) => {
        setProductData((prev) => ({
            ...prev,
            productInformation: typeof info === 'function' ? info(prev.productInformation) : info,
        }));
        setIsSecondAccordionCompleted(true);
        setIsFirstAccordionCompleted(false);
    };
    
    const accordionItems = [
        {
            title: "General Product Details",
            content: <GeneralProductDetails 
                generalDetails={productData.generalDetails} 
                setGeneralDetails={setGeneralDetails}
                onSaveAndContinue={handleNextAccordion} 
            />,
            disabled: false,
        }, 
        {
            title: "Product Information",
            content: <MainProductForm 
                productInformation={productData.productInformation} 
                setProductInformation={setProductInformation} 
                originalProductName={productData.generalDetails.productName} 
                sizes={sizes} 
                currencySymbol={productCurrencySymbol} 
                category={productData.generalDetails.category}
                onSaveAndContinue={handleNextAccordion}
            />,
            disabled: !isFirstAccordionCompleted,
        },
        {
            title: "Add Product Variants",
            content: <ProductVariantForm variants={productData.productVariants} setVariants={setProductVariants} originalProductName={productData.generalDetails.productName} sizes={sizes} currencySymbol={productCurrencySymbol} category={productData.generalDetails.category}/>,
            disabled: !isSecondAccordionCompleted && !isFirstAccordionCompleted,
        }
    ];

    useEffect(() => {
        console.log("General Details updated:", productData);
    }, [productData]);

    return (
        <div className="border-2 rounded-lg shadow-sm mx-auto">
            <form onSubmit={handleSubmit}>
                <Accordion items={accordionItems} activeIndex={activeIndex} setActiveIndex={setActiveIndex}/>
            </form>
        </div>
    );
}

export default AddProductDetails