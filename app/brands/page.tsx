'use client';
import { Button } from '@/components/ui/button';
import staticBrands from '@/lib/staticBrands';
import React, { useState } from 'react'; // No need for useEffect here now

interface BrandsData {
    [key: string]: string[];
}

const Brands: React.FC = () => {
    // State to keep track of the currently selected letter
    const [selectedLetter, setSelectedLetter] = useState<string>('A');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // Array of A, B, C...

    // Directly use the imported static data
    const brandsForSelectedLetter = staticBrands[selectedLetter] || [];

    return (
        <div className="flex flex-1 flex-col ">

            {/* A-Z Horizontal Menu */}
            <nav className="sticky md:top-[106px] top-[106px] z-10 w-full bg-white shadow-md dark:bg-gray-900 py-4 px-6">
                <div className="mx-auto max-w-7xl flex items-center overflow-x-auto pb-2">
                    <ul className="flex flex-nowrap gap-x-4 text-sm font-medium">
                        {alphabet.map(letter => (
                            <li key={letter}>
                                <Button
                                    onClick={() => setSelectedLetter(letter)}
                                    className={`
                                        px-3 py-1 rounded-md transition-colors duration-200
                                        ${selectedLetter === letter
                                            ? 'bg-black text-white hover:bg-gray-800'
                                            : 'bg-gray-300 text-gray-500 hover:text-white border-2'
                                        }
                                    `}
                                >
                                    {letter}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Main content area */}
            <div className="flex-1 p-6 mx-auto max-w-7xl w-full">
                {/* No loading state needed now, data is always available */}
                {selectedLetter && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-6 text-center">
                            Brands Starting with "{selectedLetter}"
                        </h2>
                        {brandsForSelectedLetter.length > 0 ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {brandsForSelectedLetter.map((brand, index) => (
                                    <li key={`${selectedLetter}-${index}`}
                                        className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center text-lg font-semibold text-gray-800 dark:text-gray-200 border-2"
                                    >
                                        <a href={`/brands/${brand.toLowerCase().replace(/\s/g, '-')}`} className="block w-full text-center">
                                            {brand}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                                No brands found for "{selectedLetter}".
                            </p>
                        )}
                    </div>
                )}
                {!selectedLetter && (
                     <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                        Please select a letter to view brands.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Brands;