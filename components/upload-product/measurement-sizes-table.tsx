"use client";

import { categoriesList } from "../../lib/categoriesList";
import React, { useEffect, useState } from 'react';
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { ProductVariantType } from "@/lib/types";
 
interface MeasurementSizesTableProps {
    category: string; 
    measurements: {
        [size: string]: {
          [measurement: string]: number | string; // Measurements (e.g., "chest", "waist", etc.)
          quantity: number;
        };
    };
    onMeasurementChange: (size: string, field: string, value: number) => void; // Function to handle updates
    setSelectedSizes: (sizes: string[]) => void;
    selectedSizes: string[];
    measurementUnit: "Inch" | "Centimeter"; // Add this line
    setMeasurementUnit: (unit: "Inch" | "Centimeter") => void; // Add this line
    updateVariant: (index: number, field: keyof ProductVariantType, value: string | "Inch" | "Centimeter") => void; // Add this line
    variantIndex: number; // Add this line
}

function ValidateNumber(strNumber: string, allowDecimal: boolean = false): boolean {
    if (allowDecimal) {
        return /^\d+(\.\d+)?$/.test(strNumber) && !/[eE]/.test(strNumber); // Allows integers and decimals, but not 'e' or 'E'
    } else {
        return /^\d+$/.test(strNumber) && !/[eE]/.test(strNumber); // Only allows integers, but not 'e' or 'E'
    }
}

// Dynamic table component for measurements, sizes, and quantities
const MeasurementSizesTable: React.FC<MeasurementSizesTableProps> = ({ category, measurements, onMeasurementChange, setSelectedSizes, selectedSizes, measurementUnit, setMeasurementUnit, updateVariant, variantIndex  }) => {
    if (!category) {
        return <p className="text-gray-500">Please select a category to proceed.</p>;
    }
    const [selectedSizesLocal, setSelectedSizesLocal] = useState<string[]>(selectedSizes);

    const sizes = ["Small", "Medium", "Large", "X-L", "XX-L", "2X-L", "Oversized"]; // Extend sizes as needed

    const categoryData = categoriesList.find((cat) => cat.name === category);

    // Handle size selection
    const handleSizeSelection = (size: string) => {
        const newSelectedSizes = selectedSizes.includes(size)
            ? selectedSizes.filter((s) => s !== size)
            : [...selectedSizes, size];
        setSelectedSizesLocal(newSelectedSizes);
        setSelectedSizes(newSelectedSizes); // Update parent state
        
        // Remove measurements and quantity for the deselected size
        if (!newSelectedSizes.includes(size)) {
            onMeasurementChange(size, "remove", 0); // Custom logic to handle removal
        }
    };

    //check if measurements were set already
    useEffect(() => {
        const initialSelectedSizes = sizes.filter(size => measurements.hasOwnProperty(size));
        setSelectedSizesLocal(initialSelectedSizes);
    }, [measurements]);

    useEffect(() => {
        setSelectedSizesLocal(selectedSizes);
    }, [selectedSizes]);

    const handleMeasurementUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurementUnit(event.target.value as "Inch" | "Centimeter");
        updateVariant(variantIndex, "measurementUnit", event.target.value as "Inch" | "Centimeter");
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        size: string,
        measurement: string,
        isQuantity: boolean
      ) => {
        const inputValue = e.target.value;
        
        if (!ValidateNumber(inputValue)) {
            // If not a valid number, remove the last character
            e.target.value = inputValue.slice(0, -1);
            return;
        }

        if (/[eE]/.test(inputValue)) {
            e.target.value = inputValue.replace(/[eE]/g, "");
            return;
        }
      
        // Update the state with the numeric value
        onMeasurementChange(size, isQuantity ? "quantity" : measurement, inputValue ? parseFloat(inputValue) : 0);
    };
    return (
        <div className="overflow-x-auto mt-5">
            <h2 className="text-xl font-bold my-4">Category: {categoryData?.name}</h2>

            <div className="my-4 border-2 p-4">
                <div>
                    <label htmlFor="measurementUnit" className="block text-sm font-bold text-gray-900"> Select the measurement unit</label>
                    
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center">
                            <Input 
                                type="radio"
                                id="measurementUnitInch"
                                name="measurementUnit"
                                value="Inch"
                                checked={measurementUnit === "Inch"}
                                //onChange={handleMeasurementUnitChange}
                                onChange={(e) => {
                                    handleMeasurementUnitChange(e);
                                }}
                                className={cn(
                                    "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                    "peer appearance-none",
                                    "checked:bg-black checked:border-transparent",
                                    "hover:border-gray-500 cursor-pointer"
                                )}
                            />
                            <label htmlFor="measurementUnitInch" className="ml-2 text-sm peer-checked:text-black">Inch</label>
                        </div>

                        <div className="flex items-center">
                            <Input
                                type="radio"
                                id="measurementUnitCentimeter"
                                name="measurementUnit"
                                value="Centimeter"
                                checked={measurementUnit === "Centimeter"}
                                //onChange={handleMeasurementUnitChange}
                                onChange={(e) => {
                                    handleMeasurementUnitChange(e);
                                }}
                                className={cn(
                                    "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                    "peer appearance-none",
                                    "checked:bg-black checked:border-transparent",
                                    "hover:border-gray-500 cursor-pointer"
                                )}
                            />
                            <label htmlFor="measurementUnitCentimeter" className="ml-2 text-sm peer-checked:text-black">Centimeter</label>
                        </div>
                           
                    </div>
                </div>
            </div>
            {/* Size Selection */}
            <div className="flex flex-wrap gap-2 mb-4">
                {sizes.map((size) => (
                    <div
                        key={size}
                        className={`px-3 border-2 py-1 text-sm cursor-pointer ${
                            selectedSizes.includes(size)
                                ? "bg-black text-white border-2"
                                : "bg-primary text-white opacity-50 border-2"}
                                hover:bg-primary/90 hover:text-white
                            `}
                        onClick={() => handleSizeSelection(size)}
                        
                    >
                        {size}
                    </div>
                ))}
            </div>
            {/* Measurements Table */}
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border-2 px-4 py-2">Size</th>
                        {categoryData?.measurements.map((measurement) => (
                            <th key={measurement} className="border-2 px-4 py-2">
                                {measurement} ({measurementUnit === "Inch" ? "in" : "cm"})
                            </th>
                        ))}
                        <th className="border-2 px-4 py-2">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedSizes.map((size) => (
                        <tr key={size}>
                            <td className="border-2 px-4 py-2 font-medium">
                                {size}
                            </td>
                            {categoryData?.measurements.map((measurement) => (
                                <td key={measurement} className="border-2 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder={measurement}
                                        value={measurements[size]?.[measurement] || ""}
                                        onChange={(e) =>
                                            handleInputChange(e, size, measurement, false)
                                        }
                                        className="w-full px-2 py-1 border-2 rounded-md focus:outline-none focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </td>
                            ))}
                            <td className="border-2 px-4 py-2">
                                <Input
                                    type="number"
                                    placeholder="Quantity"
                                    value={measurements[size]?.quantity || ""}
                                    onChange={(e) =>
                                        handleInputChange(e, size, "", true)
                                    }
                                    className="w-full px-2 py-1 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MeasurementSizesTable;

// Usage Example
// Pass the category object from `categoriesList` to the component
// <MeasurementSizesTable category={selectedCategory} />
