"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { ProductVariantType } from "@/lib/types";
import Image from "next/image";
import { ColourList } from "@/lib/coloursList";

interface ProductVariantProps {
    variants: ProductVariantType[];
    setVariants: React.Dispatch<React.SetStateAction<ProductVariantType[]>>;
    originalProductName: string;
    sizes: string[];
    currencySymbol: string;
}

const ProductVariantForm: React.FC<ProductVariantProps> = ({variants, setVariants, originalProductName, sizes, currencySymbol}) => {
    const [images, setImages] = useState<string[]>(["", "", "", ""]);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [colorName, setColorName] = useState("Black");

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
            variantId: "",
            variantSku: "",
            quantities: initialQuantities,
            images: ["", "", "", ""], // Add images array
            currentSlide: 0, // Track slide per variant
            currency: "",
            price: "",
        };
        setVariants([...variants, newVariant]);
    };

    const updateVariant = (index: number, field: keyof ProductVariantType, value: string) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setVariants(updatedVariants);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const prevSlide = (variantIndex: number) => {
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            const currentSlide = updatedVariants[variantIndex]?.currentSlide || 0;
            if (currentSlide > 0) {
                updatedVariants[variantIndex].currentSlide = currentSlide - 1;
            }
            return updatedVariants;
        });
    };
    
    const nextSlide = (variantIndex: number) => {
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            const currentSlide = updatedVariants[variantIndex]?.currentSlide || 0;
            const maxSlides = Math.ceil((updatedVariants[variantIndex]?.images?.length || 0) / 2);
            if (currentSlide < maxSlides - 1) {
                updatedVariants[variantIndex].currentSlide = currentSlide + 1;
            }
            return updatedVariants;
        });
    };

    const blobLoader = ({ src }: { src: string }) => {
        if (src.startsWith("blob:")) {
            return src; // Let the browser handle blob URLs directly
        }
        return src; // Default behavior
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, variantIndex: number, imageIndex: number) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds 2MB");
                return;
            }
            const imageUrl = URL.createObjectURL(file); // Temporary preview
    
            setVariants((prevVariants) => {
                const updatedVariants = [...prevVariants];
                const variantImages = [...updatedVariants[variantIndex].images];
    
                // Replace the image at the specific index
                variantImages[imageIndex] = imageUrl;
    
                updatedVariants[variantIndex].images = variantImages;
                return updatedVariants;
            });
        }
    };
    
    

    // Helper: Convert HEX to RGB
    const hexToRgb = (hex: string) => {
        const bigint = parseInt(hex.slice(1), 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    };

    // Helper: Convert RGB to Lab
    const rgbToLab = ({ r, g, b }: { r: number; g: number; b: number }) => {
        // Normalize RGB values
        r /= 255;
        g /= 255;
        b /= 255;

        // Convert to XYZ space
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
        const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
        const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

        // Convert to Lab space
        const xyz = [x / 0.95047, y / 1.00000, z / 1.08883].map((v) =>
            v > 0.008856 ? Math.cbrt(v) : (v * 903.3 + 16) / 116
        );

        return {
            l: 116 * xyz[1] - 16,
            a: 500 * (xyz[0] - xyz[1]),
            b: 200 * (xyz[1] - xyz[2]),
        };
    };

    // Helper: Calculate Delta-E
    const deltaE = (lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }) => {
        return Math.sqrt(
            Math.pow(lab1.l - lab2.l, 2) +
            Math.pow(lab1.a - lab2.a, 2) +
            Math.pow(lab1.b - lab2.b, 2)
        );
    };

    // Main: Find the nearest color
    const findNearestColor = (hex: string): string => {
        const targetLab = rgbToLab(hexToRgb(hex));
        let nearestColorName = "Unknown Color";
        let smallestDeltaE = Infinity;

        for (const [key, name] of Object.entries(ColourList)) {
            const colorLab = rgbToLab(hexToRgb(key));
            const difference = deltaE(targetLab, colorLab);

            if (difference < smallestDeltaE) {
                smallestDeltaE = difference;
                nearestColorName = name;
            }
        }
        return nearestColorName;
    };

    const handleColorChange = (index: number, colorHex: string, colorName: string) => {
        const updatedVariants = [...variants];
        updatedVariants[index].colorHex = colorHex;
        updatedVariants[index].colorName = findNearestColor(colorHex);
        updatedVariants[index].variantName = `${originalProductName} in ${findNearestColor(colorHex)}`;
        setVariants(updatedVariants);
    };
    
    const handleQuantityChange = (variantIndex: number, size: string, value: number) => {
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            
            const updatedQuantities = {
                ...(updatedVariants[variantIndex].quantities || {}),
                [size]: value,
            };
    
            updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex],
                quantities: updatedQuantities,
            };
    
            return updatedVariants;
        });
    };

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
                                    className="mb-4"
                                />
                            </div>
                            
                            {/* Add Product Images and Information */}
                            <div className="mb-4">
                                <label htmlFor={`fileInput-${index}`} className="block text-sm font-bold text-gray-900 mb-5">
                                    Upload Product Image:*
                                </label>
                                {/* Add Product Image Div */}
                                <div className="w-full h-[300px] bg-slate-400">
                                    <div className="">
                                        <div className="relative w-full h-full">
                                            {/* Left Button */}
                                            {variant.currentSlide > 0 && (
                                                <Button
                                                    type="button"
                                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white ml-2 "
                                                    onClick={(e) => {
                                                        prevSlide(index);
                                                    }}
                                                >
                                                    ◀
                                                </Button>
                                            )}

                                            {/* Image Carousel */}
                                            <div 
                                                ref={(el) => {
                                                    if (carouselRef.current && el) {
                                                        carouselRef.current.children[index] = el;
                                                    }
                                                }}
                                                className="w-full h-full flex space-x-4 overflow-x-hidden"
                                            >
                                                {variant.images?.slice(variant.currentSlide * 2, variant.currentSlide * 2 + 2).map((image, imgIndex) => (
                                                    <div key={imgIndex} className="relative w-full h-[300px] flex justify-center items-center bg-gray-100">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, index, variant.currentSlide * 2 + imgIndex)}
                                                            className="absolute inset-0 opacity-0 w-250 h-full cursor-pointer"
                                                        />
                                                        <Image
                                                            src={
                                                                image || "https://placehold.co/250x250.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
                                                            }
                                                            width={250}
                                                            height={250}
                                                            alt={`Slide ${variant.currentSlide * 2 + imgIndex + 1}`}
                                                            loader={blobLoader}
                                                            priority                                                                
                                                            objectFit="fit"
                                                            className="mx-auto mt-4"
                                                        />
                                                    </div>
                                                ))}
                                            </div>



                                            {/* Right Button */}

                                            {variant.currentSlide < images.length / 2 - 1 && (
                                                <Button
                                                    type="button"
                                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white mr-2"
                                                    onClick={(e) => {
                                                        nextSlide(index);
                                                    }}
                                                >
                                                    ▶
                                                </Button>
                                            )}

                                        </div>
                                    </div>
                                </div>
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
                                                value={variant.colorHex || "#000000"}
                                                onChange={(e) =>
                                                    handleColorChange(
                                                      index,
                                                      e.target.value,
                                                      ColourList[e.target.value] || "Unknown Color"
                                                    )
                                                }
                                                className="mt-2 w-full h-12 border"
                                            />
                                        </div>
                                        <div className="w-full md:w-5/6">
                                            {/* a searchable dropdown that has a list of colors for brands to select */}
                                            <div className="relative">
                                                <Input
                                                    className="w-full px-4 mt-2 border border-gray-300 rounded-md"
                                                    type="text"
                                                    list="colorOptions"
                                                    placeholder="Search and select a color" 
                                                    value={variant.colorName || "Black"}
                                                    onChange={(event) => {
                                                        const inputValue = event.target.value;

                                                        // Update color name directly
                                                        setColorName(inputValue);

                                                        // Find the corresponding hex code if it exists
                                                        const selectedColorHex = Object.keys(ColourList).find(
                                                            (hex) => ColourList[hex].toLowerCase() === inputValue.toLowerCase()
                                                        );

                                                        if (selectedColorHex) {
                                                            setSelectedColor(selectedColorHex);
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        // Validate and reset input to a known color if invalid
                                                        const validHex = Object.keys(ColourList).find(
                                                            (hex) => ColourList[hex].toLowerCase() === colorName.toLowerCase()
                                                        );
                                                        if (!validHex) {
                                                            const nearestHex = findNearestColor(selectedColor);
                                                            setColorName(ColourList[nearestHex]);
                                                            setSelectedColor(nearestHex);
                                                        }
                                                    }}
                                                    
                                                />
                                                <datalist id="colorOptions">
                                                    {Object.entries(ColourList).map(([hex, name]) => (
                                                        <option key={hex} value={name} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p>
                                        Selected Color: <span>{variant.colorName}</span> (<span>{variant.colorHex}</span>)
                                    </p>
                                </div>
                            </div>

                             {/* Variant Sizes and Quantities */}
                             {sizes.length > 0 && (
                                <div className="my-7">
                                    <p className="text-sm font-bold text-gray-900 mb-4">Enter Quantities for Sizes Available:</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {sizes.map((size, sizeIndex) => (
                                            <div key={sizeIndex} className="flex items-center border border-gray-300 rounded-md space-x-2">
                                                <label htmlFor={`size-${index}-${size}`} className="text-center block text-sm font-medium text-gray-700 w-1/5">
                                                    {size}:
                                                </label>
                                                <Input
                                                    id={`size-${index}-${size}`} 
                                                    name={`size-${index}-${size}`} 
                                                    type="number"
                                                    min={0}
                                                    value={variant?.quantities?.[size] ?? 0}
                                                    onChange={(e) =>
                                                        handleQuantityChange(index, size, parseInt(e.target.value, 10))
                                                    }
                                                    className="block border-l p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                                id="currencySymbol"
                                                name="currencySymbol"
                                                type="text"
                                                value={currencySymbol}
                                                readOnly
                                                required
                                                className="text-center block border-l p-2 text-gray-900 bg-transparent w-1/5"
                                            />
                                            {/* Fix Price Input */}
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                dir="rtl"
                                                min={0}
                                                step={0.01}
                                                required
                                                className="block border-l p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variant SKU */}
                            <div className="mt-3">
                                <label htmlFor={`variantSku-${index}`} className="block text-sm font-bold text-gray-900 my-4">
                                    Variant SKU:
                                </label>
                                <Input
                                    id={`variantSku-${index}`}
                                    name={`variantSku-${index}`}
                                    type="text"
                                    //value={variant.sku}
                                    //onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                    placeholder="Enter the variant SKU"
                                />
                            </div>
                            
                            {/* Additional Variant Fields */}
                            {/* (Include other fields like colors, sizes, images as needed for each variant) */}
                        </div>
                        <Button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-red-500 mt-2 bg-transparent"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="30" 
                                height="30" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="lucide lucide-trash-2"
                            >
                                <path 
                                    d="M3 6h18"
                                />
                                <path 
                                    d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                                />
                                <path 
                                    d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                />
                                <line 
                                    x1="10" 
                                    x2="10" 
                                    y1="11" 
                                    y2="17"
                                />
                                <line 
                                    x1="14" 
                                    x2="14" 
                                    y1="11" 
                                    y2="17"
                                />
                            </svg>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
        
    );
};

export default ProductVariantForm;