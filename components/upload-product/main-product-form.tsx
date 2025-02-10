import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { ProductVariantType } from "@/lib/types";
import { Input } from "../ui/input";
import { ColourList } from "@/lib/coloursList";
import MeasurementSizesTable from "./measurement-sizes-table";
import { CropModal } from "../modals/crop-modal";
import { findNearestColor } from "@/lib/findNearestColor";
import { Pencil } from "lucide-react";

interface ProductVariantProps {
    productInformation: ProductVariantType;
    setProductInformation: (productInformation: ProductVariantType) => void;
    originalProductName: string;
    sizes: string[];
    currencySymbol: string;
    category: string;
    onSaveAndContinue: () => void;
}

const MainProductForm: React.FC<ProductVariantProps> = ({productInformation, setProductInformation, originalProductName, sizes, currencySymbol, category, onSaveAndContinue }) => {
    const [localDetails, setLocalDetails] = useState<ProductVariantType>(productInformation);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

    const carouselRef = useRef<HTMLDivElement>(null);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [colorName, setColorName] = useState("Black");

    const [cropImage, setCropImage] = useState<string | null>(null);
    const [cropIndex, setCropIndex] = useState<number | null>(null);

    const [sku, setSku] = useState<string>("");
    const [showQRCode, setShowQRCode] = useState<boolean>(false);
    const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

    useEffect(() => {
        const isImagesEmpty = Array.isArray(localDetails.images) && localDetails.images.length === 0;
        if (isImagesEmpty) {
            
            setLocalDetails({
                ...localDetails,
                images: ["", "", "", ""],
            })
        } else {

            setLocalDetails({ ...localDetails });
            scrollToCurrentSlide(localDetails.currentSlide);
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
            const updatedDetails = { ...localDetails };
            const productImages = [...updatedDetails.images];
            productImages[cropIndex] = croppedImage;
            updatedDetails.images = productImages;
            updatedDetails.main_image_url = productImages[0];
            setLocalDetails(updatedDetails as ProductVariantType);
    
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
        let updatedDetails = { ...localDetails };
        const pCurrentSlide = updatedDetails.currentSlide;
        const maxSlideIndex = updatedDetails.images.length - 1;
        const newSlide = pCurrentSlide + 1;
        
        if (pCurrentSlide < maxSlideIndex) {
            updatedDetails.currentSlide = newSlide;
            scrollToCurrentSlide(newSlide);
            setLocalDetails(updatedDetails);
        }
    };

    const prevSlide = () => {
        let updatedDetails = { ...localDetails };
        const pCurrentSlide = updatedDetails.currentSlide;
        const newSlide = pCurrentSlide - 1;
        if (pCurrentSlide > 0) {
            updatedDetails.currentSlide = newSlide;
            scrollToCurrentSlide(newSlide);
            setLocalDetails(updatedDetails);
        }
    };


    const blobLoader = ({ src }: { src: string }) => {
        if (src.startsWith("blob:")) {
            return src; 
        }
        return src;
    };


    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const hex = event.target.value;
        const colorSet = findNearestColor(hex);

        setSelectedColor(hex);
        setColorName(colorSet);
        
        setLocalDetails((prev) => ({
            ...prev,
            colorHex: hex,
            colorName: colorSet,
            variantName: `${originalProductName} in ${findNearestColor(hex)}`,
        }))
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
        if (field === "remove") {
            // Remove the size from measurements
            const updatedMeasurements = { ...localDetails.measurements };
            delete updatedMeasurements[size];
            setLocalDetails((prev) => ({
                ...prev,
                measurements: updatedMeasurements,
            }));
        } else {
            const updatedDetails = {
                ...localDetails,
                measurements: {
                    ...localDetails.measurements,
                    [size]: {
                        ...(localDetails.measurements[size] || {}),
                        [field]: value,
                    },
                },
            };
            setLocalDetails(updatedDetails as ProductVariantType);
        }
        
    };

    // Validate if all selected sizes have a quantity
    const areMeasurementsValid = () => {
        return selectedSizes.every((size) => localDetails.measurements[size]?.quantity);
    };

    const handleEditClick = (index: number) => {
        event?.preventDefault();
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index]?.click();
        }
    };

    const handleSave = () => {
        //set local details here 
        setProductInformation(localDetails);
        //add onsave and continue
        onSaveAndContinue();
    }

    const handleChange = (field: keyof ProductVariantType, value: string | string[]) => {
        setLocalDetails((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const isFormValid = () => {
        // Check if all required fields are filled
        return (
            localDetails.images.every(image => image !== "") &&
            localDetails.colorName.trim() !== "" &&
            localDetails.colorHex.trim() !== "" &&
            localDetails.price.trim() !== "" &&
            localDetails.sku.trim() !== "" &&
            localDetails.productCode.trim() !== "" &&
            //get the measurements and validate
            areMeasurementsValid()
        );
    };

    return (  
        <div>
            {/* Images Upload */}
            <div className="mb-4">
                <div>
                    <label htmlFor="fileInput" className="block text-sm font-bold text-gray-900 mb-5">
                        Upload Product Images:*
                    </label>
                    <div className="w-full bg-slate-50 flex items-center justify-center">
                        <div className="">
                            <div className="relative w-full h-[600px]">
                                {localDetails.currentSlide > 0 && (
                                    <Button
                                        type="button"
                                        className="absolute left-0 top-1/2 transform bg-white -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white ml-2 "
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
                                    {localDetails.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative w-full h-[650px] flex justify-center items-center flex-shrink-0 overflow-x-hidden"
                                        >
                                            <Image
                                                src={
                                                    image ? image : "https://placehold.co/510x650.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
                                                }
                                                width={510}
                                                height={650}
                                                alt={`Slide ${index + 1}`}
                                                loader={blobLoader}
                                                priority
                                                style={{objectFit:"contain"}}
                                                className="mx-auto align-middle"
                                            />
                                            <div className="absolute top-4 right-4">
                                                <Button onClick={() => handleEditClick(index)} className="bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition">
                                                    <Pencil />
                                                </Button>
                                                <Input
                                                    type="file"
                                                    ref={(el) => { fileInputRefs.current[index] = el; }}
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleFileChange(e, index)}
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {localDetails.currentSlide < localDetails.images.length / 1 - 1 && (
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
                                    value={localDetails.colorHex ? localDetails.colorHex : selectedColor}
                                    onChange={handleColorChange}
                                    className="mt-2 w-full h-12 border-2"
                                />
                            </div>
                            <div className="w-full md:w-5/6">
                                <div className="relative">
                                    <Input
                                        name="colorPicker"
                                        className="w-full px-4 mt-2 border-2"
                                        type="text"
                                        list="colorOptions"
                                        placeholder="Search and select a color" 
                                        value={localDetails.colorName ? localDetails.colorName : colorName}
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
                            Selected Color: <span>{localDetails.colorName ? localDetails.colorName : colorName}</span> (<span>{localDetails.colorHex ? localDetails.colorHex : selectedColor}</span>)
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
                                measurements={localDetails.measurements}
                                onMeasurementChange={handleMeasurementChange} 
                                setSelectedSizes={setSelectedSizes}                 
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
                                        handleChange("price", e.target.value);
                                    }}
                                    value={localDetails.price}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex flex-col lg:flex-row lg:space-x-4 md:flex-col gap-y-4">
                    {/* Product SKU */}
                    <div className="lg:basis-1/2">
                        <div>
                            <label htmlFor="sku" className="block text-sm font-bold text-gray-900">
                                SKU (Stock Keeping Unit):
                            </label>
                            <div className="mt-2">
                                <Input
                                    id="sku"
                                    type="text"
                                    required
                                    value={localDetails.sku}
                                    onChange={(e) => {
                                        handleChange("sku", e.target.value);
                                        handleSkuChange(e);
                                    }}
                                    placeholder="Enter the product SKU"
                                    className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Product Code */}
                    <div className="lg:basis-1/2">
                        <div className="">
                            <label htmlFor="productCode" className="block text-sm font-bold text-gray-900">
                                Product Code:
                            </label>
                            <div className="mt-2">
                                <Input
                                    id="productCode"
                                    type="text"
                                    required
                                    value={localDetails.productCode}
                                    onChange={(e) => {
                                        handleChange("productCode", e.target.value);
                                    }}
                                    placeholder="Enter the Product Code"
                                    className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5">
                    <Button
                        onClick={handleSave}
                        disabled={!isFormValid()}
                        className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Save and continue
                    </Button>
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