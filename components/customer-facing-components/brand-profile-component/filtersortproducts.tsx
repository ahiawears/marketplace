import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FilterOption } from '@/lib/types';
import { FilterIcon, X } from 'lucide-react';
import React, { useState } from 'react';

interface FilterSortProductsProps<T extends { [K in keyof T]: FilterOption }> {
    filterOptions: T; 
    onFilterChange?: (filters: Partial<Record<keyof T, string>>) => void;
}

export const FilterSortProducts = <T extends Record<string, FilterOption>>({
    filterOptions,
    onFilterChange,
}: FilterSortProductsProps<T>) => {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const handleSelectChange = (key: string, value: string) => {
        if (onFilterChange) {
            onFilterChange({ [key]: value } as Partial<Record<keyof T, string>>);
        }
    };

    const handleDoneClick = () => {
        setIsMobileFiltersOpen(false);
    };

    return (
        <div className="bg-gray-200 dark:bg-gray-800 space-y-4 py-4 shadow-md border-y-2">

            <div className="container ">
                <div className="flex justify-center items-center py-2 md:hidden">
                    <Button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="flex items-center gap-2 p-2 rounded-md text-white dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Open filters"
                    >
                        <FilterIcon className="h-6 w-6" />
                        <span className="font-medium">Filters</span>
                    </Button>
                </div>
                <div
                    className={`
                        md:block
                        ${isMobileFiltersOpen ? 'fixed inset-0 z-50 bg-gray-200 dark:bg-gray-800 overflow-y-auto' : 'hidden'}
                        ${isMobileFiltersOpen ? 'flex flex-col' : ''}
                        md:static md:w-full
                    `}
                >
                    {isMobileFiltersOpen && (
                        <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-gray-600 mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filter Products</h2>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Close filters"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    )}

                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 container mx-auto md:px-2">
                        {Object.values(filterOptions).map((filter: FilterOption) => (
                            <div key={filter.key} className="flex flex-col items-center">
                                <label htmlFor={filter.key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {filter.label}
                                </label>
                                <Select
                                    id={filter.key}
                                    name={filter.key}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base dark:border-gray-600 border-2 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => handleSelectChange(filter.key, e.target.value)}
                                >
                                    <option value="">All</option>
                                    {filter.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        ))}
                    </div>

                    {isMobileFiltersOpen && (
                        <div className="m-8 container mx-auto">
                            <Button
                                onClick={handleDoneClick}
                                className="sm:w-auto px-6 py-3 text-white font-semibold focus:outline-none transition-colors duration-200 absolute inset-x-0 bottom-0.5"
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            </div>            
        </div>
    );
};