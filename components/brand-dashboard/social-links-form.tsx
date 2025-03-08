"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { createClient } from "@/supabase/client";

export const SocialLinksForm = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); 
    const [socialLoading, setSocialLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);


    const [formData, setFormData] = useState({
        brandId: userId,
        website: "https://",
        instagram: "https://instagram.com/",
        twitter: "https://x.com/",
        facebook: "https://facebook.com/"
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await createClient().auth.getUser();
                if(error){
                    console.error("Error fetching user:", error);
                    throw new Error(`Error fetching user: ${error.message}, cause: ${error.cause}`)
                } else if(!user) {
                    console.error("No user found");
                    throw new Error("No user found");
                } else {
                    setUserId(user.id);
                }
                const { data: { session }, error: sessionError } = await createClient().auth.getSession();

                if (sessionError) {
                    throw new Error("Failed to get session.");
                }
        
                if (!session) {
                    throw new Error("User is not authenticated.");
                }

                const token = session.access_token;
                setAccessToken(token);
            } catch (error: any) {
                console.error("An error occured while fetching the user: ", error);
                throw new Error(`Error fetching user: ${error.message}, cause: ${error.cause}`);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if(userId && accessToken){
            async function fetchSocialLinks()  {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-social-links?userId=${userId}`,
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${accessToken}`,
                            },
                        }
                    )

                    if (!res.ok) {
                        throw new Error(`Failed to get Social Links`);
                    }

                    const data = await res.json();
                    console.log("The brands social links are: ", data);
                    if (data.success) {
                        setFormData((prev) => ({
                            ...prev,
                            website: data.data.website || "https://",
                            instagram: data.data.instagram || "https://instagram.com/",
                            twitter: data.data.twitter || "https://x.com/",
                            facebook: data.data.facebook || "https://facebook.com/",
                        }));
                    } else {
                        console.error(`Error fetching social links details: ${data.error}`);
                        throw new Error(`Error fetching social links details: ${data.error}, ${data.message}`);
                    }
                } catch(error: any) {
                    console.error("Error fetching social links details:", error);
                    throw new Error(`Error fetching social links details. ${error}, ${error.message}`);
                } finally {
                    setSocialLoading(false);
                }
            }
            fetchSocialLinks();
        }
    }, [userId, accessToken]);

    if (loading) {
        return <div>Loading...</div>; // Display a loading state
    }

    if (socialLoading) {
        return <div>Loading...</div>;
    }

    if (!userId) {
        return <div>User not authenticated.</div>; // Handle unauthenticated users
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const preparedData = {
        brand_id: userId,  // Replace this with the logged-in brand's ID
        website: formData.website || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        facebook: formData.facebook || null
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        // Ensure URLs match the expected format
        if (
            (formData.website && !/^https:\/\/.*/.test(formData.website)) ||
            (formData.instagram && !/^https:\/\/instagram\.com\/.*/.test(formData.instagram)) ||
            (formData.twitter && !/^https:\/\/x\.com\/.*/.test(formData.twitter)) ||
            (formData.facebook && !/^https:\/\/facebook\.com\/.*/.test(formData.facebook))
        ) {
            alert("Please enter valid URLs.");
            return;
        }

        console.log("Submitted Data:", formData);
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/update-Social-Links`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(preparedData),
            });
        if (!res.ok) {
            throw new Error("Failed to submit social media links. Response error");
        }

        const data = await res.json();
        console.log("Response Data:", data);

    }
    return (
        <form onSubmit={handleSubmit} className="mx-auto py-10 sm:py-10 shadow-2xl border-2">
            <div className="max-w-7xl px-6 lg:px-6">
                <h2 className="font-mabry-pro text-2xl">Social Links</h2>

                {/* Website Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="website">Website Link:</label>
                    <div className="md:w-3/4 w-full lg:w-3/4">
                        <Input
                            id="website"
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://your-website.com"
                        />
                    </div>
                </div>

                {/* Instagram Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="instagram">Instagram Link:</label>
                    <div className="md:w-3/4 w-full lg:w-3/4">
                        <Input
                            id="instagram"
                            type="url"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            placeholder="https://instagram.com/username"
                        />
                    </div>
                </div>

                {/* Twitter Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="twitter">X (formely Twitter) Link:</label>
                    <div className="md:w-3/4 w-full lg:w-3/4">
                        <Input
                            id="twitter"
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            placeholder="https://x.com/username"
                        />
                    </div>
                </div>

                {/* Facebook Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="facebook">Facebook Link:</label>
                    <div className="md:w-3/4 w-full lg:w-3/4">
                        <Input
                            id="facebook"
                            type="url"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            placeholder="https://facebook.com/username"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 my-5">
                    <Button type="button" className="bg-gray-300 text-black hover:bg-gray-400">
                        Cancel
                    </Button>
                    <Button type="submit">
                        Save
                    </Button>
                </div>
            </div>
        </form>
    );
};
