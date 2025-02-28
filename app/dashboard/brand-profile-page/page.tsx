"use client";

import { createClient} from "@/supabase/client";
import { BrandDescriptionField } from "@/components/brand-dashboard/brand-description-field";
import { EditBrandLogo } from "@/components/brand-dashboard/edit-brand-logo";
import { EditBrandProfileHero } from "@/components/brand-dashboard/edit-brand-profile-hero";
import { SocialLinksForm } from "@/components/brand-dashboard/social-links-form";
import { useEffect, useState } from "react";

export default function BrandProfilePage () {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); 
    const [userSession, setUserSession] = useState<any>({});


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await createClient().auth.getUser();

                if (error) {

                    console.error("Error fetching user:", error);
                    throw new Error(`Error fetching user: ${error.message}, cause: ${error.cause}`)
                } else if (!user) {
                    console.log("User not found");
                    throw new Error("User not found");
                } else {
                    setUserId(user.id);
                    console.log("The user id is: ", user.id);
                }

                const { data: {session}, error: sessionError } = await createClient().auth.getSession();
                if (sessionError) {
                    console.error("Error fetching user:", sessionError);
                    throw new Error(`Error fetching user: ${sessionError.message}, cause: ${sessionError.cause}`);
                }

                setUserSession(session);
                console.log("The user session is: ", session);
            } catch (error: any) {
                console.error("An error occurred while fetching the user:", error);
                throw new Error(`An error occurred while fetching the user: ${error.message}, cause: ${error.cause}`)
            } finally {
                setLoading(false);
            }
        };
    
        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Display a loading state
    }

    if (!userId) {
        return <div>User not authenticated.</div>; // Handle unauthenticated users
    }


    return (
        <div className="flex flex-1 flex-col space-y-10">
            {/* Brand Logo Section */}
            <div className="w-full">
                <EditBrandLogo userId={userId} userSession={userSession}/>
            </div>

            {/* Brand Profile Hero */}
            <EditBrandProfileHero />

            {/* Brand Social Links */}
            <SocialLinksForm />

            {/* Brand Description */}
            <BrandDescriptionField />
        </div>
    );
}

// TODO:
// Hero Image:
// Brands should be able to add an hero image and a text which its position could be set
