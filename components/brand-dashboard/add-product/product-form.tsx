import { FC, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import GeneralDetailsForm from "./general-details-form";
import Accordion from "@/components/ui/Accordion";
import type { AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/button";
import VariantDetailsForm from "./variants-details-form";
import ShippingDetailsForm from "./shipping-details-form";
import { ShippingDetails } from '@/lib/types';
import CareDetailsForm from "./care-details-form";
import ReturnPolicyDetailsForm from "./return-policy-details-form";
import { PublishProductDialog } from "./publish-product-dialog";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { toast } from "sonner";
import { ReturnPolicy as GlobalReturnPolicy } from "@/lib/return-policy-validation";

interface ProductFormProps {
    currencyCode: string;
    todayExchangeRate?: number;
    shippingConfig: ShippingDetails | null;
    globalReturnPolicy: GlobalReturnPolicy | null;
    mode?: "create" | "edit";
}
const ProductForm: FC<ProductFormProps> = ({ currencyCode, todayExchangeRate, shippingConfig, globalReturnPolicy, mode = "create" }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const router = useRouter();
    const {
        productId,
        savedSteps,
        resetAll,
        setProductId,
        markStepSaved,
    } = useProductFormStore();

    useEffect(() => {
        if (productId && !savedSteps.general) {
            markStepSaved("general");
        }
    }, [markStepSaved, productId, savedSteps.general]);

    const handleResetStore = () => {
        resetAll();
        setActiveIndex(0);
        toast.success("Store reset");
    };

    const handleFinishProduct = () => {
        if (!fullyConfigured || !productId) {
            toast.error("Save all sections before finishing this product.");
            return;
        }

        if (mode === "create") {
            setIsPublishDialogOpen(true);
            return;
        }

        resetAll();
        setActiveIndex(0);
        toast.success("Product changes saved.");
        router.push("/dashboard/products-list");
    };

    const handleStepSaved = (step: keyof typeof savedSteps) => {
        markStepSaved(step);
        const stepOrder: Array<keyof typeof savedSteps> = [
            "general",
            "variants",
            "shipping",
            "care",
            "returnPolicy",
        ];
        const currentIndex = stepOrder.indexOf(step);
        const nextIndex = currentIndex + 1;
        if (nextIndex < stepOrder.length) {
            setActiveIndex(nextIndex);
        }
    };

    const generalSaved = Boolean(productId) && savedSteps.general;
    const variantsReady = generalSaved;
    const variantsSaved = savedSteps.variants;
    const shippingReady = generalSaved && variantsSaved;
    const careReady = shippingReady && savedSteps.shipping;
    const returnReady = careReady && savedSteps.care;
    const fullyConfigured = savedSteps.returnPolicy;

    const stepSummary = [
        { label: "General", complete: generalSaved },
        { label: "Variants", complete: variantsSaved },
        { label: "Shipping", complete: savedSteps.shipping },
        { label: "Care", complete: savedSteps.care },
        { label: "Return Policy", complete: savedSteps.returnPolicy },
    ];

    // Accordion Item Definitions
    const multiVariantItems = useMemo<AccordionItem[]>(() => 
        [
            {
                title: "General Product Details",
                description: mode === "edit" ? "Update the product shell and merchandising basics." : "Create the product shell first. This unlocks every later step.",
                status: generalSaved ? "complete" : "current",
                content: <GeneralDetailsForm onSaveSuccess={(newProductId) => {
                    setProductId(newProductId);
                    handleStepSaved("general");
                }} mode={mode} />,
            },
            {
                title: "Variants Details",
                description: "Add at least one sellable variant before configuring fulfilment.",
                status: variantsSaved ? "complete" : variantsReady ? "current" : "locked",
                disabled: !variantsReady,
                content: (
                    <VariantDetailsForm
                        currencyCode={currencyCode}
                        todayExchangeRate={todayExchangeRate}
                        mode={mode}
                        onSaveSuccess={() => handleStepSaved("variants")}
                    />
                ),
            },
            {
                title: "Shipping Details",
                description: "Set package size, weight, and enabled delivery methods.",
                status: savedSteps.shipping ? "complete" : shippingReady ? "current" : "locked",
                disabled: !shippingReady,
                content: (
                    <ShippingDetailsForm
                        shippingConfig={shippingConfig}
                        currencySymbol={currencyCode}
                        todayExchangeRate={todayExchangeRate}
                        onSaveSuccess={() => handleStepSaved("shipping")}
                    />
                ),
            },
            {
                title: "Care Instructions",
                description: "Add at least one instruction so buyers know how to care for the item.",
                status: savedSteps.care ? "complete" : careReady ? "current" : "locked",
                disabled: !careReady,
                content: <CareDetailsForm onSaveSuccess={() => handleStepSaved("care")} />,
            },
            {
                title: "Return Policy",
                description: "Use the brand policy or customize how this product can be returned.",
                status: savedSteps.returnPolicy ? "complete" : returnReady ? "current" : "locked",
                disabled: !returnReady,
                content: (
                    <ReturnPolicyDetailsForm 
                        currencySymbol={currencyCode}
                        globalReturnPolicy={globalReturnPolicy}
                        onSaveSuccess={() => handleStepSaved("returnPolicy")}
                    />
                ),
            },
        ],
        [
            careReady,
            currencyCode,
            generalSaved,
            globalReturnPolicy,
            returnReady,
            savedSteps.care,
            savedSteps.returnPolicy,
            savedSteps.shipping,
            setProductId,
            shippingConfig,
            shippingReady,
            todayExchangeRate,
            mode,
            variantsReady,
            variantsSaved,
        ]
    );

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
            <div className="mb-6 border-2 rounded-md bg-stone-50 p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{mode === "edit" ? "Guided edit flow" : "Guided upload flow"}</p>
                        <p className="mt-1 text-sm text-gray-600">
                            {mode === "edit"
                                ? "Update each section and resave only the parts you changed."
                                : "We&apos;ll move you step by step. Later sections unlock after the earlier ones are saved."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                        {!fullyConfigured && <AlertCircle className="h-4 w-4" />}
                        {fullyConfigured && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        <span>{fullyConfigured ? "Ready for the next workflow" : "Finish all sections to complete setup"}</span>
                    </div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-5">
                    {stepSummary.map((step, index) => (
                        <div
                            key={step.label}
                            className={`rounded-md border px-3 py-2 text-sm ${
                                step.complete ? "border-green-300 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-600"
                            }`}
                        >
                            <p className="font-medium">
                                {index + 1}. {step.label}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-wide">
                                {step.complete ? "Saved" : "Pending"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <Button onClick={handleResetStore} variant="destructive" className="mb-4">
                    Reset Product Draft
                </Button>
            </div>

            <Accordion
                items={multiVariantItems}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
            />

            <div className="mt-8 flex flex-col gap-3 rounded-md border-2 bg-stone-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-900">Complete product setup</p>
                    <p className="mt-1 text-sm text-gray-600">
                        {fullyConfigured
                            ? mode === "edit"
                                ? "All required sections are saved. Save changes to return to your products list."
                                : "All required sections are saved. Publish now or schedule the product for later."
                            : "Save all required sections to unlock the final product action."}
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={handleFinishProduct}
                    disabled={!fullyConfigured || !productId}
                    className="w-full md:w-auto"
                >
                    {mode === "edit" ? "Save Changes" : "Publish Product"}
                </Button>
            </div>

            {productId ? (
                <PublishProductDialog
                    open={isPublishDialogOpen}
                    onOpenChange={setIsPublishDialogOpen}
                    productId={productId}
                    onPublishSuccess={() => {
                        resetAll();
                        setActiveIndex(0);
                        router.push("/dashboard/products-list");
                    }}
                />
            ) : null}
        </div>
    );
}

export default ProductForm;
