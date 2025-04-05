"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ProductVariantType } from "@/lib/types";
import MeasurementSizesTable from "./measurement-sizes-table";
import { findNearestColor } from "@/lib/findNearestColor";
import ProductImageUploadGrid from "./product-image-upload-grid";
import { MoneyInput } from "../ui/money-input";
import { Plus } from 'lucide-react'
import { X } from 'lucide-react'

interface ProductVariantProps {
    variants: ProductVariantType[];
    setVariants: (variants: ProductVariantType[]) => void;
    originalProductName: string;
    sizes: string[];
    currencySymbol: string;
    category: string;
    onVariantSaved: (index: number, isSaved: boolean) => void;
    savedStatus: boolean[];
}

const generateSKU = (productName: string, color: string): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${productName.slice(0, 5).replace(/\s+/g, "").toUpperCase()}-${
        color.slice(0, 3).toUpperCase()
    }-${randomNum}`;
};
  
const generateProductCode = (productName: string): string => {
    return `${productName.slice(0, 5).replace(/\s+/g, "").toUpperCase()}-${Date.now().toString()}`;
};

const ProductVariantForm: React.FC<ProductVariantProps> = ({variants, setVariants, originalProductName, sizes, currencySymbol, category, onVariantSaved, savedStatus}) => {
    const [measurementUnit, setMeasurementUnit] = useState<"Inch" | "Centimeter">("Inch");

    // Transform ColourList for SearchableSelect
    const addProductVariant = () => {
        const initialQuantities = sizes.reduce((acc, size) => {
            acc[size] = 0;
            return acc;
        }, {} as { [size: string]: number });
    
        const newVariant: ProductVariantType = {
            variantName: "",
            productId: "",
            colorName: "",
            colorHex: "",
            main_image_url: "",
            images: ["", "", "", ""], 
            price: "",
            sku: "",
            measurementUnit: measurementUnit,
            measurements: {},
            productCode: "",
            colorDescription: "",
            mainColor: "",
            colorHexes: ["#000000"]
        };
        setVariants([...variants, newVariant]);
         // Notify parent that a new variant was added (unsaved by default)
        onVariantSaved(variants.length, false);
    };

    const isVariantValid = (index: number): boolean => {
        const variant = variants[index];
        
        // Required fields validation
        const requiredFieldsValid = [
            variant.variantName?.trim(),
            variant.productCode?.trim(),
            variant.sku?.trim(),
            variant.colorName?.trim(),
            variant.price?.trim(),
            variant.measurementUnit?.trim(),
            variant.colorHexes[0]?.trim(),
            variant.colorDescription?.trim(),
            
        ].every(field => field && field.length > 0);
      
        // Image validation (at least one image)
        const imagesValid = variant.images.some(img => img.trim() !== "");
      
        // Measurements validation (if category requires sizes)
        const measurementsValid = Object.keys(variant.measurements).every(size => {
            return variant.measurements[size]?.quantity > 0;
        });


        return requiredFieldsValid && imagesValid && measurementsValid;
    };

    const updateVariant = (index: number, field: keyof ProductVariantType, value: string) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };

        if (field === "variantName" && !updatedVariants[index].sku) {
            updatedVariants[index].sku = generateSKU(originalProductName, updatedVariants[index].colorName);
        }

        if (field === "productCode" && !updatedVariants[index].productCode) {
            updatedVariants[index].productCode = generateProductCode(originalProductName);
        }

        if (field === "measurementUnit") {
            updatedVariants[index].measurementUnit = value as "Inch" | "Centimeter";
        }

        // Set mainColor to the first color in colorHexes if it exists
        if (field === "colorHexes" && Array.isArray(value) && value.length > 0) {
            updatedVariants[index].mainColor = value[0];
            if (!updatedVariants[index].colorHex) {
                updatedVariants[index].colorHex = value[0];
                const colorName = findNearestColor(value[0]);
                updatedVariants[index].colorName = colorName;
                updatedVariants[index].variantName = `${originalProductName} in ${colorName}`;
            }
        }
        setVariants(updatedVariants);
    };

    const handleMeasurementChange = ( variantIndex: number, size: string, field: string, value: number ) => {
        const updatedVariants = [...variants];
        const targetVariant = updatedVariants[variantIndex];

        if (field === "remove") {
            const { [size]: _, ...remaining } = targetVariant.measurements;
            updatedVariants[variantIndex] = {
              ...targetVariant,
              measurements: remaining
            };
            //setSelectedSizes(prev => prev.filter(s => s !== size));
        } else {
            updatedVariants[variantIndex] = {
                ...targetVariant,
                measurements: {
                    ...targetVariant.measurements,
                    [size]: {
                        ...(targetVariant.measurements[size] || {}),
                        [field]: value
                    }
                }
            };
        }
        setVariants(updatedVariants);
    };

    const handleImagesChange = (newImages: string[], variantIndex: number) => {
        const updatedVariants = [...variants];
        updatedVariants[variantIndex].images = newImages;
        updatedVariants[variantIndex].main_image_url = newImages[0];
        setVariants(updatedVariants);
    };

    const handleFormSave = (index: number) => {
        if (isVariantValid(index)) {
            const variantsData = variants[index];
            console.log("The variant data is: ", variantsData);
            onVariantSaved(index, true);
        }
    }
    useEffect(() => {
        variants.forEach((_, index) => {
            if (savedStatus[index] && !isVariantValid(index)) {
                onVariantSaved(index, false);
            }
        });
    }, [variants]);

    const handleColorHexChange = (index: number, colorIndex: number, value: string) => {
        const updatedVariants = [...variants];
        const updatedColorHexes = [...updatedVariants[index].colorHexes];
        updatedColorHexes[colorIndex] = value;
        updatedVariants[index].colorHexes = updatedColorHexes;
        
        // Update mainColor to the first color in the array
        if (colorIndex === 0 && updatedColorHexes.length > 0) {
            updatedVariants[index].mainColor = updatedColorHexes[0];
        }

        const mainColorName = findNearestColor(updatedColorHexes[0]);
        updatedVariants[index].variantName = `${originalProductName} in ${mainColorName}`;
        updatedVariants[index].colorName = mainColorName;
        
        setVariants(updatedVariants);
    };

    const addColorHex = (index: number) => {
        const updatedVariants = [...variants];
        updatedVariants[index].colorHexes = [...updatedVariants[index].colorHexes, "#000000"];
        setVariants(updatedVariants);
    };

    const removeColorHex = (index: number, colorIndex: number) => {
        const updatedVariants = [...variants];
        const updatedColorHexes = updatedVariants[index].colorHexes.filter((_, idx) => idx !== colorIndex);
        updatedVariants[index].colorHexes = updatedColorHexes;
        
        // Update mainColor if we removed the first color
        if (colorIndex === 0 && updatedColorHexes.length > 0) {
            updatedVariants[index].mainColor = updatedColorHexes[0];
            
            const mainColorName = findNearestColor(updatedColorHexes[0]);
            updatedVariants[index].variantName = `${originalProductName} in ${mainColorName}`;
        }
        
        setVariants(updatedVariants);
    };

    return (
        <div className="my-6">
            
            {/* Product Variants Container */}
            <div className="mt-5 space-y-8">
                {variants.map((variant, index) => (
                    <div key={index} className="border border-gray-300 p-4 rounded-md">
                        <h4 className="text-md font-bold mb-3">Product Variant {index + 1}</h4>

                        {/* Variant Form Fields */}
                        <div>
                            
                            {/* Add Product Images and Information */}
                            <div className="mb-4">
                                <label htmlFor={`fileInput-${index}`} className="block text-sm font-bold text-gray-900 mb-5">
                                    Upload Product Image:*
                                </label>
                                {/* Add Product Image Div */}
                                <ProductImageUploadGrid 
                                    images={variant.images}
                                    onImagesChange={(newImages) => handleImagesChange(newImages, index)}
                                />
                            </div>

                            {/* Colours of Product Variant*/}
                            <div className="space-y-4 my-5">
                                <div>
                                    <label className="block text-sm font-bold mb-1">
                                        Color Pattern Description *
                                    </label>
                                    <Input
                                        value={variant.colorDescription}
                                        onChange={(e) => updateVariant(index, "colorDescription", e.target.value)}
                                        placeholder="e.g., 'Red and blue stripes'"
                                    />
                                
                                    <label className="block text-sm font-bold mt-3 mb-1">
                                        Primary Colors *
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {variant.colorHexes.map((hex, i) => (
                                            <div key={i} className="flex items-center">
                                                <Input
                                                    type="color"
                                                    value={hex}
                                                    onChange={(e) => handleColorHexChange(index, i, e.target.value)}
                                                    className="w-8 h-8 p-0 border-2"
                                                    style={{ minWidth: '40px' }}
                                                />
                                                <Input
                                                    type="text"
                                                    value={hex}
                                                    onChange={(e) => handleColorHexChange(index, i, e.target.value)}
                                                    className="w-24 h-8 text-sm border-2"
                                                    maxLength={7}
                                                    placeholder="#FFFFFF"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeColorHex(index, i)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <span><X size={16} strokeWidth={2}/></span>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            onClick={() => addColorHex(index)}
                                            className="h-10 w-10"
                                        >
                                            <span><Plus size={16} strokeWidth={2}/></span>
                                        </Button>
                                    </div>
                                    
                                </div>
                                <div>
                                    <p className="text-sm">
                                        Selected Colors: {variant.colorHexes.join(", ")}
                                    </p>
                                    <p className="text-sm">
                                        Main Color: {variant.mainColor} ({findNearestColor(variant.mainColor)})
                                    </p>
                                </div>
                            </div>

                             {/* Quantity and Measurements */}
                            <div className="my-4">         
                                {category && 
                                    <div>
                                        <MeasurementSizesTable
                                            category={category}
                                            measurements={variants[index].measurements}
                                            onMeasurementChange={(size, field, value) =>
                                                handleMeasurementChange(index, size, field, value)
                                            }
                                            measurementUnit={measurementUnit}
                                            setMeasurementUnit={setMeasurementUnit}
                                            updateVariant={updateVariant} 
                                            variantIndex={index} 
                                        />   
                                    </div>
                                }
                            </div>

                            {/*  Add Products Price */}
                            <div className="mb-5">
                                <label htmlFor="price" className="block text-sm font-bold text-gray-900 mb-2">
                                    Product Price:*
                                </label>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-1/2">
                                        {/* Input Price */}
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                            <Input
                                                name="currencySymbol"
                                                type="text"
                                                value={currencySymbol}
                                                readOnly
                                                required
                                                className="text-center block border-2 p-2 text-gray-900 bg-transparent w-1/5"
                                            />
                                            <MoneyInput 
                                                name="price"
                                                className="block border-2 p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, "price", e.target.value)}
                                                required
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="my-5 ">
                                            Product Variant Price: <span className="text-green-700">&emsp;{currencySymbol} {variant.price}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mx-auto flex flex-col lg:flex-row md:space-x-4 lg:space-x-4 mt-3">
                                {/* Product SKU */}
                                <div className="lg:basis-1/2 ">
                                    <div className="mt-3">
                                        <label htmlFor={`variantSku-${index}`} className="block text-sm font-bold text-gray-900 my-4">
                                            Product Variant SKU:
                                        </label>
                                        <Input
                                            id={`variantSku-${index}`}
                                            className="border-2"
                                            type="text"
                                            value={variant.sku}
                                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                            placeholder="Enter the variant SKU"
                                        />
                                        <Button 
                                            className="my-2 h-[30px] text-sm/6"
                                            onClick={() =>
                                                {
                                                    const mainColor = findNearestColor(variant.colorHexes[0]);
                                                    const sku = generateSKU(originalProductName, mainColor);
                                                    updateVariant(index, "sku", sku);
                                                }
                                            }    
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                                {/* Product Code */}
                                <div className="lg:basis-1/2 ">
                                    <div className="mt-3">
                                        <label htmlFor={`productCode-${index}`} className="block text-sm font-bold text-gray-900 my-4">
                                            Product Variant Code:
                                        </label>
                                        <Input
                                            id={`productCode-${index}`}
                                            className="border-2"
                                            type="text"
                                            value={variant.productCode}
                                            onChange={(e) => updateVariant(index, "productCode", e.target.value)}
                                            placeholder="Enter the variant code"
                                        />
                                        <Button 
                                            className="my-2 h-[30px] text-sm/6"
                                            onClick={() => 
                                                {
                                                    const productCode = generateProductCode(originalProductName);
                                                    updateVariant(index, "productCode", productCode);
                                                }
                                            }    
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full flex-col md:flex-row lg:flex-row mt-10 justify-end gap-4">
                            <div>
                                <Button 
                                    type="button" 
                                    onClick={() => setVariants(variants.filter((_, i) => i !== index))} 
                                    className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black hover:bg-red-500"
                                >
                                    Remove
                                </Button>
                            </div>
                            <div>
                                <Button 
                                    type="button"
                                    onClick={() => handleFormSave(index)}
                                    disabled={!isVariantValid(index)}
                                    className={`flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm ${
                                      isVariantValid(index)
                                        ? "bg-black text-white hover:bg-gray-800"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    Save and continue
                                </Button>
                            </div>
                        </div>
                        
                    </div>
                ))}
            </div>
            <div className="mt-5">
                <Button
                    type="button"
                    onClick={addProductVariant}
                    className="text-black bg-transparent hover:text-white px-4 py-2 rounded-md"
                >
                    <span><Plus size={16} strokeWidth={2}/></span> Add Product Variant 
                </Button>
            </div>
        </div>
        
    );
};

export default ProductVariantForm;