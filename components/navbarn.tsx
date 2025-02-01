"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { FiMenu, FiX } from "react-icons/fi";

// Define types for the navigation item and its sub-items
interface SubItem {
    id: number;
    label: string;
}

interface MainSection {
    id: number;
    title: string;
    description: string;
}

interface NavigationItem {
    id: number;
    label: string;
    category: string;
    mainSections: MainSection[];
    subItems: SubItem[];
}

// Define props for the NavItem component
interface NavItemProps {
    item: NavigationItem;
    handleMouseEnter: (id: number) => void;
    handleMouseLeave: () => void;
    isOpen: boolean;
}

const NavItem = memo(({ item, handleMouseEnter, handleMouseLeave, isOpen }: NavItemProps) => (
    <div
        className="relative group"
        onMouseEnter={() => handleMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
    >
        <button
            className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-expanded={isOpen}
            aria-haspopup="true"
        >
            {item.label}
        </button>
        {isOpen && (
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[600px] bg-white shadow-lg rounded-lg py-4 z-50">
                <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4">
                    <div className="border-r border-gray-200 px-4">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">{item.category}</h3>
                        {item.mainSections.map((section) => (
                            <div key={section.id} className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">{section.title}</h4>
                                <p className="text-sm text-gray-600">{section.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="px-4">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Quick Links</h3>
                        {item.subItems.map((subItem) => (
                            <button
                                key={subItem.id}
                                className="block w-full text-left py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-md transition-colors"
                            >
                                {subItem.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
));

const Navbarn = () => {
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems: NavigationItem[] = [
        {
            id: 1,
            label: "Brands",
            category: "Our Products",
            mainSections: [
                {
                    id: 1,
                    title: "Enterprise Solutions",
                    description: "Powerful tools for large organizations",
                },
                {
                    id: 2,
                    title: "Small Business",
                    description: "Perfect for growing companies",
                },
            ],
            subItems: [
                { id: 1, label: "Product Overview" },
                { id: 2, label: "Features" },
                { id: 3, label: "Pricing" },
                { id: 4, label: "Case Studies" },
            ],
        },
        {
            id: 2,
            label: "Sale",
            category: "Business Solutions",
            mainSections: [
                {
                    id: 1,
                    title: "Industry Specific",
                    description: "Tailored solutions for your industry",
                },
                {
                    id: 2,
                    title: "Custom Integration",
                    description: "Seamless integration with your systems",
                },
            ],
            subItems: [
                { id: 1, label: "Healthcare" },
                { id: 2, label: "Finance" },
                { id: 3, label: "Education" },
                { id: 4, label: "Technology" },
            ],
        },
        {
            id: 3,
            label: "Hello",
            category: "Business Solutions",
            mainSections: [
                {
                    id: 1,
                    title: "Industry Specific",
                    description: "Tailored solutions for your industry",
                },
                {
                    id: 2,
                    title: "Custom Integration",
                    description: "Seamless integration with your systems",
                },
            ],
            subItems: [
                { id: 1, label: "Healthcare" },
                { id: 2, label: "Finance" },
                { id: 3, label: "Education" },
                { id: 4, label: "Technology" },
            ],
        },
    ];

    const handleMouseEnter = useCallback((id: number) => {
        setActiveDropdown(id);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setActiveDropdown(null);
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (!(event.target as HTMLElement).closest(".group")) {
            setActiveDropdown(null);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [handleClickOutside]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center h-16 items-center">
                    <div className="hidden lg:flex items-center space-x-4">
                        {navigationItems.map((item) => (
                            <NavItem
                                key={item.id}
                                item={item}
                                handleMouseEnter={handleMouseEnter}
                                handleMouseLeave={handleMouseLeave}
                                isOpen={activeDropdown === item.id}
                            />
                        ))}
                    </div>

                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigationItems.map((item) => (
                            <div key={item.id} className="px-3 py-2">
                                <button
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                                >
                                    {item.label}
                                </button>
                                {activeDropdown === item.id && (
                                    <div className="mt-2 space-y-2">
                                        {item.subItems.map((subItem) => (
                                            <button
                                                key={subItem.id}
                                                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-md"
                                            >
                                                {subItem.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbarn;