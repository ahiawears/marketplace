"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import { Input } from "../ui/input";

export const EditBrandLogo = () => {
    const [logoImage, setLogoImage] = useState('/images/ahiaproto.avif');

    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = () => {
        if (logoInputRef.current) {
            logoInputRef.current.click();
        }
    };
    
    
    return (
        <div>
            <h2 className="font-mabry-pro text-2xl">Brand Logo</h2>
            <div className="shadow-2xl h-40 w-40 relative">
                <div className="max-w-40 w-40">
                    <div className="w-full min-h-40 h-40 relative">
                        <Image
                            src={logoImage}
                            alt={"brand logo image"}
                            fill
                            style={{objectFit: "cover"}}
                            priority
                            sizes="(max-w-40) 100vw"
                        />
                        <div className="absolute top-2 right-2">
                            <Button onClick={handleEditClick} className="bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition">
                                <Pencil />
                            </Button>
                            <Input
                                type="file"
                                ref={logoInputRef}
                                style={{ display: 'none' }}
                                onChange={handleLogoChange}
                                accept="image/*"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}