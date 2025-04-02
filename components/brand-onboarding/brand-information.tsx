import { useState, useEffect, useRef, ChangeEvent } from "react";
import ModalBackdrop from "../modals/modal-backdrop";
import { BrandOnboarding } from '@/lib/types';
import ErrorModal from "../modals/error-modal";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { EditBrandLogo } from "../brand-dashboard/edit-brand-logo";
import { useAuth } from "@/hooks/useAuth";
import LoadContent from "@/app/load-content/page";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FiUpload, FiX } from "react-icons/fi";
import { Button } from "../ui/button";
import { LogoCropModal } from "../modals/logo-crop-modal";
import { BannerCropModal } from "../modals/brand-hero-crop-modal";

type BrandInformationData = BrandOnboarding['brandInformation'];

interface BrandInformationProps {
    data: BrandInformationData;
    onDataChange: (data: BrandInformationData, isValid: boolean) => void;
}

const BrandBasicInformationForm = ({ data, onDataChange}: BrandInformationProps) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [brand_name, setBrandName] = useState(data.brand_name);
    const [brand_description, setBrandDescription] = useState(data.brand_description);
    const [brand_logo, setBrandLogo] = useState(data.brand_logo);
    const [brand_banner, setBrandBanner] = useState(data.brand_banner);
    const [isValid, setIsValid] = useState(false);
    const [cropLogo, setCropLogo] = useState<string | null>(null);
    const [cropBanner, setCropBanner] = useState<string | null>(null);

    
    const [logoPreview, setLogoPreview] = useState<string | null>(data.brand_logo || null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(data.brand_banner || null);


    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
        const isValid = brand_name.length > 0 && brand_description.length > 0 && brand_banner.length > 0 && brand_logo.length > 0;
        setIsValid(isValid);
        onDataChange({ brand_name, brand_description, brand_logo, brand_banner }, isValid);
    }, [brand_name, brand_banner, brand_description, brand_logo]);


    const handleLogoClick = () => {
        logoInputRef.current?.click();
    };

    const handleBannerClick = () => {
        bannerInputRef.current?.click();
    };

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log("File selected:", file); // Added log
    
            if (file.size > 2 * 1024 * 1024) {
                setErrorMessage("Logo file size should not exceed 2MB");
                return;
            }
    
            const logoUrl = URL.createObjectURL(file);
            console.log("Logo URL:", logoUrl); // Added log
            setCropLogo(logoUrl);
            if (logoInputRef.current) {
                logoInputRef.current.value = "";
            }
        }
    };

    const handleClearLogo = () => {
        setLogoPreview(null);
        setBrandLogo("");
        setCropLogo(null);
        if (logoInputRef.current) {
            logoInputRef.current.value = "";
        }
        onDataChange({ brand_name, brand_description, brand_logo: "", brand_banner }, isValid);
    };

    const handleClearBanner = () => {
        setBannerPreview(null);
        setBrandBanner("");
        setCropBanner(null);
        if (bannerInputRef.current) {
            bannerInputRef.current.value = "";
        }
        onDataChange({ brand_name, brand_description, brand_logo, brand_banner: "" }, isValid);
    }

    const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage("Banner file size should not exceed 10MB");
                return;
            }

            const bannerUrl = URL.createObjectURL(file);
            setCropBanner(bannerUrl);
            if (bannerInputRef.current) {
                bannerInputRef.current.value = "";
            }
        }
    };

    const handleCroppedLogo = (croppedLogo: string) => {
        if (croppedLogo) {
            setBrandLogo(croppedLogo);
            setLogoPreview(croppedLogo);
            onDataChange({ brand_name, brand_description, brand_logo: croppedLogo, brand_banner }, isValid);
        }
        setCropLogo(null);
    };

    const handleCroppedBanner = (croppedBanner: string) => {
        if (croppedBanner) {
            setBrandBanner(croppedBanner);
            setBannerPreview(croppedBanner);
            onDataChange({ brand_name, brand_description, brand_logo, brand_banner: croppedBanner }, isValid);
        }
        setCropBanner(null);
    }
    
    return (
        <>
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
            <div className="space-y-4">
                <div className="space-y-2">  
                    <label htmlFor="brand_name" className="block text-sm font-bold text-gray-900">
                        Enter Brand Name:*
                    </label>
                    <Input
                        name="brand_name"
                        placeholder="Enter your brand name"
                        value={brand_name}
                        onChange={(e) =>
                            setBrandName(e.target.value)
                        }
                        className="border-2"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="brand-logo" className="block text-sm font-bold text-gray-900">Brand Logo:*</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {
                                logoPreview ? (
                                    <div className="relative">
                                        <Image 
                                            src={brand_logo}
                                            alt="Logo preview"
                                            className="mx-auto object-cover border-2"
                                            width={160}
                                            height={160}
                                        />
                                        <Button
                                            onClick={handleClearLogo} 
                                            className="absolute top-0 right-0 -mr-2 -mt-2 text-white p-1"
                                        >
                                            <FiX />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={handleLogoClick} 
                                        className="bg-transparent hover:bg-transparent relative"    
                                    >
                                        <div className="flex flex-col items-center">
                                            <FiUpload className="mx-auto text-gray-400"/>
                                            <p className="text-sm text-gray-600">Click or drag to upload logo</p>
                                            <p className="text-xs text-gray-500">(Max: 2MB, Format: JPG, PNG, SVG)</p>
                                        </div>
                                    </Button>
                                )
                            }

                            <Input 
                                type="file"
                                ref={logoInputRef}
                                onChange={handleLogoUpload}
                                accept=".jpg,.jpeg,.png,.svg"
                                style={{"display": "none"}}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="brand-banner" className="block text-sm font-bold text-gray-900">Brand Banner:*</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {bannerPreview ? (
                                <div className="relative">
                                    <Image 
                                        src={brand_banner} 
                                        alt="Banner preview" 
                                        className="mx-auto object-cover border-2"
                                        width={1200}
                                        height={400} 
                                    />
                                    <Button
                                        onClick={handleClearBanner}
                                        className="absolute top-0 right-0 -mr-2 -mt-2 text-white p-1"
                                    >
                                        <FiX />
                                    </Button>
                                </div>
                            ) : (

                                <Button 
                                    onClick={handleBannerClick} 
                                    className="bg-transparent hover:bg-transparent relative"    
                                >
                                    <div className="flex flex-col items-center">
                                        <FiUpload className="mx-auto text-gray-400" />
                                        <p className="text-sm text-gray-600">Click or drag to upload banner</p>
                                        <p className="text-xs text-gray-500">(Max: 5MB, Recommended: 1200x400px)</p>
                                    </div>
                                </Button>
                               
                            )}
                            <Input
                                type="file"
                                ref={bannerInputRef}
                                onChange={handleBannerUpload}
                                accept=".jpg,.jpeg,.png"
                                style={{"display": "none"}}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="brand_description" className="block text-sm font-bold text-gray-900">
                        Enter Brand Description:*
                    </label>
                    <Textarea
                        name="brand_description"
                        placeholder="Describe your brand's story, mission and unique offerings"
                        value={brand_description}
                        onChange={(e) =>
                            setBrandDescription(e.target.value)
                        }
                        className="min-h-[100px] border-2"
                        
                    />
                </div>
            </div>
            {cropLogo && (
                <LogoCropModal 
                    image={cropLogo}
                    onClose={(croppedLogo) => {
                        if (croppedLogo) {
                            handleCroppedLogo(croppedLogo);
                        } else {
                            setCropLogo(null);

                        }
                    }}
                />
            )}

            {cropBanner && (
                <BannerCropModal 
                    image={cropBanner}
                    onClose={(croppedBanner) => {
                        if (croppedBanner) {
                            handleCroppedBanner(croppedBanner);
                        } else {
                            setCropBanner(null);
                        }
                    }}
                />
            )}
        </>
    )
}

export default BrandBasicInformationForm