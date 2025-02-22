"use client";

import { categoriesList } from "../../lib/categoriesList.ts";
import React, { useEffect, useState } from 'react';
import { Input } from "../ui/input.tsx";

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
}

// Dynamic table component for measurements, sizes, and quantities
const MeasurementSizesTable: React.FC<MeasurementSizesTableProps> = ({ category, measurements, onMeasurementChange, setSelectedSizes }) => {
    if (!category) {
        return <p className="text-gray-500">Please select a category to proceed.</p>;
    }
    const [selectedSizes, setSelectedSizesLocal] = useState<string[]>([]);

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

    return (
        <div className="overflow-x-auto mt-5">
            <h2 className="text-xl font-bold mb-3">Category: {categoryData?.name}</h2>
            {/* Size Selection */}
            <div className="flex flex-wrap gap-2 mb-4">
                {sizes.map((size) => (
                    <div
                        key={size}
                        className={`px-3 py-1 text-sm cursor-pointer ${
                            selectedSizes.includes(size)
                                ? "bg-black text-white"
                                : "bg-primary text-white opacity-50"}
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
                        <th className="border border-gray-300 px-4 py-2">Size</th>
                        {categoryData?.measurements.map((measurement) => (
                            <th key={measurement} className="border border-gray-300 px-4 py-2">
                                {measurement}
                            </th>
                        ))}
                        <th className="border border-gray-300 px-4 py-2">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedSizes.map((size) => (
                        <tr key={size}>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                                {size}
                            </td>
                            {categoryData?.measurements.map((measurement) => (
                                <td key={measurement} className="border border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder={measurement}
                                        value={measurements[size]?.[measurement] || ""}
                                        onChange={(e) =>
                                            onMeasurementChange(size, measurement, parseFloat(e.target.value))
                                        }
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </td>
                            ))}
                            <td className="border border-gray-300 px-4 py-2">
                                <Input
                                    type="number"
                                    placeholder="Quantity"
                                    value={measurements[size]?.quantity || ""}
                                    onChange={(e) =>
                                        onMeasurementChange(size, "quantity", parseFloat(e.target.value))
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
