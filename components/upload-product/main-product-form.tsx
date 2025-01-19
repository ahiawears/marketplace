import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { ProductVariantType } from "@/lib/types";
import { Input } from "../ui/input";
import { ColourList } from "@/lib/coloursList";
import MeasurementSizesTable from "./measurement-sizes-table";
import { CropModal } from "../modals/crop-modal";

interface ProductVariantProps {
    productInformation: ProductVariantType;
    setProductInformation: (productInformation: ProductVariantType) => void;
    originalProductName: string;
    sizes: string[];
    currencySymbol: string;
    category: string;
}

const MainProductForm: React.FC<ProductVariantProps> = ({productInformation, setProductInformation, originalProductName, sizes, currencySymbol, category}) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [colorName, setColorName] = useState("Black");

    const [cropImage, setCropImage] = useState<string | null>(null);
    const [cropIndex, setCropIndex] = useState<number | null>(null);

    const [sku, setSku] = useState<string>("");
    const [showQRCode, setShowQRCode] = useState<boolean>(false);
    const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

    useEffect(() => {
        const isImagesEmpty = Array.isArray(productInformation.images) && productInformation.images.length === 0;

        if (isImagesEmpty) {
            setProductInformation({
                ...productInformation,
                images: ["", "", "", ""],
            });
        } else {
            setProductInformation({ ...productInformation })
        }
    }, []);

    useEffect(() => {
        
        const preventScroll = (event: Event) => event.preventDefault();

        carouselRef.current?.addEventListener("wheel", preventScroll, { passive: false });
        return () => {
            carouselRef.current?.removeEventListener("wheel", preventScroll);
        };
    }, [carouselRef]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
    
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds 2MB");
                return;
            }
    
            const imageUrl = URL.createObjectURL(file);
            setCropImage(imageUrl); 
            setCropIndex(index); 
        }
    };

    const handleCroppedImage = (croppedImage: string) => {
        if (cropIndex !== null) {
            const updatedDetails = { ...productInformation };
            const productImages = [...updatedDetails.images];
            productImages[cropIndex] = croppedImage;
            updatedDetails.images = productImages;
            updatedDetails.main_image_url = productImages[0];
            setProductInformation(updatedDetails as ProductVariantType);
    
            // Reset crop state
            setCropImage(null);
            setCropIndex(null);
        }
    };

    const scrollToCurrentSlide = (slide: number) => {
        const carousel = carouselRef.current;
        if (carousel) {
            const slideWidth = carousel.firstElementChild?.clientWidth || 0;
            const scrollPosition = slide * slideWidth;
            carousel.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };
      
    const nextSlide = () => {
        let updatedDetails = { ...productInformation };
        const pCurrentSlide = updatedDetails.currentSlide;
        const maxSlideIndex = updatedDetails.images.length - 1;
        const newSlide = pCurrentSlide + 1;
        
        if (pCurrentSlide < maxSlideIndex) {
            updatedDetails.currentSlide = newSlide;
            scrollToCurrentSlide(newSlide);
            setProductInformation(updatedDetails);
        }
    };

    const prevSlide = () => {
        let updatedDetails = { ...productInformation };
        const pCurrentSlide = updatedDetails.currentSlide;
        const newSlide = pCurrentSlide - 1;
        if (pCurrentSlide > 0) {
            updatedDetails.currentSlide = newSlide;
            scrollToCurrentSlide(newSlide);
            setProductInformation(updatedDetails);
        }
    };


    const blobLoader = ({ src }: { src: string }) => {
        if (src.startsWith("blob:")) {
            return src; 
        }
        return src;
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
        const colorSet = findNearestColor(hex);

        setSelectedColor(hex);
        setColorName(colorSet);
        setProductInformation({
            ...productInformation,
            colorHex: hex,
            colorName: colorSet,
            variantName: `${originalProductName} in ${findNearestColor(hex)}`,
        });
    };
    
    const handleSkuChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSku(event.target.value);
        generateQRCode();
    };

    const generateQRCode = () => {
        setShowQRCode(true);

        const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
        if (canvas) {
            const base64Image = canvas.toDataURL("image/png");
            setQrCodeBase64(base64Image); 
            console.log(base64Image);
        }
    };

    const handleVariantChange = (field: keyof ProductVariantType, value: any) => {
        const updatedDetails = { ...productInformation, [field]: value };
        setProductInformation(updatedDetails as ProductVariantType);
    };

    const handleMeasurementChange = (size: string, field: string, value: number) => {
        const updatedDetails = {
            ...productInformation,
            measurements: {
                ...productInformation.measurements,
                [size]: {
                    ...(productInformation.measurements[size] || {}),
                    [field]: value,
                },
            },
        };
        setProductInformation(updatedDetails as ProductVariantType);
    };

    return (  
        <div>
            {/* Images Upload */}
            <div>
                <div>
                    <label htmlFor="fileInput" className="block text-sm font-bold text-gray-900 mb-5">
                        Upload Product Images:*
                    </label>
                    <div className="w-full h-[700px] bg-slate-50 flex items-center justify-center">
                        <div className="mt-4">
                            <div className="relative w-full h-[600px]">
                                {productInformation.currentSlide > 0 && (
                                    <Button
                                        type="button"
                                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white ml-2 "
                                        onClick={() => prevSlide()}
                                    >
                                        ◀
                                    </Button>
                                )}

                                <div 
                                    ref={carouselRef} 
                                    className="w-full h-full flex overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth touch-none" 
                                    style={{ scrollSnapType: "none" }}
                                >
                                    {productInformation.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative w-full h-[600px] flex justify-center items-center flex-shrink-0 overflow-x-hidden"
                                        >
                                            <Input
                                                id="fileInput"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, index)}
                                                className="absolute inset-0 opacity-0 w-[510px] h-[650px] cursor-pointer"
                                            />

                                            <Image
                                                src={
                                                    image || "https://placehold.co/510x650.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
                                                }
                                                width={510}
                                                height={650}
                                                alt={`Slide ${index + 1}`}
                                                loader={blobLoader}
                                                priority
                                                style={{objectFit:"contain"}}
                                                className="mx-auto mt-4 align-middle"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {productInformation.currentSlide < productInformation.images.length / 1 - 1 && (
                                    <Button
                                        type="button"
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white mr-2"
                                        onClick={() => nextSlide()}
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
                                    value={productInformation.colorHex ? productInformation.colorHex : selectedColor}
                                    onChange={handleColorChange}
                                    className="mt-2 w-full h-12 border"
                                />
                            </div>
                            <div className="w-full md:w-5/6">
                                <div className="relative">
                                    <Input
                                        name="colorPicker"
                                        className="w-full px-4 mt-2 border border-gray-300 rounded-md"
                                        type="text"
                                        list="colorOptions"
                                        placeholder="Search and select a color" 
                                        value={colorName}
                                        // THIS IS CORRECT, DO NOT CHANGE
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            setColorName(inputValue);

                                            const selectedColorHex = Object.keys(ColourList).find(
                                                (hex) => ColourList[hex].toLowerCase() === inputValue.toLowerCase()
                                            );
                                            if (selectedColorHex) {
                                                setSelectedColor(selectedColorHex);
                                                
                                                setProductInformation({
                                                    ...productInformation,
                                                    colorHex: selectedColorHex,
                                                    colorName: inputValue,
                                                });
                                            }
                                            
                                        }}
                                        onBlur={() => {
                                            const validHex = Object.keys(ColourList).find(
                                                (hex) => ColourList[hex].toLowerCase() === colorName.toLowerCase()
                                            );
                                            if (!validHex) {
                                                const nearestHex = findNearestColor(selectedColor);
                                                setColorName(ColourList[nearestHex]);
                                                setSelectedColor(nearestHex);
                                                const sColorName = ColourList[nearestHex];
                                                
                                                setProductInformation({
                                                    ...productInformation,
                                                    colorHex: nearestHex,
                                                    colorName: sColorName,
                                                });
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
                    {category && 
                        <div>
                            <h3 className="block text-sm font-bold text-gray-900">
                                Product Measurements Available:*
                            </h3>
                            <MeasurementSizesTable
                                category={category}
                                measurements={productInformation.measurements}
                                onMeasurementChange={handleMeasurementChange}                 
                                sizes={sizes}
                            />   
                        </div>
                    }
                </div>

                {/*  Add Products Price */}
                <div className="my-5">
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
                                    className="text-center block border-l p-2 text-gray-900 bg-transparent w-1/5"
                                />
                                {/* Fix Price Input */}
                                <Input
                                    id="price"
                                    type="number"
                                    dir="rtl"
                                    min={0}
                                    step={0.01}
                                    required
                                    className="block border-l p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                                    onChange={(e) => {
                                        handleVariantChange("price", e.target.value);
                                    }}
                                    value={productInformation.price}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex flex-col lg:flex-row space-x-4">
                    {/* Product SKU */}
                    <div className="lg:basis-1/2 ">
                        <div>
                            <label htmlFor="sku" className="block text-sm font-bold text-gray-900">
                                SKU (Stock Keeping Unit):
                            </label>
                            <div className="mt-2">
                                <Input
                                    id="sku"
                                    type="text"
                                    required
                                    value={productInformation.sku}
                                    onChange={(e) => {
                                        handleVariantChange("sku", e.target.value);
                                        handleSkuChange(e);
                                    }}
                                    placeholder="Enter the product SKU"
                                    className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Product Code */}
                    <div className="lg:basis-1/2 ">
                        <div>
                            <label htmlFor="productCode" className="block text-sm font-bold text-gray-900">
                                Product Code:
                            </label>
                            <div className="mt-2">
                                <Input
                                    id="productCode"
                                    type="text"
                                    required
                                    value={productInformation.productCode}
                                    onChange={(e) => {
                                        handleVariantChange("productCode", e.target.value);
                                    }}
                                    placeholder="Enter the Product Code"
                                    className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {cropImage && (
                <CropModal
                    image={cropImage}
                    onClose={(croppedImage) => {
                        if (croppedImage) {
                            handleCroppedImage(croppedImage);
                        } else {
                            setCropImage(null);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default MainProductForm;