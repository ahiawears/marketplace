import { GeneralProductDetailsType } from "@/lib/types";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { categoriesList } from "@/lib/categoriesList";
import { useEffect, useState } from "react";
import { currency } from "@/lib/currencyList";  
import { clothingMaterials } from "@/lib/item-material-list";

interface GeneralProductDetailsProps {
    generalDetails: GeneralProductDetailsType;
    setGeneralDetails: (details: GeneralProductDetailsType | ((prev: GeneralProductDetailsType) => GeneralProductDetailsType)) => void;
}

const GeneralProductDetails: React.FC<GeneralProductDetailsProps> = ({ generalDetails,setGeneralDetails }) => {
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");

    const handleChange = (field: keyof GeneralProductDetailsType, value: string | string[]) => {
        setGeneralDetails((prev: GeneralProductDetailsType) => {
            const updatedDetails = { ...prev, [field]: value };
            return updatedDetails as GeneralProductDetailsType;
        });
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryName = event.target.value;
        const category = categoriesList.find((cat) => cat.name === categoryName);
        setSubcategories(category?.subcategories || []);
        setCustomTags(category ? category.tags : []);

        //check if the category is stored in the object, if it is, remove the subcategory and tags
        const isCategorySet = generalDetails.category;
        if (categoryName !== isCategorySet) {
            setGeneralDetails((prevDetails) => ({
                ...prevDetails,
                category: categoryName,
                subCategory: "",
                tags: [],
            }));
            setSelectedSubcategory("");
            setSelectedTags([]);
        }
    };
    
    const handleTagClick = (tag: string) => {

        if (selectedTags.length > 3) {
            console.log("You can only select up to 3 tags");
        }

        setSelectedTags(prevTags => {
            if (prevTags.includes(tag)) {
                return prevTags.filter(t => t !== tag);
            } else if (prevTags.length < 3) {
                return [...prevTags, tag];
            } 
            return prevTags;
        });

        setGeneralDetails(prevDetails => ({
            ...prevDetails,
            tags: prevDetails.tags.includes(tag) 
                ? prevDetails.tags.filter(t => t !== tag) 
                : [...prevDetails.tags, tag],
        }));

    };

    const handleSubcategorySelect = (subcategory: string) => {
        setSelectedSubcategory(subcategory);
        setGeneralDetails(prevDetails => ({
            ...prevDetails,
            subCategory: subcategory,
        }));
    };

    const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = parseInt(event.target.value);
        const sCurrency = currency.find((c) => c.id === selectedCurrency);
        if (sCurrency) {
            setGeneralDetails(prevDetails => ({
                ...prevDetails,
                currency: sCurrency.code,
            }));
        }
    }

    useEffect(() => {
        const handleSetCurrency = (s_Currency: string) => {
            const setCurrencyCode = s_Currency;
            const sCurrency = currency.find((c) => c.code === setCurrencyCode);
            if (sCurrency) {
                sCurrency.symbol
            }
            setSelectedCurrency(sCurrency ? sCurrency.id.toString() : "");
        }

        handleSetCurrency(generalDetails.currency);
    },[]);

    useEffect(() => {
        const getDetails = () => {
            if (generalDetails.category) {
                const categoryName = generalDetails.category;
                const category = categoriesList.find((cat) => cat.name === categoryName);
                setSubcategories(category?.subcategories || []);
                setCustomTags(category ? category.tags : []);
                setSelectedSubcategory(generalDetails.subCategory);
                setSelectedTags(generalDetails.tags);
            }else{
                console.log("there are no subcategories set");
            }
        }
        getDetails();
    }, []);

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
                        value={generalDetails.productName}
                        required
                        placeholder="Enter the Product Name"
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
                        value={generalDetails.productDescription}
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
                            onChange={(e) => {
                                handleCategoryChange(e);
                                handleChange("category", e.target.value);
                                
                            }}
                            value={generalDetails.category}
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
                            className="block border-l bg-transparent"
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
                            value={generalDetails.material}
                            className="block border-l bg-transparent"
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
        </div>
    );
}

export default GeneralProductDetails;