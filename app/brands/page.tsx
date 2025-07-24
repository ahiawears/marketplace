'use client';
import { Button } from '@/components/ui/button';
import { useGetAllBrands } from '@/hooks/useGetAllBrands';
import React, { useState, useMemo } from 'react'; // Added useMemo for optimization
import LoadContent from '../load-content/page';

// Define an interface for your fetched brand data structure
interface Brand {
    id: string;
    name: string;
    description: string;
    logo: string;
    banner: string;
    legal_details: {
        business_registration_name: string;
        business_registration_number: string;
        country_of_registration: string;
    } | null; // It can be null if no legal details are found
}

const Brands: React.FC = () => {
    const { loading: brandsListLoading, error: brandsListError, brands: brandsListData } = useGetAllBrands();
    const [selectedLetter, setSelectedLetter] = useState<string>('A');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Memoize the filtered and sorted brands for performance
    const filteredBrands = useMemo(() => {
        if (!brandsListData || brandsListData.length === 0) {
            return [];
        }

        // 1. Filter brands based on the selected letter (case-insensitive)
        const filtered = brandsListData.filter((brand: Brand) =>
            brand.name.toLowerCase().startsWith(selectedLetter.toLowerCase())
        );

        // 2. Sort the filtered brands alphabetically by name
        const sorted = filtered.sort((a: Brand, b: Brand) =>
            a.name.localeCompare(b.name)
        );

        return sorted;
    }, [brandsListData, selectedLetter]); 

    if (brandsListLoading) {
        return <LoadContent />;
    }

    if (brandsListError) {
        console.error(brandsListError); 
        return <div>Error: {brandsListError.message}</div>;
    }

    return (
        <div className="flex flex-1 flex-col">
            {/* A-Z Horizontal Menu */}
            <nav className="sticky md:top-[106px] top-[106px] z-10 w-full bg-white shadow-md dark:bg-gray-900 py-4 px-6 border-b-2">
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
                {selectedLetter && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-6 text-center">
                            Brands Starting with "{selectedLetter}"
                        </h2>
                        {filteredBrands.length > 0 ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredBrands.map((brand: Brand) => (
                                    <li key={brand.id}
                                        className="relative bg-cover bg-center h-48 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border-2"
                                        style={{ backgroundImage: `url(${brand.logo})` }}
                                    >
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
                                            <a
                                                href={`/brands/${brand.id}`}
                                                className="block w-full text-center text-white text-xl font-bold truncate"
                                                title={brand.name} // Add title for full name on hover
                                            >
                                                {brand.name}
                                            </a>
                                            {/* Optionally display description or other details */}
                                            <p className="text-gray-200 text-sm mt-1 text-center line-clamp-2">
                                                {brand.description}
                                            </p>
                                        </div>
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