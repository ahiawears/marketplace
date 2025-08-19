"use client";

import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { BannerCropModal } from "../modals/brand-hero-crop-modal";
import { toast } from "sonner";

interface EditBrandHeroProps {
    data: string;
    onImageChange: (newImage: string) => void;
}

export const EditBrandProfileHero: React.FC<EditBrandHeroProps> = ({ data, onImageChange }) => {
    const [cropHeroImage, setCropHeroImage] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const MAX_SIZE_MB = 5;
            const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

            if (file.size > MAX_SIZE_BYTES) {
                toast.error(`The banner image must be less than ${MAX_SIZE_MB}MB.`);
                return;
            }

            const heroUrl = URL.createObjectURL(file);
            setCropHeroImage(heroUrl);
        }
    };

    const handleCroppedHeroImage = (croppedImage: string) => {
        onImageChange(croppedImage);
        setCropHeroImage(null);
    };

    const handleEditClick = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    };

    return (
        <div className="w-full relative">
            <div className="">
                <Image
                    src={data}
                    alt={"brand profile image"}
                    className="mx-auto object-cover border-2 w-full h-full"
                    width={1200}
                    height={400}
                    priority
                />
                <div className="absolute top-4 right-4">
                    <Button
                        onClick={handleEditClick}
                        className="bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition"
                    >
                        <Pencil />
                    </Button>
                    <Input
                        type="file"
                        ref={imageInputRef}
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                </div>
            </div>

            {/* Crop Modal */}
            {cropHeroImage && (
                <BannerCropModal
                    image={cropHeroImage}
                    onClose={(croppedImage) => {
                        if (croppedImage) {
                            handleCroppedHeroImage(croppedImage);
                        } else {
                            setCropHeroImage(null);
                        }
                    }}
                />
            )}
        </div>
    );
};
