'use client'
import { FC } from "react";
// import AddProductDetails from "@/components/ui/add-product-details";
import ProductForm from "./product-form";
import { ShippingConfigDataProps } from "@/lib/types";

interface AddProductClientProps {
    currencyCode: string;
    todayExchangeRate: number;
    shippingConfig: ShippingConfigDataProps | null;
}
const AddProductClient:FC<AddProductClientProps> = ({ currencyCode, todayExchangeRate, shippingConfig }) => {
    return (
        <div className="container mx-auto">
            <div className="flex flex-col">
                <div className="w-full">
                    <ProductForm 
                        currencyCode={currencyCode!}
                        todayExchangeRate={todayExchangeRate}
                        shippingConfig={shippingConfig}
                    /> 
                </div>
            </div>
        </div>
    )
}

export default AddProductClient;