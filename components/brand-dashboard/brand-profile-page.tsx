"use client";

import { FC, useState } from "react";
import { EditBrandProfileHero } from "./edit-brand-profile-hero";
import { EditBrandLogo } from "./edit-brand-logo";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { UploadBrandBanner } from "@/actions/edit-brand-details/upload-brand-banner";
import { UploadBrandLogo } from "@/actions/edit-brand-details/upload-brand-logo";
import { toast } from "sonner";

interface BrandProfileData {
    name: string;
    description: string;
    banner: string;
    logo: string;
}

interface BrandProfileProps {
    userId: string;
    data: BrandProfileData;
}

const dataURLtoBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return blob;
};

const BrandProfile: FC<BrandProfileProps> = ({ userId, data }) => {
    const [bannerImage, setBannerImage] = useState(data.banner);
    const [logoImage, setLogoImage] = useState(data.logo);
    const [isBannerChanged, setIsBannerChanged] = useState<boolean>(false);
    const [isLogoChanged, setIsLogoChanged] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = [];

            if (isBannerChanged) {
                const bannerBlob = await dataURLtoBlob(bannerImage);
                promises.push(UploadBrandBanner(userId, bannerBlob));
            }

            if (isLogoChanged) {
                const logoBlob = await dataURLtoBlob(logoImage);
                promises.push(UploadBrandLogo(userId, logoBlob));
            }

            const results = await Promise.all(promises);

            let allSuccessful = true;
            results.forEach(res => {
                if (!res.success) {
                    allSuccessful = false;
                    toast.error(res.message);
                }
            });

            if (allSuccessful) {
                toast.success("Brand profile updated successfully!");
                // Reset states on success
                setIsBannerChanged(false);
                setIsLogoChanged(false);
            } else {
                // Revert to original state on failure
                setBannerImage(data.banner);
                setLogoImage(data.logo);
                setIsBannerChanged(false);
                setIsLogoChanged(false);
            }

        } catch (error) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            // Revert to original state on unexpected error
            setBannerImage(data.banner);
            setLogoImage(data.logo);
            setIsBannerChanged(false);
            setIsLogoChanged(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setBannerImage(data.banner);
        setLogoImage(data.logo);
        setIsBannerChanged(false);
        setIsLogoChanged(false);
    };

    return (
        <div>
            <div className="relative w-full mb-20">
                {/* Pass the state variable, not the original prop */}
                <EditBrandProfileHero
                    data={bannerImage}
                    onImageChange={(newImage: string) => {
                        setBannerImage(newImage);
                        setIsBannerChanged(true);
                    }}
                />
                <div className="absolute -bottom-16 left-4">
                    {/* Pass the state variable, not the original prop */}
                    <EditBrandLogo
                        data={logoImage}
                        onImageChange={(newImage: string) => {
                            setLogoImage(newImage);
                            setIsLogoChanged(true);
                        }}
                    />
                </div>
            </div>
            {/* Form Fields */}
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
                        value={data.name}
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
                        value={data.description}
                        readOnly
                    />
                </div>
            </div>

            {/* Centralized Save/Cancel Buttons */}
            {(isBannerChanged || isLogoChanged) && (
                <div className="my-4 flex flex-col space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0 items-center justify-end">
                    <Button
                        className="w-full lg:w-auto bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-full lg:w-auto bg-black hover:bg-gray-800 text-white"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default BrandProfile;
