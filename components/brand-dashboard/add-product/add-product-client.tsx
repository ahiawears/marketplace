'use client'

import { FC } from "react";
import ProductForm from "./product-form";
import { ShippingConfigDataProps } from "@/lib/types";
import { ReturnPolicy as GlobalReturnPolicy } from "@/lib/return-policy-validation";

interface AddProductClientProps {
    currencyCode: string;
    todayExchangeRate: number;
    shippingConfig: ShippingConfigDataProps | null;
    globalReturnPolicy: GlobalReturnPolicy | null;
}
const AddProductClient:FC<AddProductClientProps> = ({ currencyCode, todayExchangeRate, shippingConfig, globalReturnPolicy }) => {
    return (
        <div className="container mx-auto">
            <div className="flex flex-col">
                <div className="w-full">
                    <ProductForm 
                        currencyCode={currencyCode}
                        todayExchangeRate={todayExchangeRate}
                        shippingConfig={shippingConfig}
                        globalReturnPolicy={globalReturnPolicy}
                    /> 
                </div>
            </div>
        </div>
    )
}

export default AddProductClient;
