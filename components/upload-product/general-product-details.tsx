"use client";

import { GeneralProductDetailsType } from "@/lib/types";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { categoriesList } from "@/lib/categoriesList";
import { useEffect, useState } from "react";
import { currency } from "@/lib/currencyList";  
import { clothingMaterials } from "@/lib/item-material-list";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import LoadContent from "@/app/load-content/page";
import ErrorModal from "../modals/error-modal";
import { generateSeasonOptions, getCurrentSeason, getSecondarySeason } from "@/hooks/generate-fashion-season";
import { GeneralDetailsErrors, validateGeneralProductDetails } from "@/lib/productDataValidation";

interface GeneralProductDetailsProps {
    generalDetails: GeneralProductDetailsType;
    setGeneralDetails: (details: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => void;
    userId: string | null;
    accessToken: string | null;
}

const gender = ["Male", "Female", "Unisex"];

const GeneralProductDetails: React.FC<GeneralProductDetailsProps> = ({ generalDetails, setGeneralDetails, userId, accessToken }) => {

    const [errors, setErrors] = useState<GeneralDetailsErrors>({
        productName: "",
        productDescription: "",
        category: "",
        material: "",
        subCategory: "",
        tags: "",
        gender: "",
    });
    
    const [localDetails, setLocalDetails] = useState<GeneralProductDetailsType>(generalDetails);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const seasonOptions = generateSeasonOptions();

    const isFormValid = () => {
        return (
            localDetails.productName.trim() !== "" &&
            localDetails.productDescription.trim() !== "" &&
            localDetails.category.trim() !== "" &&
            localDetails.material.trim() !== "" &&
            localDetails.subCategory.trim() !== "" &&
            localDetails.tags.length <= 5 &&
            localDetails.tags.length > 0 &&
            localDetails.gender.trim() !== ""
        );
    };

    const handleSave = () => {
        const { isValid, errors: validationErrors } = validateGeneralProductDetails(localDetails);
        setErrors(validationErrors);
        if (isValid) {
            setGeneralDetails(localDetails);
        } else {
            setErrors(validationErrors);        
        }
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
        const isTagSelected = localDetails.tags.includes(tag);
        const newTagCount = isTagSelected ? localDetails.tags.length - 1 : localDetails.tags.length + 1;

        if (newTagCount > 5) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                tags: "You can only select up to 5 tags",
            }));
            setTimeout(() => {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    tags: "",
                }));
            }, 3000);
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                tags: "",
            }));
            setLocalDetails((prev) => ({
                ...prev,
                tags: isTagSelected
                    ? prev.tags.filter((t) => t !== tag)
                    : [...prev.tags, tag],
            }));
        }
    };

    const handleSubcategorySelect = (subcategoryString: string) => {
        if (subcategoryString === localDetails.subCategory) {
            setSelectedSubcategory("");
            setLocalDetails((prev) => ({
                ...prev,
                subCategory: "",
            }));
        }else {
            setSelectedSubcategory(subcategoryString);
            setLocalDetails((prev) => ({
                ...prev,
                subCategory: subcategoryString,
            }));
        }
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
        <>
            {errorMessage && (
                <>
                    <ErrorModal 
                        message={errorMessage}
                        onClose={() => {
                            setErrorMessage("");
                        }}
                    />
                </>
            )}
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
                            placeholder="Enter a clear and concise name for your product. This will be the main title customers see."
                            className="border-2"
                        />
                        {errors.productName && (
                            <p 
                                style={{ color: 'red' }} 
                                className="py-2 text-xs"
                                id="productName-error"
                            >
                                {errors.productName}
                            </p>
                        )}
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
                            placeholder="Provide a detailed description of your product. Highlight key features, materials, and what makes it unique. Good descriptions help sales!"
                            className="border-2"
                        />
                         {errors.productDescription && (
                            <p 
                                style={{ color: 'red' }} 
                                className="py-2 text-xs"
                                id="productDescription-error"
                            >
                                {errors.productDescription}
                            </p>
                        )}
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
                                <option value="" disabled>Select the main category that best fits your product.</option>
                                {categoriesList.map((category) => (
                                    <option key={category.name} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </Select>
                            {errors.category && (
                                <p 
                                    style={{ color: 'red' }} 
                                    className="py-2 text-xs"
                                    id="productCategory-error"
                                >
                                    {errors.category}
                                </p>
                            )}
                        </div>
                    </div>

                    {subcategories.length > 0 && (
                        <div className="mt-4">
                            <div className="my-3">
                                <p className="text-sm font-bold text-gray-900">Subcategory:*</p>
                                <span className="text-sm text-gray-500">Choose a subcategory to further classify your product.</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {subcategories.map((sub, index) => (
                                    <span
                                        key={index}
                                        onClick={() => handleSubcategorySelect(sub)}
                                        className={`px-3 py-1 text-sm cursor-pointer 
                                            ${selectedSubcategory === sub 
                                                ? "bg-black text-white ring-2 ring-offset-1 ring-black"
                                                : "bg-primary text-white opacity-50"} 
                                            hover:bg-primary/90 hover:text-white`}
                                    >
                                        {sub}
                                    </span>
                                ))}
                            </div>
                            {errors.subCategory && (
                                <p 
                                    style={{ color: 'red' }} 
                                    className="py-2 text-xs"
                                    id="productSubCategory-error"
                                >
                                    {errors.subCategory}
                                </p>
                            )}
                        </div>
                    )}

                    {customTags.length > 0 && (
                        <div className="mt-4">
                            <div className="my-3">
                                <p className="text-sm font-bold text-gray-900">Tags:*</p>
                                <span className="text-sm/3 text-gray-500">Add relevant keywords or tags that customers might use to search for this type of product. This helps improve discoverability.</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {customTags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className={`px-3 py-1 text-sm cursor-pointer 
                                            ${selectedTags.includes(tag) 
                                                ? "bg-black text-white ring-2 ring-offset-1 ring-black" 
                                                : "bg-primary text-white opacity-50"} 
                                            hover:bg-primary/90 hover:text-white` }
                                        onClick={() => handleTagClick(tag)}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            {errors.tags && (
                                <p 
                                    style={{ color: 'red' }} 
                                    className="py-2"
                                    id="tags-error"
                                >
                                    {errors.tags}
                                </p>
                            )}
                        </div>
                    )}
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
                                <option value="" disabled >Select the main material used in your product.</option>
                                {clothingMaterials.map((material) => (
                                    <option key={material} value={material}>
                                        {material}
                                    </option>
                                ))}
                            </Select>
                            {errors.material && (
                                <p 
                                    style={{ color: 'red' }} 
                                    className="py-2 text-xs"
                                    id="productMaterial-error"
                                >
                                    {errors.material}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5 w-full">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2">
                           <label htmlFor="season" className="block text-sm font-bold text-gray-900 mb-2">
                                Season:
                            </label> 

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full">
                                    <Select
                                        id="season"
                                        name="season"
                                        onChange={(e) => {
                                            handleChange("season", e.target.value);
                                        }}
                                        value={localDetails.season}
                                        className="block border-2 bg-transparent"
                                    >
                                        <option value="" disabled>Indicate the fashion season this product is most suitable for(e.g., Spring/Summer, Autumn/Winter).</option>
                                        {seasonOptions.map((season) => (
                                            <option key={season.name} value={season.code}>
                                                {season.name} ({season.code})
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <label htmlFor="gender" className="block text-sm font-bold text-gray-900 mb-2">
                                Target Gender:*
                            </label>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full">
                                    <Select
                                        id="gender"
                                        name="gender"
                                        onChange={(e) => {
                                            handleChange("gender", e.target.value);
                                        }}
                                        value={localDetails.gender}
                                        className="block border-2 bg-transparent"
                                    >
                                        <option value="" disabled>Specify the gender this product is primarily designed for.</option>
                                        {gender.map((g) => (
                                            <option key={g} value={g}>
                                                {g}
                                            </option>
                                        ))}
                                    </Select>
                                    {errors.gender && (
                                        <p 
                                            style={{ color: 'red' }} 
                                            className="py-2 text-xs"
                                            id="gender-error"
                                        >
                                            {errors.gender}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <Button
                        onClick={handleSave}
                        disabled={!isFormValid()}
                        className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                        Save and continue
                    </Button>
                </div>
            </div>
        </>
    );
}

export default GeneralProductDetails;