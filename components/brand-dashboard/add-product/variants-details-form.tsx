import { FC, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, X, Info, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import MeasurementSizesTable from "@/components/upload-product/measurement-sizes-table";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import ProductImageUploadGrid from "@/components/upload-product/product-image-upload-grid";
import { findNearestColor } from "@/lib/findNearestColor";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PATTERNS } from "@/lib/colorPatterns";
import { MarketingAndExclusivityTags, SustainabilityTags, CraftmanshipTags } from '@/lib/variantTags';
import { clothingMaterials } from "@/lib/item-material-list";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { submitFormData } from "@/lib/api-helpers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import imageCompression from 'browser-image-compression';
import { VariantDetailsValidationSchema } from "@/lib/validation-logics/add-product-validation/product-schema";
import { cn } from "@/lib/utils";

type VariantFormErrors = Partial<Record<keyof VariantFormDetails | 'measurements' | 'materialComposition', string | undefined>>;


interface VariantDetailsFormProps {
    currencyCode: string;
    todayExchangeRate?: number;
}
export interface Color {
    name: string;
    hexCode: string;
}

export interface MaterialComposition {
    name: string;
    percentage: number;
}

export interface MeasurementValue {
    [measurement: string]: number | undefined;
    quantity: number | undefined;
}

export interface VariantFormDetails {
    id: string;
    variantName: string;
    price: number;
    sku: string;
    productCode: string;
    images: string[];
    imagesDescription: string;
    colors: Color[];
    colorDescription: string;
    pattern: string;
    materialComposition: MaterialComposition[];
    measurementUnit: "Inch" | "Centimeter";
    measurements: Record<string, MeasurementValue>;
    availableDate: string;
    slug: string;
    status: "active" | "inactive";
    marketingAndExclusivityTags: string[];
    sustainabilityTags: string[];
    craftmanshipTags: string[];
}

export const DEFAULT_VARIANT: VariantFormDetails = {
    id: `variant_${Date.now()}_${Math.random()}`,
    variantName: "",
    price: 0.00,
    sku: "",
    productCode: "",
    images: ["", "", "", ""],
    imagesDescription: "",
    colors: [],
    colorDescription: "",
    pattern: "",
    materialComposition: [],
    measurementUnit: "Inch",
    measurements: {},
    availableDate: "",
    slug: "",
    status: "active",
    marketingAndExclusivityTags: [],
    sustainabilityTags: [],
    craftmanshipTags: [],
};

const generateSKU = (productName: string, color: string): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const namePart = productName.slice(0, 3).replace(/\s+/g, "").toUpperCase();
    const colorPart = color.slice(0, 3).toUpperCase();
    return `${namePart}-${colorPart}-${randomNum}`;
};
  
const generateProductCode = (productName: string): string => {
    const namePart = productName.slice(0, 5).replace(/\s+/g, "").toUpperCase();
    return `${namePart}-${Date.now().toString().slice(-5)}`;
};

const generateSlug = (productName: string, colorName: string, pattern?: string) => {
    const namePart = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const colorPart = colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const patternPart = pattern ? pattern.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    const randomPart = Math.random().toString(36).substring(2, 7);
    return [namePart, colorPart, patternPart, randomPart].filter(Boolean).join('-').replace(/-{2,}/g, '-');
};

async function imageUrlToFile(url: string, filename: string): Promise<File | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const originalFile = new File([blob], filename, { type: blob.type });

        // Define compression options. We aim for files under 1MB and reasonable dimensions.
        const options = {
            maxSizeMB: 2, // Target maximum size of 2MB
            maxWidthOrHeight: 1280, // Resize images to a max width/height of 1280px
            useWebWorker: true,
        };

        // Compress the file
        const compressedFile = await imageCompression(originalFile, options);
        console.log(`Original size: ${(originalFile.size / 1024).toFixed(2)} KB, Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`);
        return compressedFile;
    } catch (error) {
        console.error("Error converting and compressing image URL to File:", error);
        return null;
    }
}

const ProductVariantsForm: FC<VariantDetailsFormProps> = ({ currencyCode, todayExchangeRate }) => {
    const { generalDetails, productId } = useProductFormStore();
    const { category } = generalDetails;
    const { variants, addVariant, updateVariant, removeVariant, copyFromPreviousVariant } = useVariantManagement();

    const handleSaveVariant = async (index: number, variantData: VariantFormDetails) => {
        // Update the parent state first to reflect any auto-generated values
        const variantToSave = { ...variantData };
        updateVariant(index, variantToSave);
        // Separate images from the rest of the details for FormData
        const { images, ...detailsForJson } = variantToSave;
        // The JSON payload should not contain image data, as it's sent separately.
        (detailsForJson as Partial<VariantFormDetails>).images = [];

        const formData = new FormData();
        formData.append('variantDetails', JSON.stringify(detailsForJson));
        formData.append('productId', productId);
        formData.append('categoryName', category);

        // Convert all valid image URLs (blob or data) to File objects and append them.
        const imageUploadPromises = images
            .filter(img => img && (img.startsWith("blob:") || img.startsWith("data:image")))
            .map(async (imageUrl, i) => {
                const imageFile = await imageUrlToFile(imageUrl, `variant-${index}-image-${i}.png`);
                if (imageFile) {
                    formData.append('images', imageFile);
                }
            });
        await Promise.all(imageUploadPromises);

        const result = await submitFormData('/api/products/upload-variant-details', formData, {
            loadingMessage: "Saving variant...",
            successMessage: "Variant saved successfully!",
        });

        if (result) {
            console.log("The result is ", result);
        }
    };

    return (
        <form>
            {variants.map((variant, index) => (
                <VariantForm
                    key={variant.id}
                    variant={variant}
                    index={index}
                    category={category}
                    currency={currencyCode}
                    exchangeRate={todayExchangeRate}
                    onUpdate={(updates) => updateVariant(index, updates)}
                    onRemove={() => removeVariant(index)}
                    onSave={(variantToSave) => handleSaveVariant(index, variantToSave)}
                    onCopyFromPrevious={() => copyFromPreviousVariant(index)}
                />
            ))}
            
            <div className="my-4">
                <Button 
                    type="button" 
                    onClick={addVariant} 
                    variant="outline" 
                    className="flex items-center gap-2 border-2"
                >
                    <Plus size={16} className="h-4 w-4" />
                    Add Another Variant
                </Button>
            </div>
        </form>
    );
};

const useVariantManagement = () => {
    const { generalDetails } = useProductFormStore();
    const [variants, setVariants] = useState<VariantFormDetails[]>([{...DEFAULT_VARIANT, id: `variant_${Date.now()}_${Math.random()}`}]);

    const updateVariant = useCallback((index: number, updates: Partial<VariantFormDetails>) => {
        setVariants(prev => prev.map((v, i) => {
            if (i !== index) {
                return v;
            }

            const newVariant = { ...v, ...updates };

            // Auto-generate SKU and slug when colors are updated and SKU is empty
            if (updates.colors && updates.colors.length > 0 && !v.sku) {
                const mainColor = updates.colors[0];
                if (generalDetails.productName && mainColor.name) {
                    newVariant.sku = generateSKU(generalDetails.productName, mainColor.name);
                    newVariant.slug = generateSlug(generalDetails.productName, mainColor.name, newVariant.pattern);
                }
            }
            
            // Also handle pattern update for slug
            if (updates.pattern && newVariant.colors.length > 0) {
                 const mainColor = newVariant.colors[0];
                 if (generalDetails.productName && mainColor.name) {
                    newVariant.slug = generateSlug(generalDetails.productName, mainColor.name, updates.pattern);
                 }
            }

            return newVariant;
        }));
    }, [generalDetails.productName]);

    const addVariant = useCallback(() => {
        setVariants(prev => [...prev, { ...DEFAULT_VARIANT, id: `variant_${Date.now()}_${Math.random()}` }]);
    }, []);
    const removeVariant = useCallback((index: number) => {
        if (variants.length <= 1) {
            toast.error("At least one variant is required.");
            return;
        }
        setVariants(prev => prev.filter((_, i) => i !== index));
    }, [variants]);

    const copyFromPreviousVariant = useCallback((index: number) => {
        if (index === 0) return;

        setVariants(prev => {
            const previousVariant = prev[index - 1];
            const currentVariant = prev[index]; 
            const newVariants = [...prev];

            const copiedVariant: VariantFormDetails = {
                // --- Fields to copy from the previous variant ---
                price: previousVariant.price,
                materialComposition: previousVariant.materialComposition,
                measurementUnit: previousVariant.measurementUnit,
                measurements: previousVariant.measurements,
                availableDate: previousVariant.availableDate,
                pattern: previousVariant.pattern,
                status: previousVariant.status,

                // --- Fields that are preserved from the current variant shell or reset ---
                productCode: currentVariant.productCode,
                id: `variant_${Date.now()}_${Math.random()}`,
                variantName: "",
                sku: "",
                slug: "",
                colors: [],
                colorDescription: "",
                images: DEFAULT_VARIANT.images,
                imagesDescription: DEFAULT_VARIANT.imagesDescription,
                marketingAndExclusivityTags: [],
                sustainabilityTags: [],
                craftmanshipTags: [],
            };

            newVariants[index] = copiedVariant;
            toast.success("Copied details from previous variant.");
            return newVariants;
        });
    }, []);

    return { variants, updateVariant, addVariant, removeVariant, copyFromPreviousVariant };
};

interface VariantFormProps {
    variant: VariantFormDetails;
    index: number;
    category: string;
    currency: string;
    exchangeRate?: number;
    onUpdate: (updates: Partial<VariantFormDetails>) => void;
    onRemove: () => void; 
    onSave: (variantToSave: VariantFormDetails) => Promise<void>;
    onCopyFromPrevious: () => void;
}

const VariantForm: FC<VariantFormProps> = ({ variant, index, category, currency, exchangeRate, onUpdate, onRemove, onSave, onCopyFromPrevious }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<VariantFormErrors>({});
    const { generalDetails } = useProductFormStore();

    const runValidation = useCallback((dataToValidate: VariantFormDetails) => {
        const result = VariantDetailsValidationSchema.safeParse({ ...dataToValidate, categoryName: category });
        setIsValid(result.success);
        if (!result.success) {
            const flatErrors = result.error.flatten().fieldErrors;
            const newErrors: VariantFormErrors = {};
            for (const key in flatErrors) {
                newErrors[key as keyof VariantFormDetails] = flatErrors[key as keyof VariantFormDetails]?.[0];
            }
            setErrors(newErrors);
        } else {
            setErrors({});
        }
        return result.success;
    }, [category]);

    useEffect(() => {
        if (isValid !== null) { // Only re-validate if it has been validated at least once
            runValidation(variant);
        }
    }, [variant, isValid, runValidation]);

    const handleSaveButtonClick = async () => {
        let variantToSave = { ...variant };

        if (!variantToSave.sku && generalDetails.productName && variantToSave.colors.length > 0) {
            variantToSave.sku = generateSKU(generalDetails.productName, variantToSave.colors[0].name);
        }
        if (!variantToSave.productCode && generalDetails.productName) {
            variantToSave.productCode = generateProductCode(generalDetails.productName);
        }

        if (!runValidation(variantToSave)) {
            toast.error("Please fix the errors before saving.");
            return;
        }
        setIsSaving(true);
        await onSave(variantToSave);
        setIsSaving(false);
    };
  return (
    <div className="border-b pb-6 mb-6 last-of-type:border-b-0">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Variant {index + 1}</h3>
                {isValid === true && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><CheckCircle2 className="h-5 w-5 text-green-500" /></TooltipTrigger>
                            <TooltipContent><p>Variant details are valid.</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {isValid === false && (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><XCircle className="h-5 w-5 text-red-500" /></TooltipTrigger>
                            <TooltipContent><p>This variant has errors.</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {index > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCopyFromPrevious}
                    className="text-sm border-2"
                >
                    Copy from previous
                </Button>
            )}
        </div>
        
        <VariantBasicInfo
            variant={variant}
            currency={currency}
            errors={errors}
            exchangeRate={exchangeRate}
            onUpdate={onUpdate}
        />
        
        <ImageSection
            images={variant.images}
            imagesDescription={variant.imagesDescription}
            error={errors.images}
            onUpdate={onUpdate}
        />
      
        <ColorSection
            colors={variant.colors}
            colorDescription={variant.colorDescription}
            onUpdate={onUpdate}
        />
        
        <PatternSection
            pattern={variant.pattern}
            onUpdate={onUpdate}
        />
        
        <MaterialSection
            materialComposition={variant.materialComposition}
            onUpdate={onUpdate}
            error={errors.materialComposition}
        />
      
        <MeasurementSection
            category={category}
            measurements={variant.measurements}
            measurementUnit={variant.measurementUnit}
            onUpdate={onUpdate}
            error={errors.measurements}
        />

        <div className="flex flex-col md:flex-row justify-between border-2">
            <AvailableDateSection
                availableDate={variant.availableDate}
                onUpdate={onUpdate}
            />

            <StatusSection
                variantId={variant.id}
                status={variant.status}
                onUpdate={onUpdate}
            />
        </div>

        <TagSelectionSection
            label="Marketing Specific Tags"
            tags={variant.marketingAndExclusivityTags}
            availableTags={MarketingAndExclusivityTags}
            onUpdate={onUpdate}
            updateKey="marketingAndExclusivityTags"
            maxSelectionMessage="You can only select up to 1 marketing tag."
        />

        <TagSelectionSection
            label="Sustainability Tags"
            tags={variant.sustainabilityTags}
            availableTags={SustainabilityTags}
            onUpdate={onUpdate}
            updateKey="sustainabilityTags"
            maxSelection={3}
            maxSelectionMessage="You can select up to 3 sustainability tags."
        />

        <TagSelectionSection
            label="Craftsmanship Tags"
            tags={variant.craftmanshipTags}
            availableTags={CraftmanshipTags}
            onUpdate={onUpdate}
            updateKey="craftmanshipTags"
            maxSelection={3}
            maxSelectionMessage="You can select up to 3 craftsmanship tags."
        />

        <div className="my-8 flex flex-row justify-between">
            <Button 
                type="button" 
                onClick={onRemove}
                variant="outline" 
                className="flex items-center gap-2 border-2"
            >
                <X size={16} className="h-4 w-4" />
                Remove Variant
            </Button>

            <Button
                type="button"
                onClick={handleSaveButtonClick}
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : "Save Variant"}
            </Button>
        </div>

    </div>
  );
};

// Sub-components
const VariantBasicInfo: FC<{ variant: VariantFormDetails; currency: string; errors: VariantFormErrors; onUpdate: (updates: Partial<VariantFormDetails>) => void; exchangeRate?: number; }> = ({ variant, currency, errors, onUpdate, exchangeRate }) => {
    const handleInputChange = (field: keyof VariantFormDetails, value: string) => {
        onUpdate({ [field]: value });
    };

    const handlePriceChange = (value: number | undefined) => {
        onUpdate({ price: value ?? 0 });
    };

    const usdPrice = useMemo(() => {
        if (!exchangeRate || currency === 'USD' || !variant.price) {
            return null;
        }
        return (variant.price / exchangeRate).toFixed(2);
    }, [variant.price, exchangeRate, currency]);

    return (
        <>
            <div className="my-4">
                <label className="block text-sm font-bold text-gray-900">
                    Enter Variant Name:*
                </label>
                <Input
                    value={variant.variantName}
                    onChange={(e) => handleInputChange('variantName', e.target.value)}
                    maxLength={150}
                />
                {errors.variantName && <p className="text-red-500 text-xs mt-1">{errors.variantName}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4 my-4">
                <div>
                    <PriceInput value={variant.price} currencySymbol={currency} onChange={handlePriceChange} />
                    {usdPrice && (
                        <p className="text-xs text-gray-500 mt-1">Approx. ${usdPrice} USD</p>
                    )}
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                    <TextInput
                        label="SKU:*"
                        value={variant.sku}
                        onChange={(value) => handleInputChange('sku', value)}
                        maxLength={100}
                        tooltip="A unique code to identify this specific variant for inventory tracking. Example: ABC-BLU-1234. Leave blank to auto-generate on save."
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                </div>
                <div>
                    <TextInput
                        label="Product code:*"
                        value={variant.productCode}
                        onChange={(value) => handleInputChange('productCode', value)}
                        maxLength={100}
                        tooltip="An internal code for this variant, if different from the SKU. Example: ABC-98765. Leave blank to auto-generate on save."
                    />
                    {errors.productCode && <p className="text-red-500 text-xs mt-1">{errors.productCode}</p>}
                </div>
            </div>
        </>
    );
};

const PriceInput: FC<{ value: number; currencySymbol: string; onChange: (value: number | undefined) => void }> = ({ value, currencySymbol, onChange }) => (
    <div>
        <label className="block text-sm font-bold text-gray-900">Price:*</label>
        <div className="my-1 flex items-center">
            <Input
                name="currencySymbol"
                type="text"
                value={currencySymbol}
                readOnly
                required
                disabled
                className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
            />
            <MoneyInput
                name="price"
                className="block border-2 p-2 text-gray-900 bg-transparent w-10/12 [&::-webkit-inner-spin-button]:appearance-none"
                numericValue={value}
                onNumericChange={onChange}
                required
                placeholder="0.00"
            />
        </div>
    </div>
);

const TextInput: FC<{ label: string; value: string; onChange: (value: string) => void; maxLength?: number; tooltip?: React.ReactNode; }> = ({ label, value, onChange, maxLength, tooltip }) => (
    <div>
        <div className="flex items-center gap-1 mb-1">
            <label className="block text-sm font-bold text-gray-900">{label}</label>
            {tooltip && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={14} className="cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
        <div>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
            />
        </div>
    </div>
);

const ImageSection: FC<{ images: string[]; imagesDescription: string; onUpdate: (updates: Partial<VariantFormDetails>) => void; error?: string; }> = ({ images, imagesDescription, onUpdate, error }) => {
    const handleImagesChange = (newImages: string[]) => {
        onUpdate({ images: newImages });
    };

    const handleInputChange = (value: string) => {
        onUpdate({ imagesDescription: value });
    };

    return (
        <>
            <div>
                <div className="my-2 space-y-2">
                    <label className="block text-sm font-bold text-gray-900">
                        Upload Product Image:*
                    </label>
                    <p className="text-xs">
                        Add up to 4 images for this variant. The first image will be the main one. Max 2MB per image.
                    </p>
                </div>
                <ProductImageUploadGrid
                    images={images}
                    onImagesChange={handleImagesChange}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        
            <div className="my-4">
                <label className="block text-sm font-bold text-gray-900 my-2">
                    Images Description:
                </label>
                <Textarea
                    placeholder="Optional: Briefly describe what's shown (e.g., 'Model is 5'8 wearing size M'). Max 350 characters."
                    maxLength={350}
                    value={imagesDescription}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
            </div>
        </>
    );
};

const ColorSection: FC<{ colors: Color[]; colorDescription?: string; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ colors, colorDescription, onUpdate }) => {
    const handleColorChange = (colorIndex: number, updates: Partial<Color>) => {
        const newColors = colors.map((color, i) => 
            i === colorIndex ? { ...color, ...updates } : color
        );
        onUpdate({ colors: newColors });
    };

    const addColor = () => {
        onUpdate({ colors: [...colors, { name: "Black", hexCode: "#000000" }] });
    };

    const removeColor = (colorIndex: number) => {
        onUpdate({ colors: colors.filter((_, i) => i !== colorIndex) });
    };

    const handleDescriptionChange = (value: string) => {
        onUpdate({ colorDescription: value });
    };

    return (
        <>
            <div className="my-4">
                <label className="block tex-sm font-bold text-gray-900 my-2">
                    Variant color(s):*
                </label>
                <div className="my-1 flex flex-wrap gap-2">
                    {colors.map((color, colorIndex) => (
                        <ColorInput
                            key={colorIndex}
                            color={color}
                            onChange={(updates) => handleColorChange(colorIndex, updates)}
                            onRemove={() => removeColor(colorIndex)}
                        />
                    ))}
                    <Button type="button" onClick={addColor} className="h-8 w-8">
                        <Plus size={16} strokeWidth={2}/>
                    </Button>
                </div>
                <div className="p-2">
                    <p className="text-sm">
                        Selected colors: (<span className="font-bold">{colors.map(color => color.name).join(", ")}</span>)
                    </p>
                </div>
            </div>
            
            <div className="my-4">
                <label className="block text-sm font-bold text-gray-900 my-2">
                    Color Pattern Description:
                </label>
                <Input
                    type="text"
                    value={colorDescription || ""}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="border-2"
                    placeholder="Describe the color combination or pattern of the fabric..."
                />
            </div>
        </>
    );
};

const ColorInput: FC<{ color: Color; onChange: (updates: Partial<Color>) => void; onRemove: () => void }> = ({ color, onChange, onRemove }) => {
    const handleHexChange = (hexCode: string) => {
        onChange({ 
            hexCode,
            name: findNearestColor(hexCode)
        });
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="flex items-center p-2">
                <Input
                    type="color"
                    value={color.hexCode}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-8 h-8 p-0 border-2"
                    style={{ minWidth: '40px' }}
                />
                <Input
                    type="text"
                    value={color.hexCode}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-24 h-8 text-sm border-2"
                    maxLength={7}
                    placeholder="#FFFFFF"
                />
            </div>  
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
            >
                <X size={16} strokeWidth={2}/>
            </Button>
        </div>
    );
};

const PatternSection: FC<{ pattern?: string; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ pattern, onUpdate }) => {
    const handleSelect = (selectedOption: string) => {
        onUpdate({ pattern: selectedOption });
    };

    return (
        <div className="my-4">
            <label className="block text-sm font-bold text-gray-900">Pattern:</label>
            <div className="my-1">
                <SearchableSelect
                    options={PATTERNS}
                    getOptionLabel={(option) => option}
                    onSelect={handleSelect}
                />
            </div>
        </div>
    );
};

const MaterialSection: FC<{ materialComposition: MaterialComposition[]; onUpdate: (updates: Partial<VariantFormDetails>) => void; error?: string; }> = ({ materialComposition, onUpdate, error}) => {
    const handleMaterialChange = (materialIndex: number, updates: Partial<MaterialComposition>) => {
        const newMaterials = materialComposition.map((material, i) => 
            i === materialIndex ? { ...material, ...updates } : material
        );
        onUpdate({ materialComposition: newMaterials });
    };

    const addMaterial = () => {
        onUpdate({ materialComposition: [...materialComposition, { name: "", percentage: 0 }] });
    };

    const removeMaterial = (materialIndex: number) => {
        onUpdate({ materialComposition: materialComposition.filter((_, i) => i !== materialIndex) });
    };

    const totalPercentage = useMemo(() => 
        materialComposition.reduce((sum, mat) => sum + (mat.percentage || 0), 0),
    [materialComposition]);

    return (
        <div className="my-4">
            <div className="flex items-center gap-1 mb-2">
                <label className="block text-sm font-bold text-gray-900">
                    Material Composition:
                </label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={14} className="cursor-help text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">List the materials and their percentages. The total must add up to 100% for accurate product information and customs declarations.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            {materialComposition.map((material, materialIndex) => (
                <MaterialInput
                    key={materialIndex}
                    material={material}
                    onChange={(updates) => handleMaterialChange(materialIndex, updates)}
                    onRemove={() => removeMaterial(materialIndex)}
                />
            ))}
            <div className="my-2 text-right">
                <p className="text-sm font-medium">Total: {totalPercentage}%</p>
                {totalPercentage !== 100 && materialComposition.length > 0 && !error && (
                    <p className="text-xs text-yellow-600">Total percentage should add up to 100%.</p>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="my-2">
                <Button 
                    type="button" 
                    onClick={addMaterial}
                    variant="outline"
                    className="flex items-center gap-2 border-2 rounded-none"
                >
                <Plus size={16} />
                    Add Material
                </Button>
            </div>
        </div>
    );
};

const MaterialInput: FC<{ material: MaterialComposition; onChange: (updates: Partial<MaterialComposition>) => void; onRemove: () => void }> = ({ material, onChange, onRemove }) => {
    const handleSelect = (name: string) => {
        onChange({ name });
    };

    const handlePercentageChange = (percentage: number) => {
        onChange({ percentage });
    };

    return (
        <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
                <SearchableSelect
                    options={clothingMaterials}
                    getOptionLabel={(option) => option}
                    onSelect={handleSelect}
                />
            </div>
            <div className="w-24">
                <Input
                    type="number"
                    placeholder="%"
                    value={material.percentage === 0 ? "" : material.percentage}
                    onChange={(e) => handlePercentageChange(parseInt(e.target.value) || 0)}
                    className="border-2 text-center"
                    min="0"
                    max="100"
                />
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
            >
                <X size={16} />
            </Button>
        </div>
    );
};

const MeasurementSection: FC<{ category: string; measurements: Record<string, any>; measurementUnit: "Inch" | "Centimeter"; onUpdate: (updates: Partial<VariantFormDetails>) => void; error?: string; }> = ({ category, measurements, measurementUnit, onUpdate, error }) => {
    const handleMeasurementChange = (size: string, field: string, value: number | undefined) => {
        const newMeasurements = { ...measurements };
        
        if (field === "remove") {
            delete newMeasurements[size];
        } else {
            newMeasurements[size] = {
                ...(newMeasurements[size] || {}),
                [field]: value,
            };
        }
        onUpdate({ measurements: newMeasurements });
    };

    const handleUnitChange = (unit: "Inch" | "Centimeter") => {
        onUpdate({ measurementUnit: unit });
    };

    return (
        <div className="my-4">
            <MeasurementSizesTable
                category={category}
                measurements={measurements}
                onMeasurementChange={handleMeasurementChange}
                measurementUnit={measurementUnit}
                onUnitChange={handleUnitChange}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

const AvailableDateSection: FC<{ availableDate: string; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ availableDate, onUpdate }) => {
    const handleDateChange = (date: string) => {
        onUpdate({ availableDate: date });
    };

    return (
        <div className="my-4 p-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">
                Available Date:
            </label>
            <p className="text-xs text-gray-600 mb-3">
                Leave blank if available immediately. Select month, day, and year.
            </p>
        
            <DatePicker 
                value={availableDate}
                onChange={handleDateChange}
                id="availableDate"
                className="max-w-md"
            />
        
            {availableDate && (
                <p className="text-sm text-green-600 mt-2">
                    Selected: {new Date(availableDate).toLocaleDateString('en-UK', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
            )}
        </div>
    );
};

const StatusSection: FC<{ variantId: string; status: "active" | "inactive"; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ variantId, status, onUpdate }) => {
    const handleStatusChange = (checked: boolean) => {
        onUpdate({ status: checked ? "active" : "inactive" });
    };

    const isActive = status === 'active';

    return (
        <div className="my-4 p-4">
            <p className="block text-sm font-bold text-gray-900 mb-2">
                Variant Status:
            </p>
            <p className="text-xs text-gray-600 mb-3">
                Set this variant as active or inactive. Inactive variants won't be shown to customers.
            </p>
            <div className="flex items-center gap-3">
                <Switch
                    id={`status-${variantId}`}
                    checked={isActive}
                    onCheckedChange={handleStatusChange}
                />
                <div className="flex flex-col">
                    <Label htmlFor={`status-${variantId}`} className={cn("text-sm font-medium transition-colors", isActive ? "text-black font-bold" : "text-gray-600")}>
                        {isActive ? "Active" : "Inactive"}
                    </Label>
                    <span className="text-xs text-gray-500">
                        {isActive ? "Visible to customers" : "Hidden from customers"}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface TagSelectionSectionProps {
    tags: string[];
    availableTags: readonly string[];
    onUpdate: (updates: Partial<VariantFormDetails>) => void;
    label: string;
    updateKey: keyof VariantFormDetails;
    maxSelection?: number;
    maxSelectionMessage?: string;
}

const TagSelectionSection: FC<TagSelectionSectionProps> = ({
    tags,
    availableTags,
    onUpdate,
    label,
    updateKey,
    maxSelection = 1,
    maxSelectionMessage,
}) => {
    const handleTagClick = (tag: string) => {
        const isTagSelected = tags.includes(tag);
        const newTags = isTagSelected
            ? tags.filter((t) => t !== tag)
            : [...tags, tag];

        if (newTags.length > maxSelection) {
            toast.error(maxSelectionMessage || `You can only select up to ${maxSelection} tag(s).`);
        } else {
            onUpdate({ [updateKey]: newTags });
        }
    };

    return (
        <div className="my-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">
                {label}:
            </label>
            <div className="my-1 flex flex-wrap gap-2">
                {availableTags.map((tag, index) => (
                    <span
                        key={index}
                        className={`px-3 py-1 text-sm cursor-pointer
                                    ${tags.includes(tag)
                                        ? "bg-black text-white ring-2 ring-offset-1 ring-black"
                                        : "bg-primary text-white opacity-50"}
                                    hover:bg-primary/90 hover:text-white`
                                    }        
                        onClick={() => handleTagClick(tag)}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};


export default ProductVariantsForm;