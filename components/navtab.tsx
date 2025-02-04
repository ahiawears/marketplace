"use client";

import { useState } from "react";

interface Tab {
    label: string;
    value: string;
}

interface NavTabsProps {
    tabs: Tab[];
    onTabChange: (value: string) => void;
    initialTab?: string; // Optional: Set initial active tab
}

const NavTab: React.FC<NavTabsProps> = ({ tabs, onTabChange, initialTab }) => {    
    const [activeTab, setActiveTab] = useState(initialTab || tabs[0].value);
    const handleTabClick = (value: string) => {
        setActiveTab(value);
        onTabChange(value);
    };
    return (
        <>
            <div className="border-b border-gray-200 w-full"> {/* Optional border */}
                <div className="mx-auto w-full overflow-x-auto sm:w-full md:w-fit lg:w-fit">
                    <nav className="flex space-x-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleTabClick(tab.value)}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-300
                                ${activeTab === tab.value
                                    ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50' // Active styles
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50' // Inactive styles
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
            </div>
        </>
    );
}

export default NavTab;