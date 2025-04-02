import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { ProductVariantType } from "@/lib/types";
import { Input } from "../ui/input";
import { ColourList } from "@/lib/coloursList";
import MeasurementSizesTable from "./measurement-sizes-table";
import { CropModal } from "../modals/crop-modal";
import { findNearestColor } from "@/lib/findNearestColor";
import { MoneyInput } from "../ui/money-input";
import ProductImageUploadGrid from "./product-image-upload-grid";
import { SearchableSelect } from "../ui/searchable-select";

interface ProductVariantProps {
    productInformation: ProductVariantType;
    setProductInformation: (productInformation: ProductVariantType) => void;
    originalProductName: string;
    sizes: string[];
    currencySymbol: string;
    category: string;
    onSaveAndContinue: () => void;
    onProductInformationChange: (field: keyof ProductVariantType, value: string | string[]) => void;
    hasUnsavedChanges: boolean;
}

const MainProductForm: React.FC<ProductVariantProps> = ({
    productInformation,
    setProductInformation,
    originalProductName,
    sizes,
    currencySymbol,
    category,
    onSaveAndContinue,
    onProductInformationChange,
    hasUnsavedChanges,
}) => {
    const [localDetails, setLocalDetails] = useState<ProductVariantType>(productInformation);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

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
            });
        } else {
            setLocalDetails({ ...localDetails });
        }
    }, []);

    const handleImagesChange = (newImages: string[]) => {
        setLocalDetails((prev) => ({
            ...prev,
            images: newImages,
            main_image_url: newImages[0] || "", // Set the first image as the main image
        }));
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
        }));
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

    const handleMeasurementChange = (size: string, field: string, value: number) => {
        if (field === "remove") {
            // Remove the size from measurements
            const updatedMeasurements = { ...localDetails.measurements };
            delete updatedMeasurements[size];
            setLocalDetails((prev) => ({
                ...prev,
                measurements: updatedMeasurements,
            }));
            setSelectedSizes(prevSizes => prevSizes.filter(s => s !== size));
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

    const handleSave = () => {
        setProductInformation(localDetails);
        onSaveAndContinue();
    };

    const handleChange = (field: keyof ProductVariantType, value: string | string[]) => {
        onProductInformationChange(field, value);
        setLocalDetails((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const isFormValid = () => {
        // Check if all required fields are filled
        return (
            localDetails.images.every((image) => typeof image === "string") &&
            localDetails.colorName.trim() !== "" &&
            localDetails.colorHex.trim() !== "" &&
            localDetails.price.trim() !== "" &&
            localDetails.sku.trim() !== "" &&
            localDetails.productCode.trim() !== "" &&
            areMeasurementsValid()
        );
    };

    return (
        <div>
            {/* Images Upload */}
            <div className="mb-4">
                <label htmlFor="fileInput" className="block text-sm font-bold text-gray-900 mb-5">
                    Upload Product Images:*
                </label>
                <ProductImageUploadGrid
                    images={localDetails.images}
                    onImagesChange={handleImagesChange}
                />
            </div>

            {/* Colour div */}
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
                                <SearchableSelect
                                    options={ColourList} // Pass the array of color objects
                                    getOptionLabel={(color) => color.name} // How to get the label
                                    onSelect={(selectedColor) => {
                                        // Update the variant with the selected color
                                        handleColorChange({target: {value: selectedColor.hex}} as React.ChangeEvent<HTMLInputElement>);
                                    }}
                                    placeholder="Search and select a color"
                                />
                                {/* <Input
                                    name="colorPicker"
                                    className="w-full px-4 mt-2 border-2"
                                    type="text"
                                    list="colorOptions"
                                    placeholder="Search and select a color"
                                    value={localDetails.colorName ? localDetails.colorName : colorName}
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
                                </datalist> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <p>
                        Selected Color: <span>{localDetails.colorName ? localDetails.colorName : colorName}</span> (
                        <span>{localDetails.colorHex ? localDetails.colorHex : selectedColor}</span>)
                    </p>
                </div>
            </div>

            {/* Quantity and Measurements */}
            <div>
                {category && (
                    <div>
                        <h3 className="block text-sm font-bold text-gray-900">
                            Product Measurements Available:*
                        </h3>
                        <MeasurementSizesTable
                            category={category}
                            measurements={localDetails.measurements}
                            onMeasurementChange={handleMeasurementChange}
                            setSelectedSizes={setSelectedSizes}
                            selectedSizes={selectedSizes}
                        />
                    </div>
                )}
            </div>

            {/* Add Products Price */}
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
                            <MoneyInput
                                id="price"
                                required
                                className="block border-2 p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                                onChange={(e) => {
                                    handleChange("price", e.target.value);
                                }}
                                value={localDetails.price}
                                placeholder="0.00"
                            />
                        </div>
                        <p className="my-5 ">
                            Product Variant Price: <span className="text-green-700">&emsp;{currencySymbol} {localDetails.price}</span>
                        </p>
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
                                className="block w-full p-2 border-2 rounded-lg focus:outline-none focus:ring-2 "
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
                                className="block w-full p-2 border-2 rounded-lg focus:outline-none focus:ring-2"
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

            {/* Crop Modal */}
            {cropImage && (
                <CropModal
                    image={cropImage}
                    onClose={(croppedImage) => {
                        if (croppedImage) {
                            handleImagesChange(
                                localDetails.images.map((img, idx) =>
                                    idx === cropIndex ? croppedImage : img
                                )
                            );
                        }
                        setCropImage(null);
                        setCropIndex(null);
                    }}
                />
            )}
        </div>
    );
};

export default MainProductForm;