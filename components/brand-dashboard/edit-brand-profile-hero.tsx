"use client";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { CropModal } from "../modals/crop-modal";

interface EditBrandHeroProps {
    userId: string;
    accessToken: string;
}
export const EditBrandProfileHero: React.FC<EditBrandHeroProps> = ({userId, accessToken}) => {
    const [heroImage, setHeroImage] = useState('/images/ahiaproto.avif');
    const [cropHeroImage, setCropHeroImage] = useState<string | null>(null);

    const [loading, setLoading] = useState(true); 
    
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(userId && accessToken) {
            async function fetchHeroImage() {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-banner?userId=${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            }
                        }
                    )

                    if (!res.ok) {
                        throw new Error("Couldnt create a connection with the server");
                    }

                    const data = await res.json();

                    if(!data.data) {
                        console.log("No banna found for the user.");
                        setHeroImage('/images/ahiaproto.avif');
                        return;
                    }

                    const gotBanner = data.data.banner_url;
                    setHeroImage(gotBanner);
                } catch (error) {
                    throw new Error(`${error}`)
                } finally {
                    setLoading(false);
                }
            }
            fetchHeroImage();
        }
    }, [userId, accessToken])
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

        <div className="w-full relative"> 
            <div className=""> 
                <Image
                    src={heroImage} 
                    alt={"brand profile image"}
                    className="mx-auto object-cover border-2"
                    width={1200}
                    height={400}
                    priority 
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