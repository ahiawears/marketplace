import { FC, FormEvent, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from 'lucide-react';
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
import { Switch } from "@/components/ui/switch";
import { VariantFormErrors, validateVariantFormDetails } from "@/lib/productDataValidation";


interface VariantDetailsFormProps {
    currencyCode: string;
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
    colorDescription?: string;
    pattern?: string;
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
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    } catch (error) {
        console.error("Error converting image URL to File:", error);
        return null;
    }
}

const ProductVariantsForm: FC<VariantDetailsFormProps> = ({ currencyCode }) => {
    const { generalDetails, productId } = useProductFormStore();
    const { category } = generalDetails;
    const { variants, addVariant, updateVariant, removeVariant, copyFromPreviousVariant } = useVariantManagement();

    const handleSaveVariant = async (index: number, variantToSave: VariantFormDetails) => {
        const toastId = toast.loading("Saving variant...");
        
        try {
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

            const response = await fetch('/api/products/upload-variant-details', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok && result.success) {
                toast.success("Variant saved successfully!", { id: toastId });
                console.log("The result is ", result);
            } else {
                // Log the detailed errors from the server for debugging
                if (result.errors) {
                    console.error("Server validation errors:", result.errors);
                    // Create a more descriptive error message for the user
                    const errorMessages = Object.values(result.errors).join(' ');
                    toast.error(`Validation failed: ${errorMessages}`, { id: toastId, duration: 6000 });
                } else {
                    toast.error(`Failed to save variant: ${result.message}`, { id: toastId });
                }
            }
        } catch (error) {
            toast.error("Failed to save variant.", { id: toastId });
            console.error(error instanceof Error ? error.message : error);
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
                    onUpdate={(updates) => updateVariant(index, updates)}
                    onRemove={() => removeVariant(index)}
                    onSave={() => handleSaveVariant(index, variant)}
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
    // Assuming productName is available in your store, similar to category.
    // You might need to add it to useProductFormStore if it's not there.
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
        const newProductCode = generalDetails.productName ? generateProductCode(generalDetails.productName) : "";
        setVariants(prev => [...prev, { ...DEFAULT_VARIANT, productCode: newProductCode, id: `variant_${Date.now()}_${Math.random()}` }]);
    }, [generalDetails.productName]);
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
            const newVariants = [...prev];
            const currentVariant = newVariants[index];

            const copiedVariant = {
                ...previousVariant,
                id: `variant_${Date.now()}_${Math.random()}`,
                variantName: "",
                sku: "",
                slug: "",
                productCode: currentVariant.productCode,
                // Reset fields that should be unique per variant
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
    onUpdate: (updates: Partial<VariantFormDetails>) => void;
    onRemove: () => void; 
    onSave: () => void;
    onCopyFromPrevious: () => void;
}

const VariantForm: FC<VariantFormProps> = ({ variant, index, category, currency, onUpdate, onRemove, onSave, onCopyFromPrevious }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<VariantFormErrors>({});

    const handleSaveButtonClick = async () => {
        const { isValid, errors: validationErrors } = validateVariantFormDetails(variant, category);
        setErrors(validationErrors);

        if (!isValid) {
            toast.error("Please fix the errors before saving.");
            return;
        }

        setIsSaving(true);
        await onSave();
        setIsSaving(false);
    };
  return (
    <div className="border-b pb-6 mb-6 last-of-type:border-b-0">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Variant {index + 1}</h3>
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
                status={variant.status}
                onUpdate={onUpdate}
            />
        </div>

        <MarketingAndExclusivityTagsSection
            marketingAndExclusivityTags={variant.marketingAndExclusivityTags}
            onUpdate={onUpdate}
        />

        <SustainabilityTagsSection
            sustainabilityTags={variant.sustainabilityTags}
            onUpdate={onUpdate}
        />

        <CraftmanshipTagsSection
            craftmanshipTags={variant.craftmanshipTags}
            onUpdate={onUpdate}
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
const VariantBasicInfo: FC<{ variant: VariantFormDetails; currency: string; errors: VariantFormErrors; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ variant, currency, errors, onUpdate }) => {
    const handleInputChange = (field: keyof VariantFormDetails, value: string) => {
        onUpdate({ [field]: value });
    };

    const handlePriceChange = (value: number | undefined) => {
        onUpdate({ price: value ?? 0 });
    };

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
                    className="border-2"
                />
                {errors.variantName && <p className="text-red-500 text-xs mt-1">{errors.variantName}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4 my-4">
                <div>
                    <PriceInput value={variant.price} currencySymbol={currency} onChange={handlePriceChange} />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                    <TextInput
                        label="SKU:*"
                        value={variant.sku}
                        onChange={(value) => handleInputChange('sku', value)}
                        maxLength={100}
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                </div>
                <div>
                    <TextInput
                        label="Product code:*"
                        value={variant.productCode}
                        onChange={(value) => handleInputChange('productCode', value)}
                        maxLength={100}
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

const TextInput: FC<{ label: string; value: string; onChange: (value: string) => void; maxLength?: number }> = ({ label, value, onChange, maxLength }) => (
    <div>
        <label className="block text-sm font-bold text-gray-900">{label}</label>
        <div className="my-1">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                className="border-2"
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
                    className="border-2"
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

const MaterialSection: FC<{ materialComposition: MaterialComposition[]; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ materialComposition, onUpdate }) => {
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
            <label className="block text-sm font-bold text-gray-900 mb-2">
                Material Composition:
            </label>
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
                {totalPercentage !== 100 && materialComposition.length > 0 && (
                    <p className="text-xs text-red-500">Total percentage must add up to 100%.</p>
                )}
            </div>
            <div className="my-2">
                <Button 
                    type="button" 
                    onClick={addMaterial}
                    variant="outline"
                    className="flex items-center gap-2 border-2"
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

const StatusSection: FC<{ status: "active" | "inactive"; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ status, onUpdate }) => {
    const handleStatusChange = (newStatus: "active" | "inactive") => {
        onUpdate({ status: newStatus});
    };

    return (
        <div className="my-4 p-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">
                Variant Status:
            </label>
            <p className="text-xs text-gray-600 mb-3">
                Set this variant as active or inactive. Inactive variants won't be shown to customers.
            </p>
            <Switch 
                status={status} 
                onStatusChange={handleStatusChange}
            />
        </div>
    );
};

const MarketingAndExclusivityTagsSection: FC<{ marketingAndExclusivityTags: string[]; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ marketingAndExclusivityTags, onUpdate}) => {
    const handleTagClick = (tag: string) => {
        const isTagSelected = marketingAndExclusivityTags.includes(tag);

        const newVariantSpecificTags = isTagSelected
            ? marketingAndExclusivityTags.filter((t) => t !== tag)
            : [...marketingAndExclusivityTags, tag];

        if (newVariantSpecificTags.length > 1) {
            toast.error("You can only select up to 1 marketing tag.");
        } else {
            onUpdate({ marketingAndExclusivityTags: newVariantSpecificTags });
        }
    }
    return (
        <div className="my-4">
            <label htmlFor="marketingTags" className="block text-sm font-bold text-gray-900 mb-2">
                Marketing Specific Tags:
            </label>
            <div className="my-1 flex flex-wrap gap-2">
                {MarketingAndExclusivityTags.map((tag, index) => (
                    <span
                        key={index}
                        className={`px-3 py-1 text-sm cursor-pointer
                                    ${marketingAndExclusivityTags.includes(tag)
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
    )
}

const SustainabilityTagsSection: FC<{ sustainabilityTags: string[]; onUpdate: (updates: Partial<VariantFormDetails>) => void }> =({ sustainabilityTags, onUpdate }) => {
    const handleTagClick = (tag: string) => {
        const isTagSelected = sustainabilityTags.includes(tag);
        const newVariantSpecificTags = isTagSelected
            ? sustainabilityTags.filter((t) => t !== tag)
            : [...sustainabilityTags, tag];

        if (newVariantSpecificTags.length > 1) {
            toast.error("You can only select up to 1 sustainability tag.");
        } else {
            onUpdate({ sustainabilityTags: newVariantSpecificTags });
        }
    }

    return (
        <div className="my-4">
            <label htmlFor="variantSpecificTags" className="block text-sm font-bold text-gray-900 mb-2">
                Sustainability Specific Tags:
            </label>
            <div className="my-1 flex flex-wrap gap-2">
                {SustainabilityTags.map((tag, index) => (
                    <span
                        key={index}
                        className={`px-3 py-1 text-sm cursor-pointer
                                    ${sustainabilityTags.includes(tag)
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
    )

}

const CraftmanshipTagsSection: FC<{ craftmanshipTags: string[]; onUpdate: (updates: Partial<VariantFormDetails>) => void }> =({ craftmanshipTags, onUpdate }) => {
    const handleTagClick = (tag: string) => {
        const isTagSelected = craftmanshipTags.includes(tag);
        const newVariantSpecificTags = isTagSelected
            ? craftmanshipTags.filter((t) => t !== tag)
            : [...craftmanshipTags, tag];

        if (newVariantSpecificTags.length > 1) {
            toast.error("You can only select up to 1 craftmasnship tag.");
        } else {
            onUpdate({ craftmanshipTags: newVariantSpecificTags });
        }
    }
    return (
        <div className="my-4">
            <label htmlFor="variantSpecificTags" className="block text-sm font-bold text-gray-900 mb-2">
                Craftmanship Specific Tags:
            </label>
            <div className="my-1 flex flex-wrap gap-2">
                {CraftmanshipTags.map((tag, index) => (
                    <span
                        key={index}
                        className={`px-3 py-1 text-sm cursor-pointer
                                    ${craftmanshipTags.includes(tag)
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
    )
}


export default ProductVariantsForm;