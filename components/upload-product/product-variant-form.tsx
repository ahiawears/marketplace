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
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";
import { ProductVariantErrors, validateProductVariant } from "@/lib/productDataValidation";

interface ProductVariantProps {
    variants: ProductVariantType[];
    setVariants: (variants: ProductVariantType[]) => void;
    originalProductName: string;
    productId: string;
    currencySymbol: string;
    category: string;
    onVariantSaved: (index: number, isSaved: boolean) => void;
    savedStatus: boolean[];
    saveVariant: (index: number) => void;
    savingVariantIndex?: number | null;
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

const ProductVariantForm: React.FC<ProductVariantProps> = ({variants, setVariants, originalProductName, productId, currencySymbol, category, onVariantSaved, savedStatus, saveVariant, savingVariantIndex}) => {
    const [measurementUnit, setMeasurementUnit] = useState<"Inch" | "Centimeter">("Inch");

    const [variantErrors, setVariantErrors] = useState<ProductVariantErrors[]>([]);


    const addProductVariant = () => {
        const newVariant: ProductVariantType = {
            variantName: "",
            productId: productId,
            colorName: "",
            colorHex: "",
            main_image_url: "",
            images: ["", "", "", ""], 
            imagesDescription: "",
            price: 0,
            sku: "",
            measurementUnit: measurementUnit,
            measurements: {},
            productCode: "",
            colorDescription: "",
            mainColor: "",
            colorHexes: [""],
            availableDate: ""
        };
        setVariants([...variants, newVariant]);
        // Notify parent that a new variant was added (unsaved by default)
        onVariantSaved(variants.length, false);
    };

      // Updated validation check
    const runVariantValidation = (index: number): boolean => {
        const { isValid, errors } = validateProductVariant(variants[index], category);
        setVariantErrors(prevErrors => {
            const newErrors = [...prevErrors];
            newErrors[index] = errors;
            return newErrors;
        });
        return isValid;
    };


    const handleDateChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        updateVariant(index, "availableDate", e.target.value);
    };

    const updateVariantPrice = (index: number, field: keyof ProductVariantType, value: number) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setVariants(updatedVariants);
    }


    const updateVariant = (index: number, field: keyof ProductVariantType, value: string) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };

        if (field === "variantName" && !updatedVariants[index].sku && updatedVariants[index].colorName !== "") {
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
            }
        }
        setVariants(updatedVariants);
    };

    const handleMeasurementChange = ( variantIndex: number, size: string, field: string, value: number | undefined ) => {
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
        if (runVariantValidation(index)) {
            const variantsData = variants[index];
            console.log("The variant data is: ", variantsData);
            onVariantSaved(index, true);
            saveVariant(index);
        } else {
            console.log("Validation errors for variant " + index + ":", variantErrors[index]);
            onVariantSaved(index, false);
        }
    }


    useEffect(() => {
        variants.forEach((_, index) => {
            if (savedStatus[index] && !validateProductVariant(variants[index], category).isValid) {
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

                            {/* Product Name and basic information */}
                            <div className="my-4 space-y-2">
                                <div>
                                    <label htmlFor="variantName" className="block text-sm font-bold text-gray-900 my-2">
                                        Product Variant Name:*
                                    </label>
                                    <Input 
                                        id={`variantName-${index}`}
                                        className="border-2"
                                        value={variant.variantName}
                                        onChange={(e) =>  updateVariant(index, "variantName", e.target.value)}
                                        placeholder="e.g., 'Linen Summer Dress - Sky Blue. Max 50 chars"
                                        maxLength={50}
                                    />
                                    {variantErrors[index]?.variantName && (
                                        <p className="text-red-500 text-xs mt-1">{variantErrors[index].variantName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Add Product Images and Information */}
                            <div className="my-4">
                                <div className="my-2 space-y-2">
                                    <label htmlFor={`fileInput-${index}`} className="block text-sm font-bold text-gray-900">
                                        Upload Product Image:*
                                    </label>
                                    <p
                                        className="text-xs"
                                    >
                                        Add up to 4 images for this variant. The first image will be the main one. Max 2MB per image.
                                    </p>
                                </div>
                                
                                {/* Add Product Image Div */}
                                <ProductImageUploadGrid 
                                    images={variant.images}
                                    onImagesChange={(newImages) => handleImagesChange(newImages, index)}
                                />

                                {variantErrors[index]?.images && (
                                    <p className="text-red-500 text-xs mt-1">{variantErrors[index].images}</p>
                                )}
                                {variantErrors[index]?.main_image_url && !variantErrors[index]?.images && (
                                    <p className="text-red-500 text-xs mt-1">{variantErrors[index].main_image_url}</p>
                                )}
                            </div>

                            {/* Images Description */}
                            <div className="my-4">
                                <label htmlFor="imageDescription" className="block text-sm font-bold text-gray-900 my-2">
                                    Images Description:
                                </label>
                                <Textarea
                                    id="imageDescription"
                                    name="imageDescription"
                                    placeholder="Optional: Briefly describe what's shown (e.g., 'Model is 5'8 wearing size M'). Max 350 characters."
                                    maxLength={350}
                                    value={variant.imagesDescription}
                                    onChange={(e) => updateVariant(index, "imagesDescription", e.target.value)}
                                    className="border-2"
                                />

                                {variantErrors[index]?.imagesDescription && (
                                    <p className="text-red-500 text-xs mt-1">{variantErrors[index].imagesDescription}</p>
                                )}
                            </div>
                             
                            {/* Colours of Product Variant*/}
                            <div className="space-y-2 my-4">
                                <div>
                                    <label className="block text-sm font-bold">
                                        Variant Color(s):*
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {variant.colorHexes.map((hex, i) => (
                                            <div key={i} className="flex items-center space-x-2">
                                                <div className="border-2 flex items-center p-2">
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
                                                </div>
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
                                        <div className="p-2">
                                            <Button
                                                type="button"
                                                onClick={() => addColorHex(index)}
                                                className="h-8 w-8"
                                            >
                                                <span><Plus size={16} strokeWidth={2}/></span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 my-2">
                                        <p className="text-sm">
                                            Main Color: {variant.mainColor} ({findNearestColor(variant.mainColor)})
                                        </p>
                                        <p className="text-sm">
                                            Selected Colors: {variant.colorHexes.join(", ")}
                                        </p>
                                        
                                    </div>

                                    {variantErrors[index]?.colorHexes && (
                                        <p className="text-red-500 text-xs mt-1">{variantErrors[index].colorHexes}</p>
                                    )}

                                    <div className="my-2 ">
                                        <label className="block text-sm font-bold">
                                            Color Pattern Description:
                                        </label>
                                        <Input
                                            value={variant.colorDescription}
                                            onChange={(e) => updateVariant(index, "colorDescription", e.target.value)}
                                            placeholder="Describe the color or pattern, (e.g., 'Solid Navy Blue', 'Floral Print on Cream'). Max 50 chars."
                                            type="text"
                                            className="border-2"
                                            maxLength={50}
                                        />
                                        {variantErrors[index]?.colorDescription && (
                                            <p className="text-red-500 text-xs mt-1">{variantErrors[index].colorDescription}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/*  Add Products Price */}
                            <div className="my-4">
                                
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-1/2">
                                        {/* Input Price */}
                                        <div className="my-2 space-y-2">
                                            <label htmlFor="price" className="block text-sm font-bold text-gray-900">
                                                Product Price:*
                                            </label>
                                            <p
                                                className="text-xs"
                                            >
                                                Enter the selling price for this specific variant.
                                            </p>

                                        </div>
                                        
                                        <div className="flex items-center rounded-md">
                                            <Input
                                                name="currencySymbol"
                                                type="text"
                                                value={currencySymbol}
                                                readOnly
                                                required
                                                placeholder="$"
                                                disabled
                                                className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
                                            />
                                            <MoneyInput 
                                                name="price"
                                                className="block border-2 p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                                                numericValue={variant.price}
                                                onNumericChange={(value) => updateVariantPrice(index, "price", value)}
                                                required
                                                placeholder="0.00"
                                            />
                                        
                                        </div>
                                        {variantErrors[index]?.price && (
                                            <p className="text-red-500 text-xs mt-1">{variantErrors[index].price}</p>
                                        )}
                                    </div>
                                    <div className="w-full md:w-1/2">
                                        <div className="my-2 space-y-2">
                                            <label htmlFor="availableDate" className="block text-sm font-bold text-gray-900">
                                                Available Date:
                                            </label>
                                            <p
                                                className="text-xs"
                                            >
                                                Leave blank if available now.
                                            </p>
                                        </div>
                                        
                                        <DatePicker
                                            id="availableDate"
                                            name="availableDate"
                                             value={variant.availableDate || ""} // Use variant's date
                                            onChange={(e) => handleDateChange(index, e)} // Pass index
                                            min={new Date().toISOString().split("T")[0]}
                                            className="border-2"
                                            placeholder="mm/dd/yyyy"
                                        />
                                        {variantErrors[index]?.availableDate && (
                                            <p className="text-red-500 text-xs mt-1">{variantErrors[index].availableDate}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Variant SKU and Product Code */} 
                            <div className="my-4">
                                <div className="mx-auto flex flex-col lg:flex-row md:space-x-4 lg:space-x-4 my-2">
                                    {/* Product SKU */}
                                    <div className="lg:basis-1/2 ">
                                        <div className="mt-3">
                                            <label htmlFor={`variantSku-${index}`} className="block text-sm font-bold text-gray-900 my-2">
                                                Product Variant SKU:*
                                            </label>
                                            <Input
                                                id={`variantSku-${index}`}
                                                className="border-2"
                                                type="text"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                                placeholder="Stock Keeping Unit. Unique code for this variant. Generate one or enter your own."
                                            />
                                            {variantErrors[index]?.sku && (
                                                <p className="text-red-500 text-xs mt-1">{variantErrors[index].sku}</p>
                                            )}
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
                                            <label htmlFor={`productCode-${index}`} className="block text-sm font-bold text-gray-900 my-2">
                                                Product Variant Code:*
                                            </label>
                                            <Input
                                                id={`productCode-${index}`}
                                                className="border-2"
                                                type="text"
                                                value={variant.productCode}
                                                onChange={(e) => updateVariant(index, "productCode", e.target.value)}
                                                placeholder="Internal product code, if different from SKU. Generate one or enter your own."
                                            />
                                            {variantErrors[index]?.productCode && (
                                                <p className="text-red-500 text-xs mt-1">{variantErrors[index].productCode}</p>
                                            )}
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
                                            measurementUnit={variants[index].measurementUnit}
                                            setMeasurementUnit={setMeasurementUnit}
                                            updateVariant={updateVariant} 
                                            variantIndex={index} 
                                        />   
                                        {variantErrors[index]?.measurements && (
                                            <p className="text-red-500 text-xs mt-1">{variantErrors[index].measurements}</p>
                                        )}
                                    </div>
                                }
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
                                    disabled={!validateProductVariant(variants[index], category).isValid || savingVariantIndex === index}
                                    className={`flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm ${
                                     validateProductVariant(variants[index], category).isValid
                                        ? "bg-black text-white hover:bg-gray-800"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {savingVariantIndex === index ? "Saving..." : "Save"}
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