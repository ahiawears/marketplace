"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import { Input } from "../ui/input";
import { LogoCropModal } from "../modals/logo-crop-modal";
import { toast } from "sonner";

interface EditBrandLogoProps {
    data: string;
    onImageChange: (newImage: string) => void;
}

export const EditBrandLogo: React.FC<EditBrandLogoProps> = ({ data, onImageChange }) => {
    const [cropImage, setCropImage] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const MAX_SIZE_MB = 2;
            const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

            if (file.size > MAX_SIZE_BYTES) {
                toast.error(`The logo image must be less than ${MAX_SIZE_MB}MB.`)
                return;
            }
            const imageUrl = URL.createObjectURL(file);
            setCropImage(imageUrl);
        }
    };

    const handleEditClick = () => {
        if (logoInputRef.current) {
            logoInputRef.current.click();
        }
    };

    const handleCroppedImage = (croppedImage: string) => {
        onImageChange(croppedImage);
        setCropImage(null);
    };

    return (
        <div>
            <div className="h-[160px] max-w-[160px] relative group flex mx-auto">
                <Image
                    src={data}
                    alt={"brand logo image"}
                    className="mx-auto object-cover border-2"
                    width={160}
                    height={160}
                    priority
                />
                <Button onClick={handleEditClick} className="absolute top-3 right-3 bg-transparent rounded-full p-2 text-white hover:bg-gray-200 transition">
                    <Pencil className="text-black " />
                </Button>
                <Input
                    type="file"
                    ref={logoInputRef}
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                    accept="image/*"
                />
            </div>
            {/* Logo crop modal */}
            {cropImage && (
                <LogoCropModal
                    image={cropImage}
                    onClose={(croppedImage) => {
                        if (croppedImage) {
                            handleCroppedImage(croppedImage);
                        } else {
                            setCropImage(null);
                        }
                    }}
                />
            )}
        </div>
    );
};
