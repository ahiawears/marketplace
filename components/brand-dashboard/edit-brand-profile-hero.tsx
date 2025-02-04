"use client";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { CropModal } from "../modals/crop-modal";

export const EditBrandProfileHero = () => {
    const [heroImage, setHeroImage] = useState('/images/ahiaproto.avif');
    const [cropHeroImage, setCropHeroImage] = useState<string | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeroImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCroppedHeroImage = (croppedImage: string) => {

    }

    const handleEditClick = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    };

    return (
        <div>
            <h2 className="font-mabry-pro text-2xl">Profile Image</h2>
            <div className="mx-auto shadow-2xl relative">
                <div className="mx-auto max-w-7xl">
                    <div className="w-full min-h-96 relative"> 
                        <Image
                            src={heroImage} 
                            alt={"brand profile image"}
                            fill 
                            style={{ objectFit: "cover" }} 
                            priority 
                            sizes="100vw" 
                        />
                        <div className="absolute top-4 right-4">
                            <Button onClick={handleEditClick} className="bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition">
                                <Pencil />
                            </Button>
                            <Input
                                type="file"
                                ref={imageInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Crop Modal */}
            {cropHeroImage && (
                <CropModal
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
}

// Hero Image:
// Brands should be able to add an hero image and a text which its position could be set in the image