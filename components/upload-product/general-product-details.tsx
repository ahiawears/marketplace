import { GeneralProductDetailsType } from "@/lib/types";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { categoriesList } from "@/lib/categoriesList";
import { useEffect, useState } from "react";
import { currency } from "@/lib/currencyList";  
import { clothingMaterials } from "@/lib/item-material-list";
import { Button } from "../ui/button";

interface GeneralProductDetailsProps {
    generalDetails: GeneralProductDetailsType;
    setGeneralDetails: (details: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => void;
    onSaveAndContinue: () => void;
}

const GeneralProductDetails: React.FC<GeneralProductDetailsProps> = ({ generalDetails, setGeneralDetails, onSaveAndContinue }) => {
    const [localDetails, setLocalDetails] = useState<GeneralProductDetailsType>(generalDetails);

    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");

     // Check if all required fields are filled
     const isFormValid = () => {
        return (
            localDetails.productName.trim() !== "" &&
            localDetails.productDescription.trim() !== "" &&
            localDetails.category.trim() !== "" &&
            localDetails.currency.trim() !== "" &&
            localDetails.material.trim() !== "" &&
            localDetails.subCategory.trim() !== "" &&
            //check if 3 tags has been selected
            localDetails.tags.length === 3
        );
    };

    const handleSave = () => {
        // Pass the local state to the parent component
        setGeneralDetails(localDetails);
        onSaveAndContinue();
    };

    const handleChange = (field: keyof GeneralProductDetailsType, value: string | string[]) => {
        setLocalDetails((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryName = event.target.value;
        const category = categoriesList.find((cat) => cat.name === categoryName);
        setSubcategories(category?.subcategories || []);
        setCustomTags(category ? category.tags : []);

        // Reset subcategory and tags if the category changes
        if (categoryName !== localDetails.category) {
            setLocalDetails((prev) => ({
                ...prev,
                category: categoryName,
                subCategory: "",
                tags: [],
            }));
            setSelectedSubcategory("");
            setSelectedTags([]);
        }
    };
    
    const handleTagClick = (tag: string) => {
        if (localDetails.tags.includes(tag)) {
            // If the tag is already selected, remove it
            setLocalDetails((prev) => ({
                ...prev,
                tags: prev.tags.filter((t) => t !== tag),
            }));
        } else {
            // If the tag is not selected and the limit is reached, show a message
            if (localDetails.tags.length >= 3) {
                console.log("You can only select up to 3 tags");
            } else {
                // If the tag is not selected and the limit is not reached, add it
                setLocalDetails((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tag],
                }));
            }
        }
    };

    const handleSubcategorySelect = (subcategory: string) => {
        setSelectedSubcategory(subcategory);
        setLocalDetails((prev) => ({
            ...prev,
            subCategory: subcategory,
        }));
    };

    const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = parseInt(event.target.value);
        const sCurrency = currency.find((c) => c.id === selectedCurrency);
        if (sCurrency) {
            setLocalDetails((prev) => ({
                ...prev,
                currency: sCurrency.code,
            }));
        }
    }

    useEffect(() => {
        const handleSetCurrency = (s_Currency: string) => {
            const setCurrencyCode = s_Currency;
            const sCurrency = currency.find((c) => c.code === setCurrencyCode);
            if (sCurrency) {
                setSelectedCurrency(sCurrency.id.toString());
            }
        }

        handleSetCurrency(localDetails.currency);
    },[localDetails.currency]);

    useEffect(() => {
        const getDetails = () => {
            if (localDetails.category) {
                const categoryName = localDetails.category;
                const category = categoriesList.find((cat) => cat.name === categoryName);
                setSubcategories(category?.subcategories || []);
                setCustomTags(category ? category.tags : []);
                setSelectedSubcategory(localDetails.subCategory);
                setSelectedTags(localDetails.tags);
            }
        };
        getDetails();
    }, [localDetails.category, localDetails.subCategory, localDetails.tags]);

    return (
        <div className="product-details">
            <div className="mb-4">
                <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                    Enter Product Name:* 
                </label>
                <div className="mt-2">
                    <Input
                        id="productName"
                        type="text"
                        onChange={(e) => handleChange("productName", e.target.value)}
                        value={localDetails.productName}
                        required
                        placeholder="Enter the Product Name"
                        className="border-2"
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
                        onChange={(e) => handleChange("productDescription", e.target.value)}
                        value={localDetails.productDescription}
                        rows={4}
                        required
                        placeholder="Enter the product description here"
                        className="border-2"
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
                            onChange={(e) => {
                                handleCategoryChange(e);
                                handleChange("category", e.target.value);
                                
                            }}
                            value={localDetails.category}
                            className="border-2"
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
                                    className={`px-3 py-1 text-sm cursor-pointer 
                                        ${selectedSubcategory === sub 
                                            ? "bg-black text-white" 
                                            : "bg-primary text-white opacity-50"} 
                                        hover:bg-primary/90 hover:text-white`}
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
                                    className={`px-3 py-1 text-sm cursor-pointer 
                                        ${selectedTags.includes(tag) 
                                            ? "bg-black text-white" 
                                            : "bg-primary text-white opacity-50"} 
                                        hover:bg-primary/90 hover:text-white` }
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-5">
                <label htmlFor="currency" className="block text-sm font-bold text-gray-900 mb-2">
                    Product Currency:*
                </label>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2">
                        <Select
                            id="currency"
                            onChange={(e) => {
                                handleCurrencyChange(e);
                                setSelectedCurrency(e?.target.value);
                            }}
                            value={selectedCurrency}
                            className="block border-2 bg-transparent"
                        >
                            <option value="" disabled>Select Currency</option>
                            
                            {currency.map((sCurrency) => (
                                <option key={`${sCurrency.code}-${sCurrency.name}`} value={sCurrency.id}>
                                    {`${sCurrency.symbol + " " + sCurrency.name + " " + sCurrency.code}`}
                                </option>
                            ))}
                        </Select>
                        
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <label htmlFor="material" className="block text-sm font-bold text-gray-900 mb-2">
                    Product Material:*
                </label>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full">
                        <Select
                            id="material"
                            name="material"
                            onChange={(e) => {
                                handleChange("material", e.target.value);
                            }}
                            value={localDetails.material}
                            className="block border-2 bg-transparent"
                        >
                            <option value="" disabled>Select Material</option>
                            {clothingMaterials.map((material) => (
                                <option key={material} value={material}>
                                    {material}
                                </option>
                            ))}
                        </Select>
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
    );
}

export default GeneralProductDetails;