import { use, useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select } from "./select";
import { categoriesList } from "@/lib/categoriesList";
import { currency } from "@/lib/currencyList";
import { Button } from "./button";
import Image from "next/image";
import { ColourList } from "@/lib/coloursList";
import { QRCodeCanvas } from "qrcode.react";
import { GeneralProductDetailsType, ProductUploadData, ProductVariantType } from "@/lib/types";
import ProductVariantForm from "../upload-product/product-variant-form";
import GeneralProductDetails from "../upload-product/general-product-details";
import Accordion from "./Accordion";
import PhysicalProductAttributes from "../upload-product/physical-product-attributes";
import MainProductForm from "../upload-product/main-product-form";
    
const AddProductDetails = () => {
    const [productName, setProductName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [sizes, setSizes] = useState<string[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
    const [quantities, setQuantities] = useState<{ [size: string]: number }>({});
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [currencyCode, setCurrencyCode] = useState("");
    const [currencySymbol, setCurrencySymbol] = useState("");
    const [isMounted, setIsMounted] = useState(false); 
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<string[]>(["", "", "", ""]);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [colorName, setColorName] = useState("Black");
    const [sku, setSku] = useState<string>(""); 
    const [showQRCode, setShowQRCode] = useState<boolean>(false); 
    const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
    const [originalProductName, setOriginalProductName] = useState(productName);
    const [variantName, setVariantName] = useState("");
    //const [productVariants, setProductVariants] = useState<ProductVariantType[]>([]);

    const [bodyMeasured, setBodyMeasured] = useState<string[]>([]);
    const [catName, setCatName] = useState("");



    const [productData, setProductData] = useState<ProductUploadData>({
        generalDetails: {
          productName: "",
          productDescription: "",
          category: "",
          subCategory: "",
          tags: [],
          currency: "",
          material: "",
        },
        productInformation: {
          currentSlide: 0,
          main_image_url: "",
          productId: "",
          variantId: "",
          variantName: "",
          variantSku: "",
          quantities: {},
          images: [],
          colorName: "",
          price: "",
          colorHex: "",
          currency: "",
          sku: "",
        },
        productVariants: [],
      });

    // const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //     const categoryName = event.target.value;
    //     setSelectedCategory(categoryName);

    //     const category = categoriesList.find((cat) => cat.name === categoryName);
    //     setSubcategories(category?.subcategories || []);
    //     setCustomTags(category ? category.tags : []); 

    //     setSizes(category?.sizes || []); // Assuming sizes are part of categoriesList

    //     // Initialize quantities for each size
    //     const initialQuantities: { [size: string]: number } = {};
    //     (category?.sizes || []).forEach((size) => {
    //         initialQuantities[size] = 0; // Default quantity 0
    //     });
    //     setQuantities(initialQuantities);
        
    //     setSelectedSubcategory("");
    //     setSelectedTags([]);
    // };

    const handleSubcategorySelect = (subcategory: string) => {
        setSelectedSubcategory(subcategory);
    };

    const handleTagClick = (tag: string) => {
        setSelectedTags(prevTags => {
            if (prevTags.includes(tag)) {
                return prevTags.filter(t => t !== tag);
            } else if (prevTags.length < 3) {
                return [...prevTags, tag];
            }
            return prevTags;
        });
    };

    const handleQuantityChange = (size: string, value: number) => {
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [size]: value,
        }));
    };

    const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrencyId = parseInt(event.target.value);
        const sCurrency = currency.find((c) => c.id === selectedCurrencyId);

        if (sCurrency) {
            setSelectedCurrency(String(selectedCurrencyId));
            setCurrencySymbol(sCurrency.symbol);
            setCurrencyCode(sCurrency.code);
        }
    }

    const scrollToCurrentSlide = (slide: number) => {
        const scrollPosition = slide * 500; // Each image is 500px wide
        if (carouselRef.current) {
            carouselRef.current.scroll({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };

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

    const nextSlide = () => {
        if (currentSlide < images.length / 2 - 1) {
            setCurrentSlide(currentSlide + 1);
            scrollToCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
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
    
    const handleSkuChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSku(event.target.value);
        generateQRCode();
    };


    const generateQRCode = () => {
        setShowQRCode(true);

        const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
        if (canvas) {
            const base64Image = canvas.toDataURL("image/png"); // Convert QR code to base64
            setQrCodeBase64(base64Image);  // Set base64 image in state
            console.log(base64Image);
        }
    };
    async function urlToFile(url: string): Promise<File> {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], "image.jpg", { type: blob.type });
    }


    const getColorName = (hex: string): string => {
        return ColourList[hex.toUpperCase()] || findNearestColor(hex);
    };


    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
     
    //     const productData = {
    //         productName,
    //         selectedCategory,
    //         selectedSubcategory,
    //         quantities,
    //         currencyCode,
    //         productVariants, // Includes the variant details
    //     };
    
    //     console.log("Product Data Submitted:", productData);
    //     // Send `productData` to the backend
    // };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Gather all form data
        // const productData = {
        //     generalDetails, // Include general details
        //     // Add other state variables here, e.g., images, variants, etc.
        // };

        console.log("Product Data Submitted:", productData);

        // TODO: Send `productData` to the backend or further processing
    };
    const productCurrency = productData.generalDetails.currency;
    const productCurrencySymbol = currency.find((c) => c.code === productCurrency)?.symbol || "";

    const setGeneralDetails = (details: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => {
        setProductData((prev) => ({
            ...prev,
            generalDetails: typeof details === 'function' ? details(prev.generalDetails) : details,
        }));
    };

    const setProductVariants = (variants: ProductVariantType[] | ((prev: ProductVariantType[]) => ProductVariantType[])) => {
        setProductData((prev) => ({
            ...prev, 
            productVariants: typeof variants === 'function' ? variants(prev.productVariants) : variants,
        }));
    };

    const setProductInformation = (info: Partial<ProductUploadData['productInformation']>) => {
        setProductData((prev) => ({
            ...prev,
            productInformation: {
                ...prev.productInformation,
                ...info,
            },
        }));
    };
    
    const accordionItems = [
        {
            title: "General Product Details",
            content: <GeneralProductDetails generalDetails={productData.generalDetails} setGeneralDetails={setGeneralDetails} />
        }, 
        {
            title: "Product Information",
            content: <MainProductForm productInformation={productData.productInformation} setProductInformation={setProductInformation} originalProductName={productData.generalDetails.productName} sizes={sizes} currencySymbol={productCurrencySymbol} category={productData.generalDetails.category}/>
        },
        {
            title: "Add Product Variants",
            content: <ProductVariantForm variants={productData.productVariants} setVariants={setProductVariants} originalProductName={productData.generalDetails.productName} sizes={sizes} currencySymbol={productCurrencySymbol} category={productData.generalDetails.category}/>
        }
    ];

    useEffect(() => {
        console.log("General Details updated:", productData);
    }, [productData]);

   

    return (
        <div className="border rounded-lg shadow-sm mx-auto">
            <form onSubmit={handleSubmit}>
                <Accordion items={accordionItems} />
                {/* <div className="product-details">
                    <h2 className="text-lg font-semibold mb-4">General Product Details</h2>

                    <div className="mb-4">
                        <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                            Enter Product Name:* 
                        </label>
                        <div className="mt-2">
                            <Input
                                id="productName"
                                name="productName"
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                required
                            />
                        </div>    
                    </div>

                    <div className="mb-4">
                        <label htmlFor="productDescription" className="block text-sm font-bold text-gray-900">
                            Enter Product Description:*
                        </label>
                        <div className="mt-2">
                            <Textarea
                                id="productDescription"
                                name="productDescription"
                                rows={4}
                                required
                                placeholder="Enter the product description here"
                            />
                        </div>
                    </div>

                    <div className="mb-4"> 
                        <div className="mb-4">
                            <label htmlFor="category" className="block text-sm font-bold text-gray-900">
                                Category:*
                            </label>
                            <div className="mt-2">
                                <Select
                                    id="category"
                                    name="category"
                                    onChange={handleCategoryChange}
                                    value={selectedCategory}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categoriesList.map((category) => (
                                        <option key={category.name} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {subcategories.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-bold text-gray-900 mb-2">Subcategories:</p>
                                <div className="flex flex-wrap gap-2">
                                    {subcategories.map((sub, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handleSubcategorySelect(sub)}
                                            className={`px-3 py-1 rounded-full text-sm cursor-pointer 
                                                ${selectedSubcategory === sub 
                                                    ? "bg-indigo-500 text-white" 
                                                    : "bg-indigo-200 text-indigo-800"} 
                                                hover:bg-indigo-300`}
                                        >
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {customTags.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-bold text-gray-900 mb-2">Tags:</p>
                                <div className="flex flex-wrap gap-2">
                                    {customTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className={`px-3 py-1 rounded-full text-sm cursor-pointer 
                                                ${selectedTags.includes(tag) 
                                                    ? "bg-indigo-500 text-white" 
                                                    : "bg-indigo-200 text-indigo-800"} 
                                                hover:bg-indigo-300`}
                                            onClick={() => handleTagClick(tag)}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="weight" className="block text-sm font-bold text-gray-900">
                            Weight in kg:
                        </label>
                        <div className="mt-2">
                            <Input
                                id="weight"
                                name="weight"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter the product weight in kilograms "
                                className="[&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label htmlFor="price" className="block text-sm font-bold text-gray-900 mb-2">
                            Product Price:*
                        </label>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/2">
                                <Select
                                    id="currency"
                                    name="currency"
                                    value={selectedCurrency}
                                    onChange={handleCurrencyChange}
                                    className="block border-l bg-transparent"
                                >
                                    <option value="" disabled>
                                        Select Currency
                                    </option>
                                    {currency.map((sCurrency) => (
                                        <option key={`${sCurrency.code}-${sCurrency.name}`} value={sCurrency.id}>
                                            {`${sCurrency.symbol + " " + sCurrency.name + " " + sCurrency.code}`}
                                        </option>
                                    ))}
                                </Select>
                                
                            </div>

                            <div className="w-full md:w-1/2">
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
                </div>

                <div>
                    <label htmlFor="fileInput" className="block text-sm font-bold text-gray-900 mb-5">
                        Upload Product Image:*
                    </label>
                    <div className="w-full h-[250px] bg-slate-50">
                        <div className="mt-4">
                            <div className="relative w-full h-full">
                                {currentSlide > 0 && (
                                    <Button
                                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-transparent p-2 rounded-full text-black hover:text-white ml-2 "
                                        onClick={prevSlide}
                                    >
                                        ◀
                                    </Button>
                                )}

                                <div ref={carouselRef} className="w-full h-full flex space-x-4 overflow-x-hidden">
                                    {images.slice(currentSlide * 2, currentSlide * 2 + 2).map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative w-full h-[250px]"
                                        >
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, currentSlide * 2 + index)}
                                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                            />

                                            <Image
                                                src={
                                                    image || "https://placehold.co/210x210.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
                                                }
                                                width={215}
                                                height={215}
                                                alt={`Slide ${currentSlide * 2 + index + 1}`}
                                                loader={blobLoader}
                                                priority
                                                className="mx-auto pt-4"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {currentSlide < images.length / 2 - 1 && (
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

                {sizes.length > 0 && (
                    <div className="my-7">
                        <p className="text-sm font-bold text-gray-900 mb-4">Enter Quantities for Sizes Available:</p>
                        <div className="grid grid-cols-3 gap-4">
                            {sizes.map((size, index) => (
                                <div key={index} className="flex items-center border border-gray-300 rounded-md space-x-2">
                                    <label htmlFor={`${size}`} className="text-center block text-sm font-medium text-gray-700 w-1/5">
                                        {size}:
                                    </label>
                                
                                    <Input
                                        id={`${size}`}
                                        name={`${size}`}
                                        type="number"
                                        min={1}
                                        value={quantities[size]}
                                        onChange={(e) => handleQuantityChange(size, Number(e.target.value))}
                                        className="block border-l p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="sku" className="block text-sm font-bold text-gray-900">
                        SKU (Stock Keeping Unit):
                    </label>
                    <div className="mt-2">
                        <Input
                            id="sku"
                            name="sku"
                            type="text"
                            required
                            value={sku}
                            onChange={handleSkuChange}
                            placeholder="Enter the SKU"
                        />
                    </div> 

                    {sku && (
                        <div className="mt-4">
                            <QRCodeCanvas value={sku} size={128} id="qr-code"/>
                        </div>
                        
                    )}
                </div>

                <ProductVariantForm variants={productVariants} setVariants={setProductVariants} originalProductName={productName} sizes={sizes} currencySymbol={currencySymbol}/>

                <div>
                    <Button 
                        type="submit"
                        //onClick={handleSubmit}
                        className="text-black bg-transparent hover:text-white px-4 py-2 rounded-md"
                    >
                        Submit product with variants
                    </Button> 
                </div> */}
                
            </form>
        </div>
    );
}

export default AddProductDetails