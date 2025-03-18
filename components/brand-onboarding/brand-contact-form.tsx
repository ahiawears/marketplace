import { BrandOnboarding } from "@/lib/types";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from "@/lib/utils";
import ModalBackdrop from "../modals/modal-backdrop";
import ErrorModal from "../modals/error-modal";
import validator from 'validator';


type BrandContactData = BrandOnboarding['contactInformation'];

interface BrandContactProps {
    data: BrandContactData;
    onDataChange: (data: BrandContactData, isValid: boolean) => void;
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

const BrandContactForm = ({data, onDataChange}: BrandContactProps) => {
    const [contactErrors, setContactErrors] = useState<ContactErrors>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isValid, setIsValid] = useState(false);

    const [socialMediaData, setSocialMediaData] = useState({
        website: data.social_media.website || "https://",
        instagram: data.social_media.instagram || "https://instagram.com/",
        twitter: data.social_media.twitter || "https://x.com/",
        facebook: data.social_media.facebook || "https://facebook.com/",
        tiktok: data.social_media.tiktok || "https://tiktok.com/",
    });
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>(data.phone_number);
    const [businessEmail, setBusinessEmail] = useState<string>(data.business_email);

    useEffect(() => {
        const isValid = businessEmail.length > 0 && phoneNumber !== undefined && isValidPhoneNumber(phoneNumber) ;
        setIsValid(isValid);
        onDataChange({ business_email: businessEmail, phone_number: phoneNumber || "", social_media: socialMediaData }, isValid);
    }, [businessEmail, phoneNumber, socialMediaData]);


    useEffect(() => {

        const dataErrors: ContactErrors = {};
        // General Website URL Regex
        const websiteRegex = /^https:\/\/.*/.test(socialMediaData.website);
        // Instagram URL Regex
        const instagramRegex = /^https:\/\/instagram\.com\/.*/.test(socialMediaData.instagram);
        // Twitter (X) URL Regex
        const twitterRegex = /^https:\/\/x\.com\/.*/.test(socialMediaData.twitter);
        // Facebook URL Regex
        const facebookRegex = /^https:\/\/facebook\.com\/.*/.test(socialMediaData.facebook);
        // TikTok URL Regex
        const tiktokRegex = /^https:\/\/tiktok\.com\/.*/.test(socialMediaData.tiktok);


        if (socialMediaData.website && !websiteRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.website = "Invalid website URL";
        }

        if (socialMediaData.instagram && !instagramRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.instagram = "Invalid Instagram URL";
        }

        if (socialMediaData.facebook && !facebookRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.facebook = "Invalid Facebook URL";
        }

        if (socialMediaData.twitter && !twitterRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            }
            dataErrors.social_media.twitter = "Invalid Twitter URL";
        }

        if (socialMediaData.tiktok && !tiktokRegex) {
            if (!dataErrors.social_media) {
                dataErrors.social_media = {};
            } 

            dataErrors.social_media.tiktok = "Invalid TikTok URL";
        }
        if (!validator.isEmail(businessEmail)) {
            dataErrors.business_email = "Invalid email address";
        }

        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            dataErrors.phone_number = "Invalid phone number";
        }
        setContactErrors(dataErrors);
    }, [phoneNumber,  businessEmail, socialMediaData.facebook, socialMediaData.instagram, socialMediaData.twitter, socialMediaData.website, socialMediaData.tiktok]);



    const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSocialMediaData({ ...socialMediaData, [e.target.name]: e.target.value });
    };

    const handleBusinessEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusinessEmail(e.target.value);
    };

    const setMobileNumber = (value: string | undefined) => {
        setPhoneNumber(value);
    };

    return (
        <form className="mx-auto">
            {errorMessage && (
                <>
                    <ErrorModal
                        message={errorMessage}
                        onClose={() => {
                            setErrorMessage("");
                            //resetError();
                        }}
                    />
                </>
            )}
            <div>

                {/* Business Emaiil */}
                <div className="my-5 space-y-1">
                    <label htmlFor="business_email">Brand Email:*</label>
                    <div className="w-full">
                        <Input
                            id="business_email"
                            type="email"
                            name="business_email"
                            className="border-2"
                            value={businessEmail}
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
                            value={phoneNumber}
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
                            type="url"
                            name="website"
                            className="border-2"
                            value={socialMediaData.website}
                            onChange={handleSocialMediaChange}
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
                            value={socialMediaData.instagram}
                            onChange={handleSocialMediaChange}
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
                    <label htmlFor="twitter">X (formely Twitter) Link:</label>
                    <div className=" w-full ">
                        <Input
                            id="twitter"
                            type="url"
                            name="twitter"
                            className="border-2"
                            value={socialMediaData.twitter}
                            onChange={handleSocialMediaChange}
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
                            value={socialMediaData.facebook}
                            onChange={handleSocialMediaChange}
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
                            value={socialMediaData.tiktok}
                            onChange={handleSocialMediaChange}
                            placeholder="https://tiktok.com/your_username"
                        />
                        {contactErrors.social_media?.tiktok && (
                            <p className="py-2" style={{"color": "red"}}>
                                {contactErrors.social_media.tiktok}
                            </p>
                        )}
                    </div>
                </div>
            </div>
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
        </form>
    )
}

export default BrandContactForm;