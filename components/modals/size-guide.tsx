import { useBodyScrollLock } from '@/lib/utils/bodyScrollLock';
import React, { useEffect } from 'react';

interface Measurement {
    type: string;
    value: string;
    unit: string;
}

interface SizeData {
    [sizeName: string]: {
        measurements: Measurement[];
    };
}

interface SizeGuideModalProps {
    onCancel: () => void;
    sizeData: SizeData;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ onCancel, sizeData }) => {

    useBodyScrollLock(true);
    // Get all measurement types from the first size (assuming all sizes have same measurements)
    const measurementTypes = Object.values(sizeData)[0]?.measurements.map(m => m.type) || [];


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                <h2 className="text-xl font-bold mb-4">Size Guide</h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2">
                                    Size
                                </th>
                                {measurementTypes.map((type) => (
                                    <th key={type} className="border p-2">{type}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(sizeData).map(([sizeName, sizeDetails]) => (
                                <tr key={sizeName}>
                                    <td className="border p-2 font-medium">{sizeName.toUpperCase()}</td>
                                    {sizeDetails.measurements.map((measurement, index) => (
                                        <td key={index} className="border p-2 text-center">
                                            {measurement.value} {measurement.unit}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SizeGuideModal;