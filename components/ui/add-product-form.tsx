"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { categoriesList } from "@/lib/categoriesList";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeCanvas } from "qrcode.react";
import { addProduct } from "@/actions/uploadProduct";
import { ProductData } from "@/lib/types";
import { useRouter } from "next/navigation";
import PublishProduct from "./publish-product";
import AddProductDetails from "./add-product-details";


interface AddProductFormProps {
  initialData?: ProductData;
}

const AddProductForm = ({ initialData }: AddProductFormProps) => {
  const [productName, setProductName] = useState(
    initialData?.productName || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.category || ""
  );
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>(["", "", "", ""]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sizes, setSizes] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<{ [size: string]: number }>({});
  const [sku, setSku] = useState<string>("");
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    undefined
  );

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (initialData) {
      setProductName(initialData.productName || "");
      setSelectedCategory(initialData.category || "");
      setSelectedSubcategory(initialData.subCategory || "");
      setSelectedTags(initialData.tags || []);
      setImages(initialData.images || ["", "", "", ""]);
      setSku(initialData.sku || "");
      setQuantities(initialData.quantities || {});
    }
  }, [initialData]);

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
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else if (prevTags.length < 3) {
        return [...prevTags, tag];
      }
      return prevTags;
    });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setCurrentImage(imageUrl);
      setImages((prevImages) => {
        const newImages = [...prevImages];
        newImages[index] = imageUrl;
        return newImages;
      });
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

  const scrollToCurrentSlide = (slide: number) => {
    const scrollPosition = slide * 500; // Each image is 500px wide
    if (carouselRef.current) {
      carouselRef.current.scroll({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const handleQuantityChange = (size: string, value: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [size]: value,
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
      const base64Image = canvas.toDataURL("image/png"); // Convert QR code to base64
      setQrCodeBase64(base64Image); // Set base64 image in state
      console.log(base64Image);
    }
  };
  
  async function urlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], "image.jpg", { type: blob.type });
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget); // Use currentTarget here

    formData.append("qrCode", qrCodeBase64);
    formData.append("subCategory", selectedSubcategory || "");
    formData.append("tags", selectedTags.join(","));

    formData.append(
      "sizes",
      JSON.stringify(
        Object.keys(quantities).map((size) => ({
          name: size,
          quantity: quantities[size],
        }))
      )
    );
    // Convert blob URLs to Files and attach them
    const filePromises = images.map(async (imageUrl) => {
      if (imageUrl) {
        const file = await urlToFile(imageUrl);
        formData.append("images", file);
      }
    });

    await Promise.all(filePromises); // Wait for all files to be added

    try {
      const productId = await addProduct(formData);
      router.push(`/dashboard/product-details/${productId}`);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

    return (
        <div className="container mx-auto p-4 mt-4">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3">
                    <AddProductDetails />
                </div>
                <div className="w-full md:w-1/4 mt-12">
                    <PublishProduct />
                </div>
            </div>
        </div>
        // <form className="space-y-6" onSubmit={handleSubmit}>
        //     <div>
        //         <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
        //             Enter Product Name:* 
        //         </label>
        //         <div className="mt-2">
        //             <Input
        //                 id="productName"
        //                 name="productName"
        //                 type="text"
        //                 required
        //                 onChange={(e) => setProductName(e.target.value)}
        //             />
        //         </div>
        //     </div>

        //     <div> 
        //         <div>
        //             <label htmlFor="category" className="block text-sm font-bold text-gray-900">
        //                 Category:*
        //             </label>
        //             <div className="mt-2">
        //                 <Select
        //                     id="category"
        //                     name="category"
        //                     onChange={handleCategoryChange}
        //                     value={selectedCategory}
        //                 >
        //                     <option value="" disabled>Select a category</option>
        //                     {categoriesList.map((category) => (
        //                         <option key={category.name} value={category.name}>
        //                             {category.name}
        //                         </option>
        //                     ))}
        //                 </Select>
        //             </div>
        //         </div>

        //         {subcategories.length > 0 && (
        //             <div className="mt-4">
        //                 <p className="text-sm font-bold text-gray-900 mb-2">Subcategories:</p>
        //                 <div className="flex flex-wrap gap-2">
        //                     {subcategories.map((sub, index) => (
        //                         <span
        //                             key={index}
        //                             onClick={() => handleSubcategorySelect(sub)}
        //                             className={`px-3 py-1 rounded-full text-sm cursor-pointer 
        //                                 ${selectedSubcategory === sub 
        //                                     ? "bg-indigo-500 text-white" 
        //                                     : "bg-indigo-200 text-indigo-800"} 
        //                                 hover:bg-indigo-300`}
        //                         >
        //                             {sub}
        //                         </span>
        //                     ))}
        //                 </div>
        //             </div>
        //         )}

        //         {customTags.length > 0 && (
        //             <div className="mt-4">
        //                 <p className="text-sm font-bold text-gray-900 mb-2">Tags:</p>
        //                 <div className="flex flex-wrap gap-2">
        //                     {customTags.map((tag, index) => (
        //                         <span
        //                             key={index}
        //                             className={`px-3 py-1 rounded-full text-sm cursor-pointer 
        //                                 ${selectedTags.includes(tag) 
        //                                     ? "bg-indigo-500 text-white" 
        //                                     : "bg-indigo-200 text-indigo-800"} 
        //                                 hover:bg-indigo-300`}
        //                             onClick={() => handleTagClick(tag)}
        //                         >
        //                             {tag}
        //                         </span>
        //                     ))}
        //                 </div>
        //             </div>
        //         )}
        //     </div>
        //     {/*upload image section */}
        //     {isMounted && (
        //         <div className="mt-4">
        //             <label htmlFor="fileInput" className="block text-sm font-bold text-gray-900 mb-5">
        //                 Upload Product Image:*
        //             </label>
                    
        //             <div className="relative w-full h-[600px]">
        //                 {/* Left button */}
        //                 {currentSlide > 0 && (
        //                     <button
        //                         className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 p-2 rounded-full"
        //                         onClick={prevSlide}
        //                     >
        //                         ◀
        //                     </button>
        //                 )}

        //                 {/* Image Carousel */}
        //                 <div ref={carouselRef} className="w-full h-full flex space-x-4 overflow-x-hidden">
        //                     {images.slice(currentSlide * 2, currentSlide * 2 + 2).map((image, index) => (
        //                         <div key={index} className="relative w-full h-[600px]">
        //                             <input
        //                                 type="file"
        //                                 accept="image/*"
        //                                 onChange={(e) => handleFileChange(e, currentSlide * 2 + index)}
        //                                 className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        //                             />
        //                             <img
        //                                 src={image || "https://placehold.co/500x600?text=Drop+the+products+main+image+here%0Aor%0Aclick+here+to+browse"}
        //                                 alt={`Slide ${currentSlide * 2 + index + 1}`}
        //                                 className="w-full h-full object-cover"
        //                             />
        //                         </div>
        //                     ))}
        //                 </div>

        //                 {/* Right button */}
        //                 {currentSlide < images.length / 2 - 1 && (
        //                     <button
        //                         className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 p-2 rounded-full"
        //                         onClick={nextSlide}
        //                     >
        //                         ▶
        //                     </button>
        //                 )}
        //             </div>
        //         </div>
        //     )}
        //     {/*input sizes available */}
        //     {sizes.length > 0 && (
        //         <div className="my-7">
        //             <p className="text-sm font-bold text-gray-900 mb-4">Enter Quantities for Sizes Available:</p>
        //             <div className="grid grid-cols-3 gap-4">
        //                 {sizes.map((size, index) => (
        //                     <div key={index} className="flex items-center space-x-2">
        //                         <label htmlFor={`${size}`} className="block text-sm font-medium text-gray-700">
        //                             {size}:
        //                         </label>
        //                         <Input
        //                             id={`${size}`}   
        //                             name={`${size}`}
        //                             type="number"
        //                             min={0}
        //                             value={quantities[size]}
        //                             onChange={(e) => handleQuantityChange(size, Number(e.target.value))}
        //                             className="w-20"
        //                         />
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>
        //     )}

        //     {/* Enter the products description */}
        //     <div>
        //         <label htmlFor="productDescription" className="block text-sm font-bold text-gray-900">
        //             Enter Product Description:*
        //         </label>
        //         <div className="mt-2">
        //             <Textarea
        //                 id="productDescription"
        //                 name="productDescription"
        //                 rows={4}
        //                 required
        //                 placeholder="Enter the product description here"
        //             />
        //         </div>
        //     </div>

        //     {/* Enter the products price */}
        //     <div>
        //         <label htmlFor="price" className="block text-sm font-bold text-gray-900">
        //             Price:*
        //         </label>
        //         <div className="mt-2">
        //             <Input
        //                 id="price"
        //                 name="price"
        //                 type="number"
        //                 min="0"
        //                 step="0.01"
        //                 required
        //                 placeholder="Enter the product price"
        //             />
        //         </div>
        //     </div>

        //     {/* Enter Stock keeping unit code */}
        //     <div>
        //         <label htmlFor="sku" className="block text-sm font-bold text-gray-900">
        //             SKU (Stock Keeping Unit):
        //         </label>
        //         <div className="mt-2">
        //             <Input
        //                 id="sku"
        //                 name="sku"
        //                 type="text"
        //                 required
        //                 value={sku}
        //                 onChange={handleSkuChange}
        //                 placeholder="Enter the SKU"
        //             />
        //         </div>

        //         {sku && (
        //             <div className="mt-4">
        //                 <QRCodeCanvas value={sku} size={128} id="qr-code"/>
        //             </div>
                    
        //         )}
        //     </div>


        //     {/* enter weight(kg) */}
        //     <div>
        //         <label htmlFor="weight" className="block text-sm font-bold text-gray-900">
        //             Weight in kg (Optional):
        //         </label>
        //         <div className="mt-2">
        //             <Input
        //                 id="weight"
        //                 name="weight"
        //                 type="number"
        //                 min="0"
        //                 step="0.01"
        //                 placeholder="Enter the product weight in kilograms"
        //             />
        //         </div>
        //     </div>

        //     {/* Submit form */}
        //     <div>
        //         <button
        //             type="submit"
        //             className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        //         >
        //             Submit Product 
        //         </button>
        //     </div>
        // </form>
    );
};

export default AddProductForm;
//To Do
//Allow users to upload products for later date releases
