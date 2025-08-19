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
            <div className="border-2 w-full">
                <div className="mx-auto px-4 py-2 w-full overflow-x-auto sm:w-full md:w-fit lg:w-fit">
                    <nav className="flex space-x-4">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.value}
                                onClick={() => handleTabClick(tab.value)}
                                className={`px-4 py-2 font-medium text-sm transition-colors duration-300
                                ${activeTab === tab.value
                                    ? 'bg-black border-2 ring-2 ring-offset-2 ring-black text-white hover:bg-gray-300 hover:text-gray-900' 
                                    : 'text-black hover:bg-gray-300 hover:text-gray-900 border-2 border-gray-200 bg-gray-300'
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