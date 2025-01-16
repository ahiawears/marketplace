import { categoriesList } from '@/lib/categoriesList';
import React from 'react';
import { Input } from '../ui/input';

interface MeasurementSizesTableProps {
    category: string;
    measurements: {
        [size: string]: {
          [measurement: string]: number | string; // Measurements (e.g., "chest", "waist", etc.)
        };
    };
    onMeasurementChange: (size: string, field: string, value: number) => void; // Function to handle updates
    sizes: string[];
}

// Dynamic table component for measurements, sizes, and quantities
const MeasurementSizesTable: React.FC<MeasurementSizesTableProps> = ({ category, measurements, onMeasurementChange, }) => {
    if (!category) {
        return <p className="text-gray-500">Please select a category to proceed.</p>;
    }

    const sizes = ["Small", "Medium", "Large", "X-L", "XX-L", "2X-L"]; // Extend sizes as needed

    const categoryData = categoriesList.find((cat) => cat.name === category);

    return (
        <div className="overflow-x-auto mt-5">
            <h2 className="text-xl font-bold mb-3">Category: {categoryData?.name}</h2>
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
                    {sizes.map((size) => (
                        <tr key={size}>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                                {size}
                            </td>
                            {categoryData?.measurements.map((measurement) => (
                                <td key={measurement} className="border border-gray-300 px-4 py-2">
                                    <Input
                                        name='sizes'
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
                                    name='quantity'
                                    type="number"
                                    placeholder="Quantity"
                                    //value={quantities[size] || ""}
                                    // onChange={(e) =>
                                    //     onQuantityChange(size, parseFloat(e.target.value) || 0)
                                    // }
                                    value={measurements[size]?.quantity || ""}
                                    onChange={(e) => onMeasurementChange(size, "quantity", parseFloat(e.target.value))}
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
