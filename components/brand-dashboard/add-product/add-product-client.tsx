'use client'

import { FC, useEffect } from "react";
import ProductForm from "./product-form";
import { ShippingConfigDataProps } from "@/lib/types";
import { ReturnPolicy as GlobalReturnPolicy } from "@/lib/return-policy-validation";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import type { ProductEditorInitialData } from "@/actions/add-product/load-product-editor-data";

interface AddProductClientProps {
    currencyCode: string;
    todayExchangeRate: number;
    shippingConfig: ShippingConfigDataProps | null;
    globalReturnPolicy: GlobalReturnPolicy | null;
    mode?: "create" | "edit";
    initialProductData?: ProductEditorInitialData | null;
}
const AddProductClient:FC<AddProductClientProps> = ({
    currencyCode,
    todayExchangeRate,
    shippingConfig,
    globalReturnPolicy,
    mode = "create",
    initialProductData = null,
}) => {
    const hydrateProductForm = useProductFormStore((state) => state.hydrateProductForm);
    const resetAll = useProductFormStore((state) => state.resetAll);

    useEffect(() => {
        if (mode === "create") {
            resetAll();
            return;
        }

        if (mode === "edit" && initialProductData) {
            hydrateProductForm(initialProductData);
        }
    }, [hydrateProductForm, initialProductData, mode, resetAll]);

    return (
        <div className="container mx-auto">
            <div className="flex flex-col">
                <div className="w-full">
                    <ProductForm 
                        currencyCode={currencyCode}
                        todayExchangeRate={todayExchangeRate}
                        shippingConfig={shippingConfig}
                        globalReturnPolicy={globalReturnPolicy}
                        mode={mode}
                    /> 
                </div>
            </div>
        </div>
    )
}

export default AddProductClient;
