import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGeneralDetailsValidation } from "@/hooks/local-store/add-product/use-steps-validation";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { submitFormData } from "@/lib/api-helpers";
import { categoriesList } from "@/lib/categoriesList";
import { GeneralDetailsSchemaType } from "@/lib/validation-logics/add-product-validation/product-schema";
import { Info } from "lucide-react";
import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";


type GeneralDetailsErrors = Partial<Record<keyof GeneralDetailsSchemaType, string>>;

const gender = ["Male", "Female", "Unisex"];

const seasonTypes = [
    { name: "Spring/Summer", code: "SS" },
    { name: "Fall/Winter", code: "FW" },
    { name: "Resort", code: "RS" },
    { name: "Pre-Fall", code: "PF" },
];

const GeneralDetailsForm: FC = () => {
    const { generalDetails, setGeneralDetails, setProductId } = useProductFormStore();
    const { validateField, validateStep } = useGeneralDetailsValidation();
    
    const selectedCategoryData = categoriesList.find(
        (cat) => cat.name === generalDetails.category
    );
    const subcategories = selectedCategoryData?.subcategories || [];
    const customTags = selectedCategoryData?.tags || [];

    const [seasonYear, setSeasonYear] = useState<string>("");
    const [seasonType, setSeasonType] = useState<string>("");

    const [errors, setErrors] = useState<GeneralDetailsErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // const validateForm = () => {
    //     const result = GeneralDetailsValidationSchema.safeParse(generalDetails);
    //     if (!result.success) {
    //         // Zod's .flatten() method provides a convenient error object structure.
    //         const newErrors: GeneralDetailsErrors = {};
    //         for (const key in result.error.flatten().fieldErrors) {
    //             if (Object.prototype.hasOwnProperty.call(result.error.flatten().fieldErrors, key)) {
    //                 newErrors[key as keyof GeneralDetailsSchemaType] = result.error.flatten().fieldErrors[key as keyof GeneralDetailsSchemaType]?.[0];
    //             }
    //         }
    //         setErrors(newErrors);
    //         return false;
    //     }
    //     setErrors({});
    //     return true;
    // };

    const validateForm = () => {
        // Use the hook's validateStep for type-safe validation
        const result = validateStep(generalDetails);

        if (!result.isValid) {
            setErrors(result.errors as GeneralDetailsErrors);
            return false;
        }
        setErrors({});
        return true;
    };
    
    useEffect(() => {
        if (seasonYear.length === 4 && seasonType) {
            const seasonCode = `${seasonType}${seasonYear.slice(-2)}`;
            setGeneralDetails({ season: seasonCode });
        } else if (generalDetails.season) {
            // Clear season in store if inputs are incomplete
            setGeneralDetails({ season: "" });
        }
    }, [seasonYear, seasonType, setGeneralDetails]);


    const handleFieldValidation = async <TField extends keyof GeneralDetailsSchemaType>(
        name: TField, 
        value: GeneralDetailsSchemaType[TField]
    ) => {
        // Run field-level validation using the helper hook
        const { isValid, error } = validateField(name, value);

        if (!isValid) {
            // Set error for the specific field
            setErrors(prev => ({ ...prev, [name]: error }));
        } else {
            // Clear error for the specific field
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFormInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        // setGeneralDetails({ [e.target.name]: e.target.value });
        const { name, value } = e.target;
        
        // 1. Get the field key, guaranteed to be in the schema
        const fieldName = name as keyof GeneralDetailsSchemaType;
        
        // 2. Set the form state
        setGeneralDetails({ [fieldName]: value });
        
        // 3. Call validation.
        // Although the input event gives us a 'string' for 'value', 
        // the GeneralDetailsSchemaType often expects a string (for product name, description, category, etc.).
        // We use the string value here, which aligns with most fields in your schema.
        // For fields that require number/boolean (which you don't have in GeneralDetails), 
        // you would need specific handlers or type conversion logic here.
        handleFieldValidation(fieldName, value as GeneralDetailsSchemaType[typeof fieldName]);
    };

    // Handler for blur event
    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof GeneralDetailsSchemaType;
        
        // Run validation on blur
        handleFieldValidation(fieldName, value as GeneralDetailsSchemaType[typeof fieldName]);
    };

    const handleSubcategoryClick = (sub: string) => {
        setGeneralDetails({ subCategory: sub });
    };

    const handleTagClick = (tag: string) => {
        const isTagSelected = generalDetails.tags.includes(tag);
        const newTagCount = isTagSelected ? generalDetails.tags.length - 1 : generalDetails.tags.length + 1;

        if (newTagCount > 5) {
            toast.error("You can only select up to 5 tags");
        } else {
            const newTags = isTagSelected
                ? generalDetails.tags.filter((t) => t !== tag)
                : [...generalDetails.tags, tag];
            
            setGeneralDetails({ tags: newTags });
        }
    }

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors highlighted below.");
            return;
        }
        
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('generalDetails', JSON.stringify(generalDetails));

        const result = await submitFormData<{ success: boolean; message: string; productUploadId: string }>(
            '/api/products/upload-general-details',
            formData,
            {
                loadingMessage: "Saving general details...",
                successMessage: "General details saved successfully!",
            }
        );

        if (result) {
            // Save the returned productUploadId to the Zustand store
            setProductId(result.productUploadId);
        }

        setIsSubmitting(false);
    }; 

    return (
        <form onSubmit={handleSave}>
            <div className="my-4">
                <div className="flex items-center gap-1">
                    <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                        Enter Product Name:* 
                    </label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info size={14} className="cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">
                                    Enter a clear and concise name for your product. This will be the main title customers see. (150 characters max)
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                
                <div className="my-1">
                    <Input
                        id="productName"
                        type="text"
                        name="productName"
                        value={generalDetails.productName}
                        onChange={handleFormInput}
                        onBlur={handleBlur}
                        maxLength={150}
                    />
                    {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
                </div>
            </div>
            <div className="my-4">
                <div className="flex items-center gap-1">
                    <label htmlFor="productDescription" className="block text-sm font-bold text-gray-900">
                        Enter Product Description:* 
                    </label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info size={14} className="cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">
                                    Provide a detailed description of your product. Highlight key features, materials, and what makes it unique. Good descriptions help sales! (5000 characters max)                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="my-1">
                    <Textarea
                        id="productDescription"
                        name="productDescription"
                        value={generalDetails.productDescription}
                        onChange={handleFormInput}
                        maxLength={5000}
                        onBlur={handleBlur}
                    />
                    {errors.productDescription && <p className="text-red-500 text-xs mt-1">{errors.productDescription}</p>}
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
                        value={generalDetails.category}
                        onSelect={(selectedOption) => {
                            setGeneralDetails({
                                category: selectedOption,
                                subCategory: "",
                                tags: [],
                            });
                        }}
                    />
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
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
                                className={`px-3 py-1 text-sm cursor-pointer ${
                                    generalDetails.subCategory === sub
                                                ? "bg-black text-white ring-2 ring-offset-1 ring-black"
                                                : "bg-primary text-white opacity-50"}
                                            hover:bg-primary/90 hover:text-white`
                                        }
                            >
                                {sub}
                            </span>
                        ))}
                    </div>
                    {errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory}</p>}
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
                                className={`px-3 py-1 text-sm cursor-pointer ${
                                    generalDetails.tags.includes(tag) 
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
                    {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags}</p>}
                </>
            )}
           
            <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="seasonYear" className="block text-sm font-bold text-gray-900 mb-2">
                        Season Year
                    </label>
                    <Input
                        id="seasonYear"
                        name="seasonYear"
                        type="number"
                        placeholder={`e.g., ${new Date().getFullYear()}`}
                        value={seasonYear}
                        onChange={(e) => setSeasonYear(e.target.value)}
                        className="border-2 rounded-none"
                        min="1900"
                        max={new Date().getFullYear() + 5}
                    />
                </div>
                <div>
                    <label htmlFor="seasonType" className="block text-sm font-bold text-gray-900 mb-2">
                        Season Type
                    </label>
                    <Select
                        id="seasonType"
                        name="seasonType"
                        value={seasonType}
                        onChange={(e) => setSeasonType(e.target.value)}
                        className="block border-2 bg-transparent rounded-none"
                    >
                        <option value="" disabled>Select season type</option>
                        {seasonTypes.map((type) => (
                            <option key={type.code} value={type.code}>{type.name}</option>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="my-4">
                <label htmlFor="gender" className="block text-sm font-bold text-gray-900 mb-2">
                    Target Gender:*
                </label>
                <div className="my-1">
                    <Select
                        id="gender"
                        name="gender"
                        onChange={handleFormInput}
                        value={generalDetails.gender}
                        className="block border-2 bg-transparent rounded-none"
                    >
                        <option value="" disabled>Specify the gender this product is primarily designed for.</option>
                        {gender.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </Select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
            </div>

            <div className="my-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center px-3 py-1.5 text-sm/6 "

                >
                    {isSubmitting ? "Saving..." : "Save"}
                </Button>
            </div>
        </form>
    )
}
export default GeneralDetailsForm;