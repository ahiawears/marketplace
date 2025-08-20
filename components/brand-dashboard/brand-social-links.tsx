'use client';

import { updateBrandContactDetails } from "@/actions/edit-brand-details/update-brand-contact-details";
import LoadContent from "@/app/load-content/page";
import ErrorModal from "@/components/modals/error-modal";
import SuccessModal from "@/components/modals/success-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandOnboarding } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from "sonner";
import validator from 'validator';

interface BrandSocialLinks {
    brand_contact_details: {
        brand_email: string;
        phone_number: string;
    };
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    website: string;
}

interface BrandSocialLinksProps {
    userId: string;
    data: BrandSocialLinks;
}

interface SocialLinksErrors {
    business_email?: string;
    phone_number?: string;
    social_media?: {
        website?: string;
        instagram?: string;
        twitter?: string;
        facebook?: string;
        tiktok?: string;
    };
}

const BrandSocialLinks: React.FC<BrandSocialLinksProps> = ({ userId, data }) => {
    const [socialData, setSocialData] = useState<BrandSocialLinks>(data);
    const [socialErrors, setSocialErrors] = useState<SocialLinksErrors>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
    
    useEffect(() => {
        setSocialData(data);
        setIsFormDirty(false); 
    }, [data]);

    useEffect(() => {
        const errors: SocialLinksErrors = {};
        const { brand_contact_details, facebook, instagram, twitter, tiktok, website } = socialData;

        if (!brand_contact_details.brand_email || !validator.isEmail(brand_contact_details.brand_email)) {
            errors.business_email = "Please enter a valid email address.";
        }

        if (!brand_contact_details.phone_number || !isValidPhoneNumber(brand_contact_details.phone_number)) {
            errors.phone_number = "Please enter a valid phone number.";
        }

        const socialMediaErrors: { [key: string]: string } = {};

        const websiteRegex = website && website.length > 8 ? /^https:\/\/.*/.test(website) : true;
        
        if (website && !websiteRegex) {
             if (!errors.social_media) {
                 errors.social_media = {};
             }
             errors.social_media.website = "Invalid website URL. Must start with 'https://' and have more characters.";
        }


        if (instagram && !/^https:\/\/instagram\.com\/.*/.test(instagram)) {
            if (!errors.social_media) {
                errors.social_media = {};
            }
            errors.social_media.instagram = "Invalid Instagram URL.";
        }
        if (twitter && !/^https:\/\/x\.com\/.*/.test(twitter)) {
            if (!errors.social_media) {
                errors.social_media = {};
            }
            errors.social_media.twitter = "Invalid X (formerly Twitter) URL.";
        }
        if (facebook && !/^https:\/\/facebook\.com\/.*/.test(facebook)) {
            if (!errors.social_media) {
                errors.social_media = {};
            }
            errors.social_media.facebook = "Invalid Facebook URL.";
        }
        if (tiktok && !/^https:\/\/tiktok\.com\/.*/.test(tiktok)) {
            if (!errors.social_media) {
                errors.social_media = {};
            }
            errors.social_media.tiktok = "Invalid TikTok URL.";
        }

        setSocialErrors(errors);
        
        const isDifferent = JSON.stringify(data) !== JSON.stringify(socialData);
        setIsFormDirty(isDifferent);
    }, [socialData, data]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSocialData(prev => ({
            ...prev,
            brand_contact_details: {
                ...prev.brand_contact_details,
                brand_email: value,
            },
        }));
    };

    const handlePhoneChange = (value: string | undefined) => {
        setSocialData(prev => ({
            ...prev,
            brand_contact_details: {
                ...prev.brand_contact_details,
                phone_number: value || "",
            },
        }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSocialData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const dataToUpload: BrandOnboarding["contactInformation"] = {
            business_email: socialData.brand_contact_details.brand_email,
            phone_number: socialData.brand_contact_details.phone_number,
            social_media: {
                website: socialData.website,
                facebook: socialData.facebook,
                instagram: socialData.instagram,
                twitter: socialData.twitter,
                tiktok: socialData.tiktok
            }
        }

        if (Object.keys(socialErrors).length > 0) {
            setErrorMessage("Please fix the errors in the form before submitting.");
            toast.error("Please fix the errors in the form before submitting.");
            return;
        }

        try {
            setLoading(true);
            const response = await updateBrandContactDetails(dataToUpload, userId, "brandSocialLinks");
            if (response.success) {
                toast.success("Contact details has been updated successfully.");
                setIsFormDirty(false); 
            }
        } catch (error) {
            console.error("Error updating contact details:", error);
            setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred.");
            toast.error("Error updating contact details. Please try again.")
        } finally {
            setLoading(false);
        }
    };

    const hasAnyErrors = Object.keys(socialErrors).length > 0;
    const saveDisabled = !isFormDirty || hasAnyErrors;

    return (
        <div className="border-2">
            <form onSubmit={handleSubmit} className="mx-auto p-10 sm:p-4 shadow-2xl">
                {/* Brand Email */}
                <div className="my-5 space-y-1">
                    <label htmlFor="business_email">Brand Email:*</label>
                    <div className="w-full">
                        <Input
                            id="business_email"
                            type="email"
                            name="brand_email"
                            className="border-2"
                            value={socialData.brand_contact_details.brand_email}
                            onChange={handleEmailChange}
                            placeholder="email@example.com"
                        />
                        {socialErrors.business_email && (
                            <p className="py-2 text-red-500">
                                {socialErrors.business_email}
                            </p>
                        )}
                    </div>
                </div>

                {/* Brand Phone Number */}
                <div className="my-5 space-y-1">
                    <label htmlFor="phone_number">Brand Phone Number:*</label>
                    <div className="w-full">
                        <PhoneInput
                            international
                            defaultCountry="NG"
                            value={socialData.brand_contact_details.phone_number}
                            onChange={handlePhoneChange}
                            className={cn(
                                "w-full",
                                "flex h-12 rounded-md border-2 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                            placeholder="Enter phone number"
                        />
                        {socialErrors.phone_number && (
                            <p className="py-2 text-red-500">
                                {socialErrors.phone_number}
                            </p>
                        )}
                    </div>
                </div>

                {/* Social Media Links */}
                {/* Website Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="website">Website Link:</label>
                    <div className="w-full">
                        <Input
                            id="website"
                            type="text"
                            name="website"
                            className="border-2"
                            value={socialData.website}
                            onChange={handleSocialChange}
                            placeholder="https://your-website.com"
                        />
                        {socialErrors.social_media?.website && (
                            <p className="py-2 text-red-500">
                                {socialErrors.social_media.website}
                            </p>
                        )}
                    </div>
                </div>

                {/* Instagram Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="instagram">Instagram Link:</label>
                    <div className="w-full">
                        <Input
                            id="instagram"
                            type="url"
                            name="instagram"
                            className="border-2"
                            value={socialData.instagram}
                            onChange={handleSocialChange}
                            placeholder="https://instagram.com/your_username"
                        />
                        {socialErrors.social_media?.instagram && (
                            <p className="py-2 text-red-500">
                                {socialErrors.social_media.instagram}
                            </p>
                        )}
                    </div>
                </div>

                {/* Twitter Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="twitter">X (formerly Twitter) Link:</label>
                    <div className="w-full">
                        <Input
                            id="twitter"
                            type="url"
                            name="twitter"
                            className="border-2"
                            value={socialData.twitter}
                            onChange={handleSocialChange}
                            placeholder="https://x.com/your_username"
                        />
                        {socialErrors.social_media?.twitter && (
                            <p className="py-2 text-red-500">
                                {socialErrors.social_media.twitter}
                            </p>
                        )}
                    </div>
                </div>

                {/* Facebook Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="facebook">Facebook Link:</label>
                    <div className="w-full">
                        <Input
                            id="facebook"
                            type="url"
                            name="facebook"
                            className="border-2"
                            value={socialData.facebook}
                            onChange={handleSocialChange}
                            placeholder="https://facebook.com/your_username"
                        />
                        {socialErrors.social_media?.facebook && (
                            <p className="py-2 text-red-500">
                                {socialErrors.social_media.facebook}
                            </p>
                        )}
                    </div>
                </div>

                {/* TikTok Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="tiktok">TikTok Link:</label>
                    <div className="w-full">
                        <Input
                            id="tiktok"
                            type="url"
                            name="tiktok"
                            className="border-2"
                            value={socialData.tiktok}
                            onChange={handleSocialChange}
                            placeholder="https://tiktok.com/your_username"
                        />
                        {socialErrors.social_media?.tiktok && (
                            <p className="py-2 text-red-500">
                                {socialErrors.social_media.tiktok}
                            </p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 my-5">
                    <Button 
                        type="submit" 
                        disabled={saveDisabled || loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
            
            <style jsx global>{`
                .react-phone-number-input__country {
                    @apply h-12 border border-input rounded-md;
                }
                .react-phone-number-input__country-select {
                    @apply h-full;
                }
                .react-phone-number-input__input {
                    outline: none;
                    @apply ring-0;
                }
            `}</style>
        </div>
    );
};

export default BrandSocialLinks;