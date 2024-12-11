import Image from "next/image";
import React, { useState } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import SizeSelect from "./size-select";
import { categoriesList } from "@/lib/categoriesList";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select } from "./select";


interface ProductItemProps {
    productId: string;
    productName: string;
    productPrice: number;
    mainImage: string;
    thumbnails: string[];
    description: string;
    weight: number;
    categoryName: string;
}

interface Size {
    size_id: string;
    quantity: number;
    name: string;
}

interface SizeSelectProps {
    productId: string;
    onSelectSize: (size: Size | null) => void;
}

const BrandProductItem: React.FC<ProductItemProps> = ({ productId, productName, productPrice, mainImage, thumbnails, description, weight, categoryName}) => {
    const productImages = [mainImage, ...thumbnails];
    const [selectedImage, setSelectedImage] = useState(mainImage);
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(categoryName);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const catname = categoryName;

    const [productDetails, setProductDetails] = useState({
        name: productName,
        price: productPrice,
        description: description,
        weight: weight,

    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
	
		setProductDetails((prevDetails) => {
	
			return {
				...prevDetails,
				[name]: value,
			};
		});
	};

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
	
		setProductDetails((prevDetails) => {
	
			return {
				...prevDetails,
				[name]: value,
			};
		});
    }

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryName = event.target.value;
        setSelectedCategory(categoryName);

        const category = categoriesList.find((cat) => cat.name === categoryName);
        setSubcategories(category?.subcategories || []);
        setCustomTags(category ? category.tags : []); 
        
        setSelectedSubcategory("");
        setSelectedTags([]);
    };

    return (
        <div>
            <div className="container mx-auto flex flex-col lg:flex-row">
                <div className="w-full lg:basis-3/5 basis-full">
                    <div className="flex justify-center relative h-[700px] w-[600px] overflow-hidden group">
                        <Image
                            src={selectedImage}
                            alt="Main Product"
                            height={700}
                            width={600}
                            priority
                            style={{ objectFit: "contain" }}
                        />
                        {/* Overlay Icon */}
                        <button
                            className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition"
                        >
                            <MdOutlineModeEdit className="text-red-500" size={24} />
                        </button>
                    </div>
                    {/* Thumbnails */}
                    <div className="flex justify-center gap-4 mt-4">
                        {productImages.map((image, index) => (
                            <div
                                key={index}
                                className="cursor-pointer border-2 border-transparent hover:border-gray-400 rounded-md overflow-hidden relative h-[80px] w-[80px]"
                                onClick={() => setSelectedImage(image)}
                            >
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    height={80}
                                    width={80}
                                    style={{ objectFit: "contain" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:basis-2/5 p-4 basis-full">
                    <div className="bg-white rounded-lg shadow-lg py-4">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-bold text-gray-900 mt-2">
                                Name:*
                            </label>
                            <div className="mt-2">
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={productDetails.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter the product price"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="price" className="block text-sm font-bold text-gray-900 mt-2">
                                Price:*
                            </label>
                            <div className="mt-2">
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={productDetails.price}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter the product price"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="weight" className="block text-sm font-bold text-gray-900 mt-2">
                                Weight:*
                            </label>
                            <div className="mt-2">
                                <Input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={productDetails.weight}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter the product wight"
                                />
                            </div>
                        </div>
                        <div className=" mb-4">
                            <label htmlFor="description" className="block text-sm font-bold text-gray-900 mt-2">
                                Description:*
                            </label>
                            <div className="mt-2">
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={productDetails.description}
                                    onChange={handleTextAreaChange}
                                    required
                                    placeholder="Enter the product Description"
                                />
                            </div>
                        </div>
                        <div>
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
                        <div className="text-sm">
                            <button
                                //onClick={handleAddToCart}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Update Product
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default BrandProductItem;
