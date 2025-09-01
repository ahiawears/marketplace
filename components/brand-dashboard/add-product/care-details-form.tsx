import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
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
    const {productId} = useProductFormStore();
    const handleFormInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCareDetailsData({
            ...careDetailsData,
            [e.target.name]: e.target.value,
        })
    }
    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log(careDetailsData);
        const toastId = toast.loading("Saving care instructions...");
        const finalCareDetails = {
            ...careDetailsData,
            productId: productId
        };
        try {
            const formData = new FormData();
            formData.append('careDetails', JSON.stringify(finalCareDetails));

            const response = await fetch('/api/products/upload-care-instructions', {
                method: 'POST',
                body: formData
            })

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("Care instructions saved successfully!", { id: toastId });
            } else {
                toast.error(result.message || "An unknown error occurred.", { id: toastId });
            }
        } catch (error) {
            toast.error(`${error instanceof Error ? error.message : "An unknown error occurred."}`, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <form onSubmit={handleSave}>
            <div className="my-4">
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="washingInstruction">
                    Washing Instructions:
                </label>
                <div className="my-1">
                    <Select
                        id="washingInstruction"
                        name="washingInstruction"
                        value={careDetailsData.washingInstruction || ""}
                        onChange={handleFormInput}
                        className="block border-2 bg-transparent"
                    >
                        <option value="" >
                            
                        </option>

                        {washingInstruction.map((wi) => (
                            <option key={wi} value={wi}>
                                {wi}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="my-4">
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="bleachingInstruction">
                    Bleaching Instructions:
                </label>
                <div className="my-1">
                    <Select
                        id="bleachingInstruction"
                        name="bleachingInstruction"
                        value={careDetailsData.bleachingInstruction || ""}
                        onChange={handleFormInput}
                        className="block border-2 bg-transparent"
                    >
                        <option value="" >
                        </option>
    
                        {bleachingInstruction.map((bi) => (
                            <option key={bi} value={bi}>
                                {bi}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="my-4">
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="dryingInstruction">
                    Drying Instructions:
                </label>
                <div className="my-1">
                    <Select
                        id="dryingInstruction"
                        name="dryingInstruction"
                        value={careDetailsData.dryingInstruction || ""}
                        onChange={handleFormInput}
                        className="block border-2 bg-transparent"
                    >
                        <option value="" >

                        </option>

                        {dryingInstruction.map((di) => (
                            <option key={di} value={di}>
                                {di}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="my-4">
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="ironingInstruction">
                    Ironing Instructions:
                </label> 
                <div className="my-1">
                    <Select
                        id="ironingInstruction"
                        name="ironingInstruction"
                        value={careDetailsData.ironingInstruction || ""}
                        onChange={handleFormInput}
                        className="block border-2 bg-transparent"
                    >
                        <option value="" >
                        </option>

                        {ironingInstruction.map((ii) => (
                            <option key={ii} value={ii}>
                                {ii}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="my-4">
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="dryCleaningInstruction">
                    Dry Cleaning Instructions:
                </label>
                <div className="my-1">
                    <Select
                        id="dryCleaningInstruction"
                        name="dryCleaningInstruction"
                        value={careDetailsData.dryCleaningInstruction || ""}
                        onChange={handleFormInput}
                        className="block border-2 bg-transparent"
                    >
                        <option value="" >
                            
                        </option>

                        {dryCleaningInstruction.map((dci) => (
                            <option key={dci} value={dci}>
                                {dci}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="my-4">
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="specialInstruction">
                    Special Instruction:
                </label>

                <div className="my-1">
                    <Select
                        id="specialInstruction"
                        name="specialInstruction"
                        value={careDetailsData.specialCases || ""}
                        onChange={handleFormInput}
                        className="block border-2 bg-transparent"
                    >
                        <option value="" >

                        </option>

                        {specialCases.map((sc) => (
                            <option key={sc} value={sc}>
                                {sc}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            <div>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm"
                >
                    {/* Save Care Instruction */}
                    {isSubmitting ? "Saving" : "Save Shipping Configuration"}
                </Button>
            </div>
        </form>
    )
}
export default CareDetailsForm;