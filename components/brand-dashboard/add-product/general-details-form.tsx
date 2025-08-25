import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateSeasonOptions } from "@/hooks/generate-fashion-season";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { categoriesList } from "@/lib/categoriesList";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { toast } from "sonner";
import validator from 'validator';

interface MultiVariantGeneralDetailsInterface {
    productName: string;
    productDescription: string;
    category: string;
    subCategory: string; 
    tags: string[];
    gender: string;
    season: string;
}

const gender = ["Male", "Female", "Unisex"];

const GeneralDetailsForm: FC = () => {
    const { setCategory } = useProductFormStore();
    
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [generalDetailsData, setGeneralDetailsData] = useState<MultiVariantGeneralDetailsInterface>({
        productName: "",
        productDescription: "",
        category: "",
        subCategory: "",
        tags: [],
        gender: "",
        season: "",
    });
    const [customTags, setCustomTags] = useState<string[]>([]);
    const seasonOptions = generateSeasonOptions();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

   const isFormValid = () => {
        const { productName, productDescription, category, subCategory, gender, season, tags } = generalDetailsData;
        const requiredFieldsFilled =
            validator.trim(productName).length > 0 &&
            validator.trim(productDescription).length > 0 &&
            validator.trim(category).length > 0 &&
            validator.trim(subCategory).length > 0 &&
            validator.trim(gender).length > 0 &&
            validator.trim(season).length > 0 &&
            tags.length > 0;

        if (!requiredFieldsFilled) {
            return false;
        }

        const isNameLengthValid = productName.length >= 3 && productName.length <= 100;
        const isDescriptionLengthValid = productDescription.length <= 300;
                
        return isNameLengthValid && isDescriptionLengthValid;
    };
    
    const handleFormInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setGeneralDetailsData({
            ...generalDetailsData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubcategoryClick = (sub: string) => {
        setGeneralDetailsData((prevData) => ({
            ...prevData,
            subCategory: sub, 
        }));
    };

    const handleTagClick = (tag: string) => {
        const isTagSelected = generalDetailsData.tags.includes(tag);
        const newTagCount = isTagSelected ? generalDetailsData.tags.length - 1 : generalDetailsData.tags.length + 1;

        if (newTagCount > 5) {
            toast.error("You can only select up to 5 tags");
        } else {
            setGeneralDetailsData((prevData) => ({
                ...prevData,
                tags: isTagSelected
                    ? prevData.tags.filter((t) => t !== tag)
                    : [...prevData.tags, tag],
            }));
        }
    }

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        toast.loading("Saving data....")
        console.log(generalDetailsData);
    }   

    return (
        <form onSubmit={handleSave}>
            <div className="my-4">
                <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                    Enter Product Name:* </label>
                <div className="my-1">
                    <Input
                        id="productName"
                        type="text"
                        name="productName"
                        value={generalDetailsData.productName}
                        onChange={handleFormInput}
                        maxLength={100}
                        placeholder="Enter a clear and concise name for your product. This will be the main title customers see. (100 characters max)"
                        className="border-2"
                    />
                </div>
            </div>
            <div className="my-4">
                <label htmlFor="productDescription" className="block text-sm font-bold text-gray-900">
                    Enter Product Description:* </label>
                <div className="my-1">
                    <Textarea
                        id="productDescription"
                        name="productDescription"
                        value={generalDetailsData.productDescription}
                        onChange={handleFormInput}
                        maxLength={300}
                        placeholder="Provide a detailed description of your product. Highlight key features, materials, and what makes it unique. Good descriptions help sales! (300 characters max)"
                        className="border-2"
                    />
                </div>
            </div>
            <div className="my-4">
                <label htmlFor="category" className="block text-sm font-bold text-gray-900">
                    Category:*
                </label>
                <div className="my-1">
                    <SearchableSelect 
                        options={categoriesList.map((category) => category.name)}
                        getOptionLabel={(option) => option}
                        onSelect={(selectedOption) => {
                            // 1. Update the local component state
                            setGeneralDetailsData((prevData) => ({
                                ...prevData,
                                category: selectedOption,
                                // Optionally reset subcategory and tags if the category changes
                                subCategory: "",
                                tags: [],
                            }));
                            
                            // 2. Update the Zustand store
                            setCategory(selectedOption);

                            // Find the category and update subcategories/tags
                            const category = categoriesList.find((cat) => cat.name === selectedOption);
                            setSubcategories(category?.subcategories || []);
                            setCustomTags(category ? category.tags : []);
                        }}
                    />
                </div>
            </div>
            {subcategories.length > 0 && (
                <>
                    <div className="my-4">
                        <label htmlFor="subCategory" className="block text-sm font-bold text-gray-900">
                            Subcategory:*
                        </label>
                    </div>
                    <div className="my-1 flex flex-wrap gap-2">
                        {subcategories.map((sub, index) => (
                            <span
                                key={index}
                                onClick={() => handleSubcategoryClick(sub)}
                                className={`px-3 py-1 text-sm cursor-pointer
                                            ${generalDetailsData.subCategory === sub
                                                ? "bg-black text-white ring-2 ring-offset-1 ring-black"
                                                : "bg-primary text-white opacity-50"}
                                            hover:bg-primary/90 hover:text-white`
                                        }
                            >
                                {sub}
                            </span>
                        ))}
                    </div>
                </>
            )}

            {customTags.length > 0 && (
                <>
                    <div className="my-4">
                        <label htmlFor="tags" className="block text-sm font-bold text-gray-900">
                            Tags:*
                        </label>
                    </div>
                    <div className="my-1 flex flex-wrap gap-2">
                        {customTags.map((tag, index) => (
                            <span
                                key={index}
                                className={`px-3 py-1 text-sm cursor-pointer 
                                            ${generalDetailsData.tags.includes(tag) 
                                                ? "bg-black text-white ring-2 ring-offset-1 ring-black" 
                                                : "bg-primary text-white opacity-50"} 
                                            hover:bg-primary/90 hover:text-white` 
                                        }
                                onClick={() => {
                                    handleTagClick(tag)
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </>
            )}
           
            <div className="my-4">
                <label htmlFor="season" className="block text-sm font-bold text-gray-900 mb-2">
                    Season:
                </label>
                <div className="my-1">
                    <Select
                        id="season"
                        name="season"
                        onChange={handleFormInput}
                        value={generalDetailsData.season}
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
            <div className="my-4">
                <label htmlFor="gender" className="block text-sm font-bold text-gray-900 mb-2">
                    Target Gender:
                </label>
                <div className="my-1">
                    <Select
                        id="gender"
                        name="gender"
                        onChange={handleFormInput}
                        value={generalDetailsData.gender}
                        className="block border-2 bg-transparent"
                    >
                        <option value="" disabled>Specify the gender this product is primarily designed for.</option>
                        {gender.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="my-4">
                <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="flex justify-center px-3 py-1.5 text-sm/6 "

                >
                    {isSubmitting ? "Saving..." : "Save"}
                </Button>
            </div>
        </form>
    )
}
export default GeneralDetailsForm;