import { FC, useState } from "react";
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
    shippingConfig: ShippingDetails | null;
}
const ProductForm: FC<ProductFormProps> = ({ currencyCode, shippingConfig }) => {
    const [productMode, setProductMode] = useState<ProductMode>("multi-variant");
    
    // State for the active indices in each mode
    const [multiVariantActiveIndices, setMultiVariantActiveIndices] = useState<number | null>(0); // Open both by default
    const [singleProductActiveIndices, setSingleProductActiveIndices] = useState<number | null>(0); // Open the single one by default

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
            title: "Refund Policy",
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
        <div className="rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-medium">Product Type:</span>
                <Button 
                    variant={productMode === "single" ? "default" : "outline"}
                    onClick={() => handleModeChange("single")}
                >
                    Single Product
                </Button>
                <Button 
                    variant={productMode === "multi-variant" ? "default" : "outline"}
                    onClick={() => handleModeChange("multi-variant")}
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