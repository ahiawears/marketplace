"use client";

import NavTab from "@/components/navtab";
import { useState } from "react";
import ErrorModal from "@/components/modals/error-modal";
import BrandProfile from "@/components/brand-dashboard/brand-profile-page";

interface BrandProfileClientProps {
    userId: string;
    brandData: {
        name: string;
        description: string;
        banner: string;
        logo: string;
    }
}

const BrandProfileClient = ({ userId, brandData }: BrandProfileClientProps) => {
    const [selectedTab, setSelectedTab] = useState('Profile');
    const [errorMessage, setErrorMessage] = useState("");

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
                            <>
                                hahshshh
                            </>
                            // <BrandAccountSettings userId={userId} />
                        }
                        {selectedTab === "Contact Details" && 
                            <>
                                brrrrrrrrr
                            </>
                            // <BrandSocialLinks userId={userId} />
                        }
                    </div>
                    
                </div>
            </div>
        </>
    )
}

export default BrandProfileClient;
