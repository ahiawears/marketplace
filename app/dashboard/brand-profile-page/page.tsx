"use client";

import { EditBrandLogo } from "@/components/brand-dashboard/edit-brand-logo";
import { EditBrandProfileHero } from "@/components/brand-dashboard/edit-brand-profile-hero";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LoadContent from "@/app/load-content/page";


interface BrandProfilePageProps {
    userId: string;
    accessToken: string;
}

export const BrandProfilePage: React.FC<BrandProfilePageProps> = ({ userId, accessToken }) => {
    const [loading, setLoading] = useState(true);
    const [brandName, setBrandName] = useState("");
    const [brandDescription, setBrandDescription] = useState("");

    useEffect(() => {
        if (userId && accessToken) {
            async function fetchUserData() {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-name-description?userId=${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            }
                        }
                    )
                    if (!res.ok) {
                        throw new Error("Couldnt create a connection with the server");
                    }
                    const data = await res.json();

                    if(!data.data) {
                        throw new Error ("No data found for the user. Please try again.")
                    }

                    const name = data.data.name;
                    const description = data.data.description;

                    console.log(name, description);

                    setBrandName(name);
                    setBrandDescription(description);
                    
                } catch (error) {
                    console.error("Error getting brand data:", error);
                    throw error;
                } finally {
                    setLoading(false);
                }
            }
            fetchUserData();
        }
    }, [userId, accessToken]);

    if (loading) {
        return <LoadContent />; 
    }

    return (
        <div>

            {/* Brand Profile Hero */}
            {/* <EditBrandProfileHero /> */}

            
            {/* Brand Logo Section */}
            {/* <div className="w-full">
                <EditBrandLogo userId={userId} userSession={userSession}/>
            </div> */}

            {/* Brand Description */}
            {/* <BrandDescriptionField /> */}

           {/* Brand Profile Hero */}
           <div className="relative w-full mb-16">
                <EditBrandProfileHero userId={userId} accessToken={accessToken}/>
                <div className="absolute bottom-4 left-4">
                    <EditBrandLogo userId={userId} accessToken={accessToken}/>
                </div>
            </div>

            <div className="my-4 relative">
                <div className="space-y-2 my-4">
                    <label htmlFor="brand_name" className="block text-sm font-bold text-gray-900">
                        Brand Name:*
                    </label>
                    <Input 
                        name="brand_name"
                        placeholder="Brand Name"
                        className="border-2"
                        type="text"
                        disabled
                        value={brandName}
                    />
                </div>
                <div className="space-y-2 my-4">
                    <label htmlFor="brand_description" className="block text-sm font-bold text-gray-900">
                        Brand Description:*
                    </label>
                    <Textarea 
                        name="brand_description"
                        placeholder="Describe your brand's story, mission and unique offerings"
                        className="border-2 min-h-[100px]"
                        value={brandDescription}
                        readOnly
                    />
                </div>
            </div>
            
        </div>
    );
}
