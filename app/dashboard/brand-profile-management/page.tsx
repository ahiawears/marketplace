"use client";

import NavTab from "@/components/navtab";
import { useState } from "react";
import BrandAccountSettings from "../brand-account-settings/page";
import { BrandProfilePage} from "../brand-profile-page/page";
import BrandSocialLinks from "../brand-socials-links/page";
import LoadContent from "@/app/load-content/page";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import ErrorModal from "@/components/modals/error-modal";

const BrandProfileManagemennt = () => {
    const [errorMessage, setErrorMessage] = useState("");

    const [selectedTab, setSelectedTab] = useState('Profile');
    
    
    const tabs = [
        { label: 'Profile', value: 'Profile' },
        { label: 'Account Settings', value: 'Account Settings' },
        { label: 'Social Media', value: 'Social Media'}
        
    ];

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    const { userId, userSession, loading, error, resetError } = useAuth();
    
    if (loading) {
        return <LoadContent />
    }

    if (error) {
        console.log(error);
        setErrorMessage(error.message || "Something went wrong, please try again.");
    }

    if (!userId) {
        redirect("/login-brand");
    }

    return (
        <>
            {errorMessage && (
                <>
                    <ErrorModal
                        message={errorMessage}
                        onClose={() => {
                            setErrorMessage("");
                        }}
                    />
                </>
            )}
            <div className="container mx-auto p-4">
                <NavTab tabs={tabs} onTabChange={handleTabChange} initialTab="Profile" />

                <div className="mt-4">
                    {selectedTab === "Profile" &&
                        <BrandProfilePage userId={userId} accessToken={userSession.access_token}/>
                    }
                    {selectedTab === "Account Settings" &&
                        <BrandAccountSettings />
                    }
                    {selectedTab === "Social Media" && 
                        <BrandSocialLinks />
                    }
                </div>
            </div>
        </>
       
    );
}

export default BrandProfileManagemennt;