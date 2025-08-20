"use client";

import NavTab from "@/components/navtab";
import { useState } from "react";
import ErrorModal from "@/components/modals/error-modal";
import BrandProfile from "@/components/brand-dashboard/brand-profile-page";
import { BrandAccountSettings } from "./brand-account-settings";
import BrandSocialLinks from "./brand-social-links";

interface BrandProfileClientProps {
    userId: string;
    brandData: {
        name: string;
        description: string;
        banner: string;
        logo: string;
    }
    socialLinks: {
        brand_contact_details: {
            brand_email: string;
            phone_number: string;
        }
        facebook: string;
        instagram: string;
        twitter: string;
        tiktok: string;
        website: string;
    }
}

const BrandProfileClient = ({ userId, brandData, socialLinks }: BrandProfileClientProps) => {
    const [selectedTab, setSelectedTab] = useState('Profile');

    const tabs = [
        { label: 'Profile', value: 'Profile' },
        { label: 'Account Settings', value: 'Account Settings' },
        { label: 'Contact Details', value: 'Contact Details'}
    ];

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };
    return (
        <>
            <div className="container mx-auto p-4">
                <NavTab tabs={tabs} onTabChange={handleTabChange} initialTab="Profile" />

                <div className="mt-4 border-2">
                    <div className="p-4">
                        {selectedTab === "Profile" &&
                            <BrandProfile userId={userId} data={brandData}/>
                        }
                        {selectedTab === "Account Settings" &&

                            <BrandAccountSettings userId={userId} />
                        }
                        {selectedTab === "Contact Details" && 
                            <BrandSocialLinks userId={userId} data={socialLinks}/>
                        }
                    </div>
                    
                </div>
            </div>
        </>
    )
}

export default BrandProfileClient;
