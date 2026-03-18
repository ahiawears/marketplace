"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";

interface NavItemLink {
    label: string;
    href: string;
}

interface NavigationItem {
    id: number;
    label: string;
    eyebrow: string;
    description: string;
    links: NavItemLink[];
}

const Navbarn = () => {
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const pathname = usePathname();
    const gender = pathname.includes("/shop/women") ? "women" : "men";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/storefront/navigation", {
                    cache: "no-store",
                });
                const result = await response.json();

                if (response.ok && Array.isArray(result.data)) {
                    setCategories(result.data);
                }
            } catch (error) {
                console.error("Failed to load storefront navigation categories", error);
            }
        };

        fetchCategories();
    }, []);

    const navigationItems: NavigationItem[] = useMemo(() => {
        const scopedCategories = categories.slice(0, 10).map((category) => ({
            label: category,
            href: `/products?cat=${encodeURIComponent(category)}&gender=${encodeURIComponent(gender)}`,
        }));

        return [
            {
                id: 1,
                label: "New In",
                eyebrow: "Fresh releases",
                description: "The latest active and released pieces for this storefront.",
                links: [
                    { label: "Shop all new in", href: `/products?query=${encodeURIComponent("new in")}&gender=${encodeURIComponent(gender)}` },
                    { label: "Latest drops", href: `/products?query=${encodeURIComponent("latest drops")}&gender=${encodeURIComponent(gender)}` },
                    { label: "Just released", href: `/products?query=${encodeURIComponent("just released")}&gender=${encodeURIComponent(gender)}` },
                ],
            },
            {
                id: 2,
                label: "Most Saved",
                eyebrow: "Community picks",
                description: "A future ranking surface for the pieces customers keep coming back to.",
                links: [
                    { label: "Most saved", href: `/products?query=${encodeURIComponent("most saved")}&gender=${encodeURIComponent(gender)}` },
                    { label: "Trending now", href: `/products?query=${encodeURIComponent("trending")}&gender=${encodeURIComponent(gender)}` },
                    { label: "Editor picks", href: `/products?query=${encodeURIComponent("editor picks")}&gender=${encodeURIComponent(gender)}` },
                ],
            },
            {
                id: 3,
                label: "Best Selling",
                eyebrow: "Future sales ranking",
                description: "Reserved for the best-performing products once storefront orders are live.",
                links: [
                    { label: "Best selling", href: `/products?query=${encodeURIComponent("best selling")}&gender=${encodeURIComponent(gender)}` },
                    { label: "Bestsellers in stock", href: `/products?query=${encodeURIComponent("bestsellers")}&gender=${encodeURIComponent(gender)}` },
                    { label: "Popular right now", href: `/products?query=${encodeURIComponent("popular")}&gender=${encodeURIComponent(gender)}` },
                ],
            },
            {
                id: 4,
                label: "Categories",
                eyebrow: "Browse by type",
                description: `Explore ${gender} products by category.`,
                links: scopedCategories,
            },
            {
                id: 5,
                label: "Brands",
                eyebrow: "Marketplace labels",
                description: "Browse the vendors behind the storefront and discover new labels.",
                links: [
                    { label: "All brands", href: "/brands" },
                    { label: `Shop all ${gender}`, href: `/products?gender=${encodeURIComponent(gender)}` },
                ],
            },
        ];
    }, [categories, gender]);

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
        <nav className="border-b-2 bg-white">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-16 items-center justify-between gap-4">
                    <div className="hidden lg:flex items-center gap-6">
                        {navigationItems.map((item) => (
                            <div
                                key={item.id}
                                className="relative group"
                                onMouseEnter={() => handleMouseEnter(item.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    className="flex items-center gap-2 py-4 text-sm font-medium text-stone-700 transition hover:text-stone-900 focus:outline-none"
                                    aria-expanded={activeDropdown === item.id}
                                    aria-haspopup="true"
                                >
                                    {item.label}
                                    <FiChevronDown className="h-4 w-4" />
                                </button>

                                {activeDropdown === item.id && (
                                    <div className="absolute left-0 top-full z-50 w-[680px] border-2 bg-white p-6 shadow-xl">
                                        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                                            <div className="space-y-3 border-r border-stone-200 pr-6">
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                                                    {item.eyebrow}
                                                </p>
                                                <h3 className="text-2xl font-semibold text-stone-900">{item.label}</h3>
                                                <p className="text-sm leading-6 text-stone-600">{item.description}</p>
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {item.links.map((link) => (
                                                    <Link
                                                        key={link.href + link.label}
                                                        href={link.href}
                                                        className="border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-700 transition hover:border-stone-900 hover:bg-white hover:text-stone-900"
                                                    >
                                                        {link.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 lg:block">
                        {gender} storefront
                    </div>

                    <div className="flex w-full items-center justify-between lg:hidden">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                            {gender} storefront
                        </p>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="border-t-2 lg:hidden">
                    <div className="px-4 py-4 space-y-3">
                        {navigationItems.map((item) => (
                            <div key={item.id} className="border-2 border-stone-200 bg-stone-50 px-3 py-3">
                                <button
                                    className="flex w-full items-center justify-between text-left font-medium text-stone-800"
                                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                                >
                                    {item.label}
                                    <FiChevronDown className={`h-4 w-4 transition ${activeDropdown === item.id ? "rotate-180" : ""}`} />
                                </button>
                                {activeDropdown === item.id && (
                                    <div className="mt-3 space-y-3">
                                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{item.eyebrow}</p>
                                        <p className="text-sm leading-6 text-stone-600">{item.description}</p>
                                        <div className="grid gap-2">
                                            {item.links.map((link) => (
                                                <Link
                                                    key={link.href + link.label}
                                                    href={link.href}
                                                    className="block border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
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
