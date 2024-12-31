import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { ProductVariantType } from "@/lib/types";
import { Input } from "../ui/input";
import { ColourList } from "@/lib/coloursList";
import MeasurementSizesTable from "./measurement-sizes-table";

interface ProductVariantProps {
    variants: ProductVariantType[];
    setVariants: React.Dispatch<React.SetStateAction<ProductVariantType[]>>;
    originalProductName: string;
    sizes: string[];
    currencySymbol: string;
    category: string;
}

const MainProductForm: React.FC<ProductVariantProps> = ({variants, setVariants, originalProductName, sizes, currencySymbol, category}) => {

    const [currentSlide, setCurrentSlide] = useState(0);
    const [images, setImages] = useState<string[]>(["", "", "", ""]);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [colorName, setColorName] = useState("Black");

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
    
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds 2MB");
                //add a modal here
                return;
            }
    
            // Simulate an upload or create a blob URL for temporary preview
            const imageUrl = URL.createObjectURL(file); // Temporary local preview
            setImages((prevImages) => {
                const newImages = [...prevImages];
                newImages[index] = imageUrl;
                return newImages;
            });
    
            // If uploading to a server, replace the blob URL with the server URL
            // Example (pseudo-code for server upload):
            // const uploadedUrl = await uploadToServer(file);
            // setImages((prevImages) => {
            //   const newImages = [...prevImages];
            //   newImages[index] = uploadedUrl;
            //   return newImages;
            // });
        }
    };

    const scrollToCurrentSlide = (slide: number) => {
        const carousel = carouselRef.current;
        if (carousel) {
            const slideWidth = carousel.offsetWidth;
            const scrollPosition = slide * slideWidth;
            carousel.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };
      
    const nextSlide = () => {
        if (currentSlide < images.length - 1) {
            setCurrentSlide((prevSlide) => prevSlide + 1);
            scrollToCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide((prevSlide) => prevSlide - 1);
            scrollToCurrentSlide(currentSlide - 1);
        }
    };


    const blobLoader = ({ src }: { src: string }) => {
        if (src.startsWith("blob:")) {
            return src; // Let the browser handle blob URLs directly
        }
        return src; // Default behavior
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

    //Calculate Delta-E
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

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const hex = event.target.value;
        setSelectedColor(hex);
        setColorName(findNearestColor(hex));
    };
    
    return (
        
        <div>
            {/* Images Upload */}
            <div>
                <label htmlFor="fileInput" className="block text-sm font-bold text-gray-900 mb-5">
                    Upload Product Images:*
                </label>
                <div className="w-full h-[600px] bg-slate-50">
                    <div className="mt-4">
                        <div className="relative w-full h-[600px]">
                            {currentSlide > 0 && (
                                <Button
                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white ml-2 "
                                    onClick={prevSlide}
                                >
                                    ◀
                                </Button>
                            )}

                            <div 
                                ref={carouselRef} 
                                className="w-full h-full flex overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
                                style={{ scrollSnapType: "x mandatory" }}
                            >
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative w-full h-[600px] flex justify-center items-center flex-shrink-0 overflow-x-hidden"
                                        //style={{ scrollSnapAlign: 'center', width: 250 }}

                                    >
                                        
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, index)}
                                            className="absolute inset-0 opacity-0 w-full h-[600px] cursor-pointer"
                                        />

                                        <Image
                                            src={
                                                image || "https://placehold.co/210x500.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
                                            }
                                            width={250}
                                            height={600}
                                            alt={`Slide ${index + 1}`}
                                            loader={blobLoader}
                                            priority
                                            className="mx-auto"
                                        />
                                    </div>
                                ))}
                            </div>

                            {currentSlide < images.length / 1 - 1 && (
                                <Button
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white mr-2"
                                    onClick={nextSlide}
                                >
                                    ▶
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* colour div */}
            <div className="space-y-4 my-5">
                <div>
                    <label htmlFor="colorPicker" className="block text-sm font-bold text-gray-900">
                        Products Colour:
                    </label>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="w-full md:w-1/6">
                            <Input
                                type="color"
                                id="colorPicker"
                                value={selectedColor}
                                onChange={handleColorChange}
                                className="mt-2 w-full h-12 border"
                            />
                        </div>
                        <div className="w-full md:w-5/6">
                            <div className="relative">
                                <Input
                                    className="w-full px-4 mt-2 border border-gray-300 rounded-md"
                                    type="text"
                                    list="colorOptions"
                                    placeholder="Search and select a color" 
                                    value={colorName || ''}
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
                        Selected Color: <span>{colorName}</span> (<span>{selectedColor}</span>)
                    </p>
                </div>
            </div>

            {/* Quantity and Measurements */}
            <div>
                <label htmlFor="measurementsList" className="block text-sm font-bold text-gray-900">
                    Product Measurements Available:*
                </label>
            </div>
            {category && 
                <MeasurementSizesTable category={category} />    
            }
        </div>
    );
};

export default MainProductForm;