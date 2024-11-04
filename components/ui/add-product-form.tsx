"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { categoriesList } from "@/lib/categoriesList";
import { useEffect, useState } from "react";

const AddProductForm = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [imageSrc, setImageSrc] = useState<string | null>(null); 
    const [isMounted, setIsMounted] = useState(false); 

    useEffect(() => {
        setIsMounted(true); 
    }, []);

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryName = event.target.value;
        setSelectedCategory(categoryName);

        const category = categoriesList.find((cat) => cat.name === categoryName);
        setSubcategories(category?.subcategories || []);
        setCustomTags(category ? category.tags : []); 
        
        setSelectedSubcategory(null);
        setSelectedTags([]);
    };

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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            addImage(file);
        }
    };

    const addImage = async (file: File) => {
        const imageUrl = URL.createObjectURL(file);
        setImageSrc(imageUrl); 
    };

    return (
        <form className="space-y-6">
            <div>
                <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                    Enter Product Name:*
                </label>
                <div className="mt-2">
                    <Input
                        id="productName"
                        name="productName"
                        type="text"
                        required
                        autoComplete="product-name"
                    />
                </div>
            </div>

            <div> 
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

            {isMounted && (
                <div className="mt-4">
                    <label htmlFor="fileInput" className="block text-sm font-bold text-gray-900 mb-2">
                        Upload Product Image:*
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="fileInput"
                        />
                        <img
                            src={imageSrc || "https://placehold.co/500x600"}
                            alt="Product preview"
                            className="w-[500px] h-[600px] object-cover cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </form>
    );
};

export default AddProductForm;
