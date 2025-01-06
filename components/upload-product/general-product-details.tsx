import { GeneralProductDetailsType } from "@/lib/types";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { categoriesList } from "@/lib/categoriesList";
import { useState } from "react";
import { currency } from "@/lib/currencyList";

interface GeneralProductDetailsProps {
    setGeneralDetails: React.Dispatch<React.SetStateAction<GeneralProductDetailsType>>;
}
const GeneralProductDetails: React.FC<GeneralProductDetailsProps> = ({ setGeneralDetails }) => {

    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("");

    
    const addGeneralProductDetails = () => {

        const generalDetails: GeneralProductDetailsType = {
            productName: "",
            productDescription: "",
            category: "",
            subCategory: "",
            tags: [],
            currency: "",
        }
        setGeneralDetails(generalDetails);
    };

    const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGeneralDetails(prevDetails => ({
            ...prevDetails,
            productName: e.target.value,
        }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setGeneralDetails(prevDetails => ({
            ...prevDetails,
            productDescription: e.target.value,
        }));
    };    
    
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

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryName = event.target.value;
        setGeneralDetails(prevDetails => ({
            ...prevDetails,
            category: categoryName,
        }));
        
        // Update subcategories based on the selected category
        const category = categoriesList.find((cat) => cat.name === categoryName);
        setSubcategories(category?.subcategories || []);
        setCustomTags(category ? category.tags : []);

        //set the values

        setSelectedCategory(categoryName);
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

            setSelectedCurrency(event.target.value);
        }

        //setSelectedCurrency(sCurrency.symbol);
        console.log("The currency set is", event.target.value);
    }

    return (
        <div className="product-details">
            <div className="mb-4">
                <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                    Enter Product Name:* 
                </label>
                <div className="mt-2">
                    <Input
                        id="productName"
                        name="productName"
                        type="text"
                        onChange={handleProductNameChange}
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
                        onChange={handleDescriptionChange}
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

            

            <div className="mt-5">
                <label htmlFor="price" className="block text-sm font-bold text-gray-900 mb-2">
                    Product Currency:*
                </label>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2">
                        <Select
                            id="currency"
                            name="currency"
                            onChange={handleCurrencyChange}
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
        </div>
    );
}

export default GeneralProductDetails;