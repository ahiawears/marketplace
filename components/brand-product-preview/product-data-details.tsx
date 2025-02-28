import { ProductInformation } from "@/lib/types";
import { FC, useState } from "react";
import { Input } from "../ui/input";

interface ProductDataDetailsEditProps {
    variantTags: { tag_id: { name: string } }[] | null;
    variantTexts: ProductInformation["variantTexts"] | null;
    measurementsData: ProductInformation["measurementsData"] | null;
}

export const ProductDataDetailsEdit: FC<ProductDataDetailsEditProps> = ({variantTags, variantTexts, measurementsData}) => {

    return (
        <div>
            {variantTexts && variantTags && measurementsData &&
                // <div>
                //     <p>Product Name: {variantTexts.name}</p>
                //     <p>Code: {variantTexts.product_code}</p>
                //     <p>SKU: {variantTexts.sku}</p>
                //     <p>Price: {variantTexts.price}</p>
                //     <div>
                //         <strong>Tags:</strong>
                //         {variantTags.map((tag, index) => (
                //             <span key={index}>
                //                 {tag.tag_id.name}
                //                 {index < variantTags.length -1 ? ", " : ""}
                //             </span>
                //         ))}
                //     </div>
                // </div>
                

                // 
                <div>
                    <div className="mt-5">
                        <p className="font-bold text-xl">
                            {variantTexts.name}
                        </p>
                        <p>
                            {variantTexts.main_product_id.currency_id.name} {variantTexts.price}
                        </p>

                        <p>
                            Color: {variantTexts.color_id.name}
                            <Input
                                type="color"
                                value={variantTexts.color_id.hex_code}
                                disabled
                                
                            />
                        </p>
                    </div>
                </div>
            }
        </div>
    )
}