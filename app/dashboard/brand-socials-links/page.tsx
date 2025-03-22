import LoadContent from "@/app/load-content/page";
import ErrorModal from "@/components/modals/error-modal";
import SuccessModal from "@/components/modals/success-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import validator from 'validator';

type BrandContactDetails = {
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

interface BrandSocialLinksProps {
    userId: string;
    accessToken: string;
}

interface ContactErrors {
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

export const BrandSocialLinks: React.FC<BrandSocialLinksProps> = ({ userId, accessToken}) => {
    const [contactErrors, setContactErrors] = useState<ContactErrors>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [saveDisabled, setSaveDisabled] = useState<boolean>(true);
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>("");
    const [businessEmail, setBusinessEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    

    const [formData, setFormData] = useState<BrandContactDetails>({
        brand_contact_details: {
            brand_email: "",
            phone_number: "",
        },
        facebook: "",
        instagram: "",
        tiktok: "",
        twitter: "",
        website: "",
    });


    useEffect(() => {
        if (userId && accessToken) {
            async function fetchContactDetails() {
                setLoading(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-social-links?userId=${userId}`,
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${accessToken}`,
                            }
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
                            facebook: data.data.facebook,
                            instagram: data.data.instagram,
                            tiktok: data.data.tiktok,
                            twitter: data.data.twitter,
                            website: data.data.website,
                            brand_contact_details: {
                                brand_email: data.data.brand_contact_details.brand_email,
                                phone_number: data.data.brand_contact_details.phone_number,
                            }
                        }))
                        setPhoneNumber(data.data.brand_contact_details.phone_number || "");
                    }
                } catch (error) {
                    console.error("Error fetching Contact details:", error);
                    setErrorMessage(`Error fetching Contact details. ${error}`);
                } finally{
                    setLoading(false);
                }
            }

            fetchContactDetails();
        }
    }, [userId, accessToken]);

    

    useEffect(() => {
        if (formData) {
            setContactDetails({
                ...contactDetails,
                business_email: formData.brand_contact_details.brand_email,
                phone_number: formData.brand_contact_details.phone_number,
                social_media: {
                    website: formData.website,
                    instagram: formData.instagram,
                    twitter: formData.twitter,
                    facebook: formData.facebook,
                    tiktok: formData.tiktok,
                }
            })
            setPhoneNumber(formData.brand_contact_details.phone_number);
            setBusinessEmail(formData.brand_contact_details.brand_email);
        
        }
    }, [formData])

    const [contactDetails, setContactDetails] = useState<{
        business_email: string;
        phone_number: string;
        social_media: {
            website: string;
            instagram: string;
            twitter: string;
            facebook: string;
            tiktok: string;
        }
    }>({
        business_email: formData.brand_contact_details.brand_email,
        phone_number: formData.brand_contact_details.phone_number,
        social_media: {
            website: formData.website,
            instagram: formData.instagram,
            twitter: formData.twitter,
            facebook: formData.facebook,
            tiktok: formData.tiktok,
        }
    });

    const setMobileNumber = (value: string | undefined) => {
        setPhoneNumber(value);
        setFormData({
            ...formData,
            brand_contact_details: {
                ...formData.brand_contact_details,
                phone_number: value || ""
            }
        })
    };

    const handleBusinessEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusinessEmail(e.target.value);
        setFormData({
            ...formData,
            brand_contact_details: {
                ...formData.brand_contact_details,
                brand_email: e.target.value
            }
        })
    };

    const handleContactDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        
    }

    useEffect(() => {
        const dataErrors: ContactErrors = {};
         // General Website URL Regex
         const websiteRegex = /^https:\/\/.*/.test(formData.website);
         // Instagram URL Regex
         const instagramRegex = /^https:\/\/instagram\.com\/.*/.test(formData.instagram);
         // Twitter (X) URL Regex
         const twitterRegex = /^https:\/\/x\.com\/.*/.test(formData.twitter);
         // Facebook URL Regex
         const facebookRegex = /^https:\/\/facebook\.com\/.*/.test(formData.facebook);
         // TikTok URL Regex
         const tiktokRegex = /^https:\/\/tiktok\.com\/.*/.test(formData.tiktok);

        if (formData.website && !websiteRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.website = "Invalid website URL";
        }

        if (formData.instagram && !instagramRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.instagram = "Invalid Instagram URL";
        }

        if (formData.facebook && !facebookRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.facebook = "Invalid Facebook URL";
        }

        if (formData.twitter && !twitterRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.twitter = "Invalid X(Formerly Twitter) URL";
        }

        if (formData.tiktok && !tiktokRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            } 
            dataErrors.social_media.tiktok = "Invalid TikTok URL";
        }

        if (formData.brand_contact_details.brand_email === "" || !validator.isEmail(formData.brand_contact_details.brand_email)) {
            
            if(formData.brand_contact_details.brand_email === "") {
                dataErrors.business_email = "Please enter a valid email address";
            } 
            if (!validator.isEmail(formData.brand_contact_details.brand_email)) {
                dataErrors.business_email = "Invalid email address";
            }
        }

        if (formData.brand_contact_details.phone_number === "" || !isValidPhoneNumber(formData.brand_contact_details.phone_number)) {
            dataErrors.phone_number = "Invalid phone number";

            if(formData.brand_contact_details.phone_number === "") {
                dataErrors.phone_number = "Please enter a valid phone number";
            }

            if (!isValidPhoneNumber(formData.brand_contact_details.phone_number)) {
                dataErrors.phone_number = "Invalid Phone Number";
            }
        }

        
        setContactErrors(dataErrors);
        const hasSocialMediaErrors = dataErrors.social_media
        ? Object.keys(dataErrors.social_media).length > 0
        : false;

        setSaveDisabled(Object.keys(dataErrors).length > 0 || hasSocialMediaErrors);
    }, [formData, businessEmail, phoneNumber]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/update-Social-Links`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(contactDetails),
                });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData || "Failed to submit contact details. Response error");
            }
    
            const data = await res.json();
            if(data.success) {
                setSuccessMessage(data.message);
            }
        } catch (error) {
            console.error("Error fetching Contact details:", error);
            setErrorMessage(`Error updating contact details. ${error}`)
        } finally{
            setLoading(false);
        }
    }

    if (loading) {
        return <LoadContent />
    }


    return (
        <div className="border-2">
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

            {successMessage && (
                <>
                    <SuccessModal
                        successMessage={successMessage}
                        onCancel={() => {
                            setSuccessMessage("");
                            return;
                        }}
                    />
                </>
            )}

            <form onSubmit={handleSubmit} className="mx-auto p-10 sm:p-4 shadow-2xl">
                {/* Business Emaiil */}
                <div className="my-5 space-y-1">
                    <label htmlFor="business_email">Brand Email:*</label>
                    <div className="w-full">
                        <Input
                            id="business_email"
                            type="email"
                            name="business_email"
                            className="border-2"
                            value={formData.brand_contact_details.brand_email}
                            onChange={handleBusinessEmailChange}
                            placeholder="email@example.com"
                        />
                        {contactErrors.business_email && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.business_email}
                            </p>
                        )}
                    </div>
                </div>

                {/* Business Phone Number */}
                <div className="my-5 space-y-1">
                    <label htmlFor="business_phone">Brand Phone Number:*</label>
                    <div className="w-full">
                        <PhoneInput
                            international
                            defaultCountry="NG"
                            value={formData.brand_contact_details.phone_number}
                            onChange={setMobileNumber}
                            className={cn(
                                "w-full",
                                "flex h-12 rounded-md border-2  bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            )}                            
                            placeholder="Enter phone number"
                        />
                        {contactErrors.phone_number && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.phone_number}
                            </p>
                        )}
                    </div>
                </div>

                {/* Website Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="website">Website Link:</label>
                    <div className=" w-full ">
                        <Input
                            id="website"
                            name="website"
                            className="border-2"
                            value={formData.website}
                            onChange={handleContactDetailsChange}
                            required={false}
                            placeholder="https://your-website.com"
                        />

                        {contactErrors.social_media?.website && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.social_media.website}
                            </p>
                        )}
                    </div>
                </div>

                {/* Instagram Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="instagram">Instagram Link:</label>
                    <div className=" w-full ">
                        <Input
                            id="instagram"
                            type="url"
                            name="instagram"
                            className="border-2"
                            value={formData.instagram}
                            onChange={handleContactDetailsChange}
                            placeholder="https://instagram.com/your_username"
                        />
                        {contactErrors.social_media?.instagram && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.social_media.instagram}
                            </p>
                        )}
                    </div>
                </div>

                {/* Twitter  Link */}
                <div className="my-5 space-y-1">
                    <label htmlFor="twitter">X (formerly Twitter) Link:</label>
                    <div className=" w-full ">
                        <Input
                            id="twitter"
                            type="url"
                            name="twitter"
                            className="border-2"
                            value={formData.twitter}
                            onChange={handleContactDetailsChange}
                            placeholder="https://x.com/your_username"
                        />
                        {contactErrors.social_media?.twitter && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.social_media.twitter}
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
                            value={formData.facebook}
                            onChange={handleContactDetailsChange}
                            placeholder="https://facebook.com/your_username"
                        />
                        {contactErrors.social_media?.facebook && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.social_media.facebook}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tiktok Link */}
                <div>
                    <label htmlFor="tiktok">TikTok Link:</label>
                    <div className="w-full">
                        <Input
                            id="tiktok"
                            type="url"
                            name="tiktok"
                            className="border-2"
                            value={contactDetails.social_media.tiktok}
                            onChange={handleContactDetailsChange}
                            placeholder="https://tiktok.com/your_username"
                        />
                        {contactErrors.social_media?.tiktok && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.social_media.tiktok}
                            </p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 my-5">
                    <Button
                        type="submit"
                        disabled={saveDisabled}
                    >
                        Save
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
    )
}