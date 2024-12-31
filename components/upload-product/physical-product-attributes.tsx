import { useEffect, useState } from "react";
import { categoriesList } from "@/lib/categoriesList";
import { Select } from "../ui/select";

interface PhysicalProductAttributesProps {
    setCat: string;
}

const PhysicalProductAttributes: React.FC<PhysicalProductAttributesProps> = ({ setCat }) => {
    const [bodyMeasured, setBodyMeasured] = useState<string[]>([]);
    const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([]);

    const category = categoriesList.find((cat) => cat.name === setCat);

    useEffect(() => {
        // Populate bodyMeasured when the category changes
        setBodyMeasured(category?.measurements || []);
    }, [category]);

    const handleMeasurementChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const options = event.target.options;
        const selectedValues: string[] = [];
        for (const option of options) {
            if (option.selected) {
                selectedValues.push(option.value);
            }
        }
        setSelectedMeasurements(selectedValues);
    };

    return (
        <div className="physical-product-attributes">
            <div className="mb-4">
                <label htmlFor="measurementsList" className="block text-sm font-bold text-gray-900">
                    Product Measurements Available:*
                </label>
                <div className="mt-2">
                    <Select
                        id="catMeasurements"
                        name="catMeasurements"
                        multiple
                        className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedMeasurements}
                        onChange={handleMeasurementChange}
                    >
                        {bodyMeasured.length > 0 ? (
                            bodyMeasured.map((measurement) => (
                                <option key={measurement} value={measurement}>
                                    {measurement}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                No measurements available for this category
                            </option>
                        )}
                    </Select>
                </div>
                <div className="mt-4">
                    <h4 className="text-sm font-semibold">Selected Measurements:</h4>
                    <ul className="list-disc pl-5">
                        {selectedMeasurements.map((measurement, index) => (
                            <li key={index} className="text-sm text-gray-700">
                                {measurement}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PhysicalProductAttributes;
