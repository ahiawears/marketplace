import { FC, useState } from "react";
import { Info } from "lucide-react";
import GeneralDetailsForm from "./general-details-form";
import Accordion from "@/components/ui/Accordion";
import { Button } from "@/components/ui/button";
import VariantDetailsForm from "./variants-details-form";
import ShippingDetailsForm from "./shipping-details-form";
import { ShippingDetails } from '@/lib/types';
import CareDetailsForm from "./care-details-form";
import ReturnPolicyDetailsForm from "./return-policy-details-form";

type ProductMode = "single" | "multi-variant";

interface ProductFormProps {
    currencyCode: string;
    todayExchangeRate?: number;
    shippingConfig: ShippingDetails | null;
}
const ProductForm: FC<ProductFormProps> = ({ currencyCode, todayExchangeRate, shippingConfig }) => {
    const [productMode, setProductMode] = useState<ProductMode>("multi-variant");
    
    // State for the active indices in each mode
    const [multiVariantActiveIndices, setMultiVariantActiveIndices] = useState<number | null>(0); 
    const [singleProductActiveIndices, setSingleProductActiveIndices] = useState<number | null>(0); 

    const multiVariantAccordionItems = [
        {
            title: "General Product Details",
            content: <GeneralDetailsForm />,
            disabled: false
        },
        {
            title: "Variants Details", 
            content: <VariantDetailsForm 
                currencyCode={currencyCode}
                todayExchangeRate={todayExchangeRate}
            />,
            disabled: false
        },
        {
            title: "Shipping Details",
            content: <ShippingDetailsForm 
                shippingConfig={shippingConfig}
                currencySymbol={currencyCode}
            />,
            disabled: false
        },
        {
            title: "Care Instructions",
            content: <CareDetailsForm />,
            disabled: false,
        },
        {
            title: "Return Policy",
            content: <ReturnPolicyDetailsForm 
                currencySymbol={currencyCode}
            />,
            disabled: false,
        }
    ]

    const singleProductAccordionItems = [
        {
            title: "Product Details",
            content: <GeneralDetailsForm />,
            disabled: false
        },
    ];

    // Helper function to handle mode changes and reset accordion state
    const handleModeChange = (mode: ProductMode) => {
        setProductMode(mode);
        // You could also reset the state here if you want to close them all
        // setMultiVariantActiveIndices([]);
        // setSingleProductActiveIndices([]);
    };

    return (
        <div className="shadow-sm">
            <div className="my-4 p-4 bg-gray-50 border-2" role="alert">
                <div className="flex items-start">
                    <Info className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                        {currencyCode === "USD" ? (
                            <p className="text-sm">All prices should be entered and will be stored in USD.</p>
                        ) : (
                            <p className="text-sm">
                                Please enter prices in <span className="font-semibold">{currencyCode}</span>. They will be converted and stored in <span className="font-semibold">USD</span> based on today&apos;s exchange rate: 
                                <strong className="ml-1">1 USD = {todayExchangeRate} {currencyCode}</strong>.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-medium">Product Type:</span>
                <Button 
                    variant={productMode === "single" ? "default" : "outline"}
                    onClick={() => handleModeChange("single")}
                    className="mx-2 border-2"
                >
                    Single Product
                </Button>
                <Button 
                    variant={productMode === "multi-variant" ? "default" : "outline"}
                    onClick={() => handleModeChange("multi-variant")}
                    className="mx-2 border-2"
                >
                    Multi-Variant Product
                </Button>
            </div>

            {productMode === "single" ? (
                <Accordion 
                    items={singleProductAccordionItems} 
                    activeIndex={singleProductActiveIndices} 
                    setActiveIndex={setSingleProductActiveIndices}
                />
            ) : (
                <Accordion 
                    items={multiVariantAccordionItems} 
                    activeIndex={multiVariantActiveIndices} 
                    setActiveIndex={setMultiVariantActiveIndices}
                />
            )}
        </div>
    );
}

export default ProductForm;