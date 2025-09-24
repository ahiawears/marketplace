import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { submitFormData } from "@/lib/api-helpers";
import { CareDetailsValidationSchema } from "@/lib/validation-logics/add-product-validation/product-schema";
import { bleachingInstruction, dryCleaningInstruction, dryingInstruction, ironingInstruction, specialCases, washingInstruction } from "@/lib/productCareInstruction";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { toast } from "sonner";

interface CareInstructionInterface {
    washingInstruction: string | null,
    dryingInstruction: string | null,
    bleachingInstruction: string | null,
    ironingInstruction: string | null,
    dryCleaningInstruction: string | null,
    specialCases: string | null,
}

interface CareInstructionSelectProps {
    id: keyof CareInstructionInterface;
    label: string;
    value: string | null;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: readonly string[];
}

const CareInstructionSelect: FC<CareInstructionSelectProps> = ({ id, label, value, onChange, options }) => (
    <div className="my-4">
        <label className="block text-sm font-bold mt-3 mb-1" htmlFor={id}>
            {label}:
        </label>
        <div className="my-1">
            <Select id={id} name={id} value={value || ""} onChange={onChange} className="block border-2 bg-transparent">
                <option value=""></option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </Select>
        </div>
    </div>
);

const CareDetailsForm: FC = () => {
    const [careDetailsData, setCareDetailsData] = useState<CareInstructionInterface>({
        washingInstruction: "",
        dryingInstruction: "",
        bleachingInstruction: "",
        ironingInstruction: "",
        dryCleaningInstruction: "",
        specialCases: "",
    })
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ formError?: string }>({});
    const {productId} = useProductFormStore();

    const validateForm = () => {
        const dataToValidate = {
            ...careDetailsData,
            productId: productId,
        };
        const result = CareDetailsValidationSchema.safeParse(dataToValidate);
        if (!result.success) {
            const formError = result.error.flatten().formErrors[0];
            setErrors({ formError });
            return false;
        }
        setErrors({});
        return true;
    };

    const handleFormInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCareDetailsData({
            ...careDetailsData,
            [e.target.name]: e.target.value,
        })
    }
    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please select at least one care instruction.");
            return;
        }

        setIsSubmitting(true);

        const finalCareDetails = {
            ...careDetailsData,
            productId: productId
        };

        const formData = new FormData();
        formData.append('careDetails', JSON.stringify(finalCareDetails));

        await submitFormData(
            '/api/products/upload-care-instructions',
            formData,
            {
                loadingMessage: "Saving care instructions...",
                successMessage: "Care instructions saved successfully!",
            }
        );

        setIsSubmitting(false);
    }
    return (
        <form onSubmit={handleSave}>
            {errors.formError && <p className="text-red-500 text-sm mb-4">{errors.formError}</p>}
            <CareInstructionSelect
                id="washingInstruction"
                label="Washing Instructions"
                value={careDetailsData.washingInstruction}
                onChange={handleFormInput}
                options={washingInstruction}
            />
            <CareInstructionSelect
                id="bleachingInstruction"
                label="Bleaching Instructions"
                value={careDetailsData.bleachingInstruction}
                onChange={handleFormInput}
                options={bleachingInstruction}
            />
            <CareInstructionSelect
                id="dryingInstruction"
                label="Drying Instructions"
                value={careDetailsData.dryingInstruction}
                onChange={handleFormInput}
                options={dryingInstruction}
            />
            <CareInstructionSelect
                id="ironingInstruction"
                label="Ironing Instructions"
                value={careDetailsData.ironingInstruction}
                onChange={handleFormInput}
                options={ironingInstruction}
            />
            <CareInstructionSelect
                id="dryCleaningInstruction"
                label="Dry Cleaning Instructions"
                value={careDetailsData.dryCleaningInstruction}
                onChange={handleFormInput}
                options={dryCleaningInstruction}
            />
            <CareInstructionSelect
                id="specialCases"
                label="Special Instruction"
                value={careDetailsData.specialCases}
                onChange={handleFormInput}
                options={specialCases}
            />
            <div>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm"
                >
                    {isSubmitting ? "Saving..." : "Save Care Instructions"}
                </Button>
            </div>
        </form>
    )
}
export default CareDetailsForm;