import { currency } from "../../lib/currencyList";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "../ui/input"
import { Button } from "../ui/button";
import React from "react";

interface ProductPreviewProps {
    productData: {
        generalDetails: {
            productName: string;
            category: string;
            currency: string;
        };
        productInformation: {
            main_image_url: string;
            price?: string;
            variantName?: string;
            images?: string[];
            colorName?: string;
            colorHex?: string;
            measurements: {
                [size: string]: {
                    [measurement: string]: number | string;
                    quantity: number;
                };
            };
        };
        productVariants: {
            main_image_url: string;
            variantName: string;
        }[];
    };
    selectedVariant: {
        main_image_url: string;
        price?: string;
        variantName?: string;
        images?: string[];
        colorName?: string;
        colorHex?: string;
    } | null;
    onVariantClick: (variant: any) => void;
  }
  
const ProductPreview: React.FC<ProductPreviewProps> = ({ productData, selectedVariant, onVariantClick, }) => {
    const mainPreview = selectedVariant || productData.productInformation;
    const [selectedImage, setSelectedImage] = useState(mainPreview.main_image_url);
    const [currencySymbolValue, setCurrencySymbolValue] = useState("");
    

    useEffect(() => {
        const handleCurrencySymbol = (currencyCode: string) => {
            const doesCodeExist = currencyCode;
            const getSymbolFromCode = currency.find((c) => c.code === doesCodeExist);
            if (getSymbolFromCode) {
                setCurrencySymbolValue(getSymbolFromCode.symbol);
            }
        }
        handleCurrencySymbol(productData.generalDetails.currency)
    }, []);

    const blobLoader = ({ src }: { src: string }) => {
        if (src.startsWith("blob:")) {
            return src; 
        }
        return src;
    };

    const validImages = mainPreview.images?.filter((image) => image?.trim() !== "") || [];
    const sizes = Object.keys(productData.productInformation.measurements);

    return (
        <div>
            <div className="mx-auto flex flex-col lg:flex-row">
                <div className="lg:basis-3/5 p-4">
                    <div className="flex justify-center h-fit w-[300px] py-4">
                        <Image
                            src={ selectedImage }
                            height={500}
                            width={300}
                            priority
                            style={{objectFit:"contain"}}
                            alt={mainPreview.variantName || productData.generalDetails.productName}
                            className="border-2"
                        />
                    </div>
                    {/* Thumbnails */}
                    <div className="flex gap-4">
                        {validImages.map((image, index) => (
                            <div
                                key={index}
                                className="cursor-pointer border-2 border-transparent hover:border-gray-400 rounded-md overflow-hidden relative h-fit w-[60px]"
                                onClick={() => setSelectedImage(image)}
                            >
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    height={60}
                                    width={60}
                                    style={{objectFit:"contain"}}
                                    className="border-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:basis-2/5 p-4">
                    <div className="px-6 bg-white rounded-lg py-4">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-bold">
                                {mainPreview.variantName || productData.generalDetails.productName}
                            </h2>
                        </div>
                        <div>
                            <p className="text-gray-700">
                                { `${currencySymbolValue} ${mainPreview.price}` }
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 my-2">
                            <div className="w-full md:w-5/6">
                                <p className="text-gray-700">
                                    Colour: {mainPreview.colorName}
                                </p>
                            </div>
                            <div className="w-full md:w-1/6 pointer-events-none">
                                <Input
                                    type="color"
                                    value={mainPreview.colorHex}
                                    className="border-none w-12 h-6 py-0 "
                                    
                                />
                            </div>
                        </div>
                        {/* TODO: Add sizes list */}
                        <div className="flex my-2">
                            <p className="text-md font-bold">
                                Size:
                            </p>
                            {sizes.map((size) => (
                                <div className="flex flex-wrap gap-2 mx-2">
                                    <span key={size} className="px-3 py-1 text-sm border-2 bg-black text-white">
                                        {size}
                                    </span>
                                </div>
                                
                            ))}
                        </div>

                        {/* Measurements Table */}
                        <div className="overflow-x-auto mt-5">
                            <table className="table-auto w-full border-collapse border-2">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border-2 px-4 py-2">Size</th>
                                        {Object.keys(productData.productInformation.measurements[sizes[0]] || {}).map((measurement) => (
                                            <th key={measurement} className="border-2 px-4 py-2">
                                                {measurement}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sizes.map((size) => (
                                        <tr key={size}>
                                            <td className="border-2 px-4 py-2 font-medium">
                                                {size}
                                            </td>
                                            {Object.keys(productData.productInformation.measurements[size] || {}).map((measurement) => (
                                                <td key={measurement} className="border-2 px-4 py-2">
                                                    {productData.productInformation.measurements[size][measurement]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                    </div>
                </div>
                <div>
                    <Button className="px-3 py-1.5 text-sm/6 font-semibold text-black shadow-sm">
                        Publish Product
                    </Button>
                </div>
            </div>
            
        </div>
        // <div>
        //     {/* Main Product Preview */}
        //     <div className="flex flex-col items-center">
        //         <Image 
        //             src={
        //                 mainPreview.main_image_url || "https://placehold.co/250x500.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
        //             }
        //             width={250}
        //             height={600}
        //             alt={mainPreview.variantName || productData.generalDetails.productName}
        //             loader={blobLoader}
        //             priority
        //             className="mx-auto mt-4 align-middle"
        //         />
        //         <h2 className="text-lg font-bold">
        //             {mainPreview.variantName || productData.generalDetails.productName}
        //         </h2>
        //         <p className="text-gray-700">
        //             {mainPreview.price
        //                 ? `${productData.generalDetails.currency} ${mainPreview.price}`
        //                 : productData.generalDetails.category
        //             }
        //         </p>
        //     </div>
  
        //     {/* Variant List */}
        //     {productData.productVariants.length > 0 && (
        //         <div className="mt-6">
        //             <h3 className="text-md font-semibold mb-2">Variants</h3>
        //             <div className="flex flex-wrap gap-4">
        //                 {productData.productVariants.map((variant, index) => (
        //                     <div
        //                         key={index}
        //                         className={`p-2 border rounded-md cursor-pointer ${
        //                             selectedVariant === variant
        //                             ? 'border-blue-500'
        //                             : 'border-gray-300'
        //                         }`}
        //                         onClick={() => onVariantClick(variant)}
        //                     >

        //                         <Image
        //                             src={
        //                                 variant.main_image_url || "https://placehold.co/250x500.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
        //                             }
        //                             alt={variant.variantName}
        //                             loader={blobLoader}
        //                             width={250}
        //                             height={600}
        //                             priority
        //                             className="mx-auto"
        //                         />
        //                         <p className="text-sm mt-2 text-center">{variant.variantName}</p>
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>
        //     )}
        // </div>
    );
};
  
export default ProductPreview;
  