"use client";

import { useState } from "react";
import { Button } from "./ui/button";

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
                            <Button
                                key={tab.value}
                                onClick={() => handleTabClick(tab.value)}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-300
                                ${activeTab === tab.value
                                    ? 'bg-black text-white hover:bg-gray-100 hover:text-gray-900' // Active styles
                                    : 'text-white hover:bg-gray-100 hover:text-gray-900 opacity-60' // Inactive styles
                                }`}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </nav>
                </div>
                
            </div>
        </>
    );
}

export default NavTab;