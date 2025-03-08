"use client";

import NavTab from "@/components/navtab";
import { useState } from "react";
import BrandAccountSettings from "../brand-account-settings/page";
import BrandProfilePage from "../brand-profile-page/page";
import BrandSocialLinks from "../brand-socials-links/page";

const BrandProfileManagemennt = () => {

    const [selectedTab, setSelectedTab] = useState('Profile');
    
    const tabs = [
        { label: 'Profile', value: 'Profile' },
        { label: 'Account Settings', value: 'Account Settings' },
        { label: 'Social Media', value: 'Social Media'}
        
    ];

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    return (
        <div className="container mx-auto p-4">
            <NavTab tabs={tabs} onTabChange={handleTabChange} initialTab="Profile" />

            <div className="mt-4">
                {selectedTab === "Profile" &&
                    <BrandProfilePage />
                }
                {selectedTab === "Account Settings" &&
                   <BrandAccountSettings />
                }
                {selectedTab === "Social Media" && 
                    <BrandSocialLinks />
                }
            </div>
        </div>
    );
}

export default BrandProfileManagemennt;