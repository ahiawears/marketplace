"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ProductVariantType } from "@/lib/types";
import { ColourList } from "@/lib/coloursList";
import MeasurementSizesTable from "./measurement-sizes-table";
import { findNearestColor } from "@/lib/findNearestColor";
import ProductImageUploadGrid from "./product-image-upload-grid";
import { MoneyInput } from "../ui/money-input";
import { SearchableSelect } from "../ui/searchable-select";

interface ProductVariantProps {
    variants: ProductVariantType[];
    setVariants: (variants: ProductVariantType[]) => void;
    originalProductName: string;
    sizes: string[];
    currencySymbol: string;
    category: string;
}

const generateSKU = (productName: string, color: string) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const shortName = productName.replace(/\s+/g, "").substring(0, 5).toUpperCase();
    const shortColor = color.substring(0, 3).toUpperCase();
    return `${shortName}-${shortColor}-${randomNum}`;
};

const generateProductCode = (productName: string,) => {
    const shortName = productName.replace(/\s+/g, "").substring(0, 5).toUpperCase();
    return `${shortName}-${Date.now().toString()}`;
};

const ProductVariantForm: React.FC<ProductVariantProps> = ({variants, setVariants, originalProductName, sizes, currencySymbol, category}) => {
    const [measurementUnit, setMeasurementUnit] = useState<"Inch" | "Centimeter">("Inch"); // Add this line
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [colorName, setColorName] = useState("Black");
    // Transform ColourList for SearchableSelect
    const colorOptions = ColourList.map((color) => ({
        hex: color.hex,
        name: color.name,
    }));

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
        };
        setVariants([...variants, newVariant]);
    };

    const updateVariant = (index: number, field: keyof ProductVariantType, value: string) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };

        if (field === "colorHex") {
            const colorName = findNearestColor(value);
            updatedVariants[index].colorName = colorName;
            updatedVariants[index].variantName = `${originalProductName} in ${colorName}`;

            if (!updatedVariants[index].sku) {
                updatedVariants[index].sku = generateSKU(originalProductName, colorName);
            }
        }

        if (field === "variantName" && !updatedVariants[index].sku) {
            updatedVariants[index].sku = generateSKU(originalProductName, updatedVariants[index].colorName);
        }

        if (field === "productCode" && !updatedVariants[index].productCode) {
            updatedVariants[index].productCode = generateProductCode(originalProductName);
        }

        if (field === "measurementUnit") {
            updatedVariants[index].measurementUnit = value as "Inch" | "Centimeter";
        }
        setVariants(updatedVariants);
    };

    const handleColorChange = (index: number, hex: string) => {
        // Validate the hex code
        if (!hex || typeof hex !== "string" || !/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) {
            console.error("Invalid hex code:", hex);
            return; // Exit the function if the hex code is invalid
        }

        // Check if ColourList is available
        if (!ColourList || ColourList.length === 0) {
            console.error("ColourList is not available.");
            return;
        }

        const colorName = findNearestColor(hex);
        setSelectedColor(hex);
        setColorName(colorName);

        const updatedVariants = [...variants];
        updatedVariants[index].colorHex = hex;
        updatedVariants[index].colorName = colorName;
        updatedVariants[index].variantName = `${originalProductName} in ${colorName}`;
        setVariants(updatedVariants);
    };

    const handleMeasurementChange = ( variantIndex: number, size: string, field: string, value: number ) => {
        const updatedVariants = [...variants];
        const targetVariant = updatedVariants[variantIndex];

        if (field === "remove") {
             // Remove the size from measurements
             const updatedMeasurements = { ...targetVariant.measurements };
             delete updatedMeasurements[size];
             updatedVariants[variantIndex] = {
                 ...targetVariant,
                 measurements: updatedMeasurements,
             };
             //update selectedSizes
             const updatedSelectedSizes = selectedSizes.filter(s => s !== size);
             setSelectedSizes(updatedSelectedSizes);
        } else {
            // Update the measurement for the given size
            const updatedMeasurements = {
                ...targetVariant.measurements,
                [size]: {
                    ...(targetVariant.measurements[size] || {}),
                    [field]: value,
                },
            };
            updatedVariants[variantIndex] = {
                ...targetVariant,
                measurements: updatedMeasurements,
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

    const handleFormSave = () => {
        const variantsData = [...variants];
        //check if form is valid
        console.log("The variant data is: ", variantsData);
    }


    return (
        <div className="my-6">
            <div className="mt-5">
                <Button
                    type="button"
                    onClick={addProductVariant}
                    className="text-black bg-transparent hover:text-white px-4 py-2 rounded-md"
                >
                    + Add Product Variant 
                </Button>
            </div>

            {/* Product Variants Container */}
            <div className="mt-5 space-y-8">
                {variants.map((variant, index) => (
                    <div key={index} className="border border-gray-300 p-4 rounded-md">
                        <h4 className="text-md font-bold mb-3">Product Variant {index + 1}</h4>

                        {/* Variant Form Fields */}
                        <div>
                            {/* Variant Name */}
                            <div className="mt-4">
                                <label htmlFor={`variantName-${index}`} className="block text-sm font-bold text-gray-900 my-4">
                                    Product Variant Name:
                                </label>
                                <Input
                                    id={`variantName-${index}`}
                                    name={`variantName-${index}`}
                                    type="text"
                                    value={variant.variantName}
                                    onChange={(e) => updateVariant(index, "variantName", e.target.value)}
                                    placeholder="Enter the variant name"
                                    className="mb-4 border-2"
                                />
                            </div>
                            
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
                                    <label htmlFor={`colorPicker-${index}`} className="block text-sm font-bold text-gray-900">
                                        Products Colour:
                                    </label>
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <div className="w-full md:w-1/6">
                                            <Input
                                                type="color"
                                                id={`colorPicker-${index}`}
                                                value={variant.colorHex ? variant.colorHex : selectedColor}
                                                onChange={(e) => {
                                                    handleColorChange(index, e.target.value);
                                                }}
                                                
                                                className="mt-2 w-full h-12 border-2"
                                            />
                                        </div>
                                        {/* Dont clear, come back */}
                                        {/* <div className="w-full md:w-5/6">
                                            <div className="relative">
                                                <SearchableSelect
                                                    options={colorOptions} 
                                                    getOptionLabel={(color) => color.name} 
                                                    
                                                    onSelect={(selectedColor) => {
                                                        if (selectedColor) {
                                                            handleColorChange(index, selectedColor.hex);
                                                        }
                                                    }}
                                                    className="w-full mt-2" 
                                                    placeholder="Search and select a color"
                                                />
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                                <div>
                                    <p>
                                        Selected Color: <span>{variant.colorName}</span> (<span>{variant.colorHex}</span>)
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
                                            setSelectedSizes={setSelectedSizes}
                                            selectedSizes={selectedSizes}
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
                                            Product SKU:
                                        </label>
                                        <Input
                                            id={`variantSku-${index}`}
                                            className="border-2"
                                            type="text"
                                            value={variant.sku}
                                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                            placeholder="Auto-generated if left blank"
                                        />
                                        <Button 
                                            className="my-2 h-[30px] text-sm/6"
                                            onClick={() =>
                                                {
                                                    const sku = generateSKU(originalProductName, variant.colorName);
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
                                            Product Code:
                                        </label>
                                        <Input
                                            id={`productCode-${index}`}
                                            className="border-2"
                                            type="text"
                                            value={variant.productCode}
                                            onChange={(e) => updateVariant(index, "productCode", e.target.value)}
                                            placeholder="Auto-generated if left blank"
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
                        <div className="flex w-2/5 flex-col md:flex-row lg:flex-row">
                            {/* <div className="basis-2/4">
                                <Button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== index))} className="text-red-500 mt-2 bg-transparent">
                                    Remove
                                </Button>
                            </div>
                            <div className="basis-2/4">
                                <Button 
                                    type="button" 
                                    //onClick={() => handleFormSave} 
                                    onClick={handleFormSave}
                                    className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                >
                                    Save and continue
                                </Button>
                            </div> */}
                        </div>
                        
                    </div>
                    
                    
                ))}
            </div>
        </div>
        
    );
};

export default ProductVariantForm;