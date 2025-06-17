"use client";

import { bleachingInstruction, dryCleaningInstruction, dryingInstruction, ironingInstruction, specialCases, washingInstruction } from "@/lib/productCareInstruction";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { useState } from "react";
import { ProductCareInstruction } from "@/lib/types";
import { on } from "events";

interface CareInstructionsProps {
    initialCareInstructions: ProductCareInstruction;
    onSaveCareinstructions: (instructions: ProductCareInstruction) => void;
    // Optional: if you want to notify the parent immediately on change
    // onCareInstructionsChange?: (instructions: ProductCareInstruction) => void;
}

const CareInstructions: React.FC<CareInstructionsProps> = ({ initialCareInstructions, onSaveCareinstructions }) => {
    const [careInstructions, setCareInstructions] = useState<ProductCareInstruction>(initialCareInstructions || {});

    const handleChange = (field: keyof ProductCareInstruction, value: string) => {
        const updatedInstructions = {
            ...careInstructions, 
            [field]: value,
        };
        setCareInstructions(updatedInstructions);
    }

    const handleSave = (instructions: ProductCareInstruction) => {
        onSaveCareinstructions(instructions);
    }
    return (
        <div className="my-6 space-y-4">
            <div>
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="washingInstruction">
                    Washing Instructions:
                </label>
                <Select
                    id="washingInstruction"
                    name="washingInstruction"
                    value={careInstructions.washingInstruction || ""}
                    onChange={(e) => handleChange("washingInstruction", e.target.value)}
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
            <div>
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="bleachingInstruction">
                    Bleaching Instructions:
                </label>
                <Select
                    id="bleachingInstruction"
                    name="bleachingInstruction"
                    value={careInstructions.bleachingInstruction || ""}
                    onChange={(e) => handleChange("bleachingInstruction", e.target.value)}
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
            <div>
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="dryingInstruction">
                    Drying Instructions:
                </label>
                <Select
                    id="dryingInstruction"
                    name="dryingInstruction"
                    value={careInstructions.dryingInstruction || ""}
                    onChange={(e) => handleChange("dryingInstruction", e.target.value)}
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
            <div>
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="ironingInstruction">
                    Ironing Instructions:
                </label>
                <Select
                    id="ironingInstruction"
                    name="ironingInstruction"
                    value={careInstructions.ironingInstruction || ""}
                    onChange={(e) => handleChange("ironingInstruction", e.target.value)}
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
            <div>
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="dryCleaningInstruction">
                    Dry Cleaning Instructions:
                </label>
                <Select
                    id="dryCleaningInstruction"
                    name="dryCleaningInstruction"
                    value={careInstructions.dryCleaningInstruction || ""}
                    onChange={(e) => handleChange("dryCleaningInstruction", e.target.value)}
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
            <div>
                <label className="block text-sm font-bold mt-3 mb-1" htmlFor="specialInstruction">
                    Special Instruction:
                </label>
                <Select
                    id="specialInstruction"
                    name="specialInstruction"
                    value={careInstructions.specialCases || ""}
                    onChange={(e) => handleChange("specialCases", e.target.value)}
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
            <div className="mt-5">
                <Button
                    onClick={() => handleSave(careInstructions)}                    
                    className="flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm"
                >
                    Save
                </Button>
            </div>
        </div>
    )
}

export default CareInstructions;

