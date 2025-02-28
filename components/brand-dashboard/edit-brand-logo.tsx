"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import { Input } from "../ui/input";
import { CropModal } from "../modals/crop-modal";
import { createClient } from "@/supabase/client";

const dataURLtoBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return blob;
};

export const EditBrandLogo = () => {
    const [logoImage, setLogoImage] = useState('/images/ahiaproto.avif');
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [isLogoChanged, setIsLogoChanged] = useState<boolean>(false);


    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const imageUrl = URL.createObjectURL(file);
            setCropImage(imageUrl);            
        }
    };

    const handleEditClick = () => {
        if (logoInputRef.current) {
            logoInputRef.current.click();
        }
    };
    const handleResetLogo = () => {
        setLogoImage('/images/ahiaproto.avif');
        setIsLogoChanged(false);
        setCropImage(null);
    }

    const handleCroppedImage = (croppedImage: string) => {
        setLogoImage(croppedImage);
        setIsLogoChanged(true);
        setCropImage(null);
    }

    const handleSaveLogo = async () => {
        setIsLogoChanged(false);
        setCropImage(null);
        console.log("The logo string is: ", logoImage);
        try {
            const {data: { session }, error } = await createClient().auth.getSession();
            if (error) {
                throw new Error("Failed to get session")
            }

            if (!session) {
                throw new Error("No session found, user is not authenticated");
            }

            const accessToken = session.access_token;
            const logoBlob = await dataURLtoBlob(logoImage);
            const formData = new FormData();
            formData.append("logo", logoBlob, "brand-logo.png");

            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-brand-logo`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    body: formData
                }
            )
            if (!res.ok) {
                const errorData = await res.json();
                console.log("The server response is: ", errorData.message);
                throw new Error(`Could not establish a connection with the server: ${errorData.message}`);
            }

            const data = await res.json();
            if (data.success) {
                console.log("Logo Url sucessfully changed: ", data);
            }
        } catch (error) {
            console.error("Error uploading brand logo:", error);
            throw error;
        }

    }
    
    return (
        <div>
            <h2 className="font-mabry-pro text-2xl">Brand Logo</h2>
            <div className="shadow-2xl h-[160px] max-w-[160px] relative group flex mx-auto">
                <Image 
                    src={logoImage}
                    alt={"brand logo image"}
                    style={
                        {
                            objectFit: "cover"
                        }
                    }
                    width={160}
                    height={160}
                    priority
                />
                <Button onClick={handleEditClick} className="absolute top-3 right-3 bg-transparent rounded-full p-2 text-white hover:bg-gray-200 transition">
                    <Pencil className="text-black "/>
                </Button>
                <Input 
                    type="file"
                    ref={logoInputRef}
                    style={{display: 'none'}}
                    onChange={handleLogoChange}
                    accept="image/*"
                />
            </div>
            {/* Logo crop modal */}
            {cropImage &&(
                <CropModal
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

            {isLogoChanged &&(
                <div className="my-4 w-1/4">
                    <div className="flex lg:flex-row flex-col space-y-2 lg:space-y-0 ">
                        <div className="basis-1/2">
                            <Button className="bg-red-400" onClick={handleResetLogo}>
                                Cancel
                            </Button>
                        </div>
                        <div className="basis-1/2">
                            <Button className="border-2" onClick={handleSaveLogo}>
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}