"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
    {
        name: "New In",
        subcategories: ["T-Shirts", "Hoodies", "Jeans", "Sneakers"],
    },
    {
        name: "Women",
        subcategories: ["Dresses", "Tops", "Heels", "Accessories"],
    },
    {
        name: "Kids",
        subcategories: ["T-Shirts", "Shoes", "Jackets"],
    },
    {
        name: "New Arrivals",
        subcategories: [],
    },
    {
        name: "Sale",
        subcategories: [],
    },
];

export const Navbar = () => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
        <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <ul className="flex justify-center space-x-6 py-4">
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className="relative"
                            onMouseEnter={() =>
                                category.subcategories.length > 0
                                    ? setOpenDropdown(category.name)
                                    : setOpenDropdown(null)
                            }
                            onMouseLeave={() => setOpenDropdown(null)}
                        >
                            <li>
                                <Link
                                    href={`/category/${category.name.toLowerCase()}`}
                                    className="text-gray-700 font-medium hover:text-gray-900 transition"
                                >
                                    {category.name}
                                </Link>
                            </li>

                            {/* Dropdown Menu */}
                            {category.subcategories.length > 0 &&
                                openDropdown === category.name && (
                                    <div className="fixed left-0 w-screen bg-white shadow-lg border border-gray-200 mt-2 z-50">
                                        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                                            {category.subcategories.map((sub) => (
                                                <Link
                                                    key={sub}
                                                    href={`/category/${category.name.toLowerCase()}/${sub.toLowerCase()}`}
                                                    className="flex relative text-gray-600 hover:text-gray-900"
                                                >
                                                    {sub}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    ))}
                </ul>
            </div>
        </nav>
    );
};
