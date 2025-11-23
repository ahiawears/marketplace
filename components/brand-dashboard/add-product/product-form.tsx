import { FC, useMemo, useState } from "react";
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
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    // Accordion Item Definitions
    const multiVariantItems = useMemo(() => 
        [
            {
                title: "General Product Details",
                content: <GeneralDetailsForm />,
            },
            {
                title: "Variants Details",
                content: (
                    <VariantDetailsForm
                        currencyCode={currencyCode}
                        todayExchangeRate={todayExchangeRate}
                    />
                ),
            },
            {
                title: "Shipping Details",
                content: (
                    <ShippingDetailsForm
                        shippingConfig={shippingConfig}
                        currencySymbol={currencyCode}
                    />
                ),
            },
            {
                title: "Care Instructions",
                content: <CareDetailsForm />,
            },
            {
                title: "Return Policy",
                content: (
                    <ReturnPolicyDetailsForm currencySymbol={currencyCode} />
                ),
            },
        ],
        [currencyCode, todayExchangeRate, shippingConfig]
    );

    const singleVariantItems = useMemo(() => 
        [
            {
                title: "Product Details",
                content: <GeneralDetailsForm />,
            },
        ],
        []
    );

    // Select proper items based on mode
    const accordionItems =
        productMode === "single" ? singleVariantItems : multiVariantItems;

    // Reset accordion when switching mode for clean UX
    const handleModeChange = (mode: ProductMode) => {
        setProductMode(mode);
        setActiveIndex(0);
    };

    // Currency Banner Component
    const CurrencyBanner = () => (
        <div className="my-4 p-4 bg-gray-50 border-2 rounded-md" role="alert">
            <div className="flex items-start">
                <Info className="h-5 w-5 mr-3 flex-shrink-0" />
                {currencyCode === "USD" ? (
                    <p className="text-sm">
                        All prices will be entered and stored in USD.
                    </p>
                ) : (
                    <p className="text-sm">
                        Enter prices in{" "}
                        <span className="font-semibold">{currencyCode}</span>. They
                            will be converted and stored in USD based on today’s rate:
                        <strong className="ml-1">
                            1 USD = {todayExchangeRate} {currencyCode}
                        </strong>
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="shadow-sm">
            <CurrencyBanner />
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

            <Accordion
                items={accordionItems}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
            />
        </div>
    );
}

export default ProductForm;