// src/components/upload-product/ProductVariantsForm.tsx
import { FC, FormEvent, useCallback, useState } from "react";
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
import { clothingMaterials } from "@/lib/item-material-list";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";

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

}

export const DEFAULT_VARIANT: VariantFormDetails = {
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
    status: "active"
};

const ProductVariantsForm: FC<VariantDetailsFormProps> = ({ currencyCode }) => {
    const { category } = useProductFormStore();
    const { variants, addVariant, updateVariant, removeVariant } = useVariantManagement();

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.loading("Saving data....");
        console.log(variants);
    };

    return (
        <form onSubmit={handleSave}>
            {variants.map((variant, index) => (
                <VariantForm
                    key={index}
                    variant={variant}
                    index={index}
                    category={category}
                    currency={currencyCode}
                    onUpdate={(updates) => updateVariant(index, updates)}
                    onRemove={() => removeVariant(index)}

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
            
            <div className="my-4">
                <Button
                    type="submit"
                    className="flex justify-center px-3 py-1.5 text-sm/6"
                >
                    Save All Variants
                </Button>
            </div>
        </form>
    );
};

const useVariantManagement = () => {
    const [variants, setVariants] = useState<VariantFormDetails[]>([DEFAULT_VARIANT]);

    const updateVariant = useCallback((index: number, updates: Partial<VariantFormDetails>) => {
        setVariants(prev => prev.map((v, i) => 
            i === index ? { ...v, ...updates } : v
        ));
    }, []);

    const addVariant = useCallback(() => {
        setVariants(prev => [...prev, { ...DEFAULT_VARIANT }]);
    }, []);
    const removeVariant = useCallback((index: number) => {
        if (variants.length <= 1) {
            toast.error("At least one variant is required.");
            return;
        }
        setVariants(prev => prev.filter((_, i) => i !== index));
    }, [variants]);

    return { variants, updateVariant, addVariant, removeVariant };
};

interface VariantFormProps {
    variant: VariantFormDetails;
    index: number;
    category: string;
    currency: string;
    onUpdate: (updates: Partial<VariantFormDetails>) => void;
    onRemove: () => void; 
}

const VariantForm: FC<VariantFormProps> = ({ variant, index, category, currency, onUpdate, onRemove }) => {
  return (
    <div className="border-b pb-6 mb-6 last-of-type:border-b-0">
        <h3 className="text-lg font-bold mb-4">Variant {index + 1}</h3>
        
        <VariantBasicInfo
            variant={variant}
            currency={currency}
            onUpdate={onUpdate}
        />
        
        <ImageSection
            images={variant.images}
            imagesDescription={variant.imagesDescription}
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
        <div className="my-4">
            <Button 
                type="button" 
                onClick={onRemove} // Call the onRemove prop here
                variant="outline" 
                className="flex items-center gap-2 border-2"
            >
                <X size={16} className="h-4 w-4" />
                Remove Variant
            </Button>
        </div>

    </div>
  );
};

// Sub-components
const VariantBasicInfo: FC<{ variant: VariantFormDetails; currency: string; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ variant, currency, onUpdate }) => {
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
            </div>

            <div className="grid grid-cols-3 gap-4 my-4">
                <PriceInput value={variant.price} currencySymbol={currency} onChange={handlePriceChange} />
                <TextInput
                    label="SKU:*"
                    value={variant.sku}
                    onChange={(value) => handleInputChange('sku', value)}
                    maxLength={100}
                />
                <TextInput
                    label="Product code:*"
                    value={variant.productCode}
                    onChange={(value) => handleInputChange('productCode', value)}
                    maxLength={100}
                />
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

const ImageSection: FC<{ images: string[]; imagesDescription: string; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ images, imagesDescription, onUpdate }) => {
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

const MeasurementSection: FC<{ category: string; measurements: Record<string, any>; measurementUnit: "Inch" | "Centimeter"; onUpdate: (updates: Partial<VariantFormDetails>) => void }> = ({ category, measurements, measurementUnit, onUpdate }) => {
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
        onUpdate({ status: newStatus });
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

export default ProductVariantsForm;