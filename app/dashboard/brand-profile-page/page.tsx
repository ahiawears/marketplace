"use client";

import { createClient} from "@/supabase/client";
import { BrandDescriptionField } from "@/components/brand-dashboard/brand-description-field";
import { EditBrandLogo } from "@/components/brand-dashboard/edit-brand-logo";
import { EditBrandProfileHero } from "@/components/brand-dashboard/edit-brand-profile-hero";
import { SocialLinksForm } from "@/components/brand-dashboard/social-links-form";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";


interface BrandProfilePageProps {
    userId: string;
    accessToken: string;
}

export const BrandProfilePage: React.FC<BrandProfilePageProps> = ({ userId, accessToken }) => {

    return (
        <div className="flex flex-1 flex-col">

            {/* Brand Profile Hero */}
            {/* <EditBrandProfileHero /> */}

            
            {/* Brand Logo Section */}
            {/* <div className="w-full">
                <EditBrandLogo userId={userId} userSession={userSession}/>
            </div> */}

            {/* Brand Description */}
            {/* <BrandDescriptionField /> */}

           {/* Brand Profile Hero */}
           <div className="relative w-full">
                <EditBrandProfileHero userId={userId} accessToken={accessToken}/>
                <div className="absolute bottom-4 left-4">
                    <EditBrandLogo userId={userId} accessToken={accessToken}/>
                </div>
            </div>
            
        </div>
    );
}

// TODO:
// Hero Image:
// Brands should be able to add an hero image and a text which its position could be set
