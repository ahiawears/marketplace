"use client";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { createClient } from "@/supabase/client";
import LoadContent from "@/app/load-content/page";
import { BannerCropModal } from "../modals/brand-hero-crop-modal";

const dataURLtoBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return blob;
};

interface EditBrandHeroProps {
  userId: string;
  accessToken: string;
}
export const EditBrandProfileHero: React.FC<EditBrandHeroProps> = ({
  userId,
  accessToken,
}) => {
  const [heroImage, setHeroImage] = useState("/images/ahiaproto.avif");
  const [cropHeroImage, setCropHeroImage] = useState<string | null>(null);
  const [isHeroChanged, setIsHeroChanged] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId && accessToken) {
      async function fetchHeroImage() {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-banner?userId=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!res.ok) {
            throw new Error("Couldnt create a connection with the server");
          }

          const data = await res.json();

          if (!data.data) {
            console.log("No banner found for the user.");
            setHeroImage("/images/ahiaproto.avif");
            return;
          }

          const gotBanner = data.data.banner_url;
          setHeroImage(gotBanner);
        } catch (error) {
          throw new Error(`${error}`);
        } finally {
          setLoading(false);
        }
      }
      fetchHeroImage();
    }
  }, [userId, accessToken]);

  if (loading) {
    return <LoadContent />;
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];

      const heroUrl = URL.createObjectURL(file);
      setCropHeroImage(heroUrl);
    }
  };

  const handleCroppedHeroImage = (croppedImage: string) => {
    setHeroImage(croppedImage);
    setIsHeroChanged(true);
    setCropHeroImage(null);
  };

  const handleEditClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleResetBanner = () => {
    setHeroImage("/images/ahiaproto.avif");
    setIsHeroChanged(false);
    setCropHeroImage(null);
  };

  const handleSaveBanner = async () => {
    event?.preventDefault();
    setIsHeroChanged(false);
    setCropHeroImage(null);

    console.log("The banner string is: ", heroImage);
    try {
      const {
        data: { session },
        error,
      } = await createClient().auth.getSession();
      if (error) {
        throw new Error(`Failed to get session ${error.message}`);
      }

      if (!session) {
        throw new Error("No session found, user is not authenticated");
      }

      const accessToken = session.access_token;
      const heroBlob = await dataURLtoBlob(heroImage);
      const formData = new FormData();
      formData.append("hero", heroBlob, "brand-banner.png");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/upload-brand-banner`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        throw new Error(`Could not establish a connection with the server`);
      }

      const data = await res.json();
      if (data.success) {
        console.log("Banner Url sucessfully changed: ", data);
      } else {
        console.error("Error uploading the banner url");
      }
    } catch (error) {
      console.error("Error uploading brand hero image:", error);
      throw error;
    }
  };

  return (
    <div className="w-full relative">
      <div className="">
        <Image
          src={heroImage}
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

      {isHeroChanged && (
        <div className="my-4 w-1/4 float-right">
          <div className="flex lg:flex-row flex-col space-y-2 lg:space-y-0">
            <div className="basis-1/2">
              <Button className="bg-red-400" onClick={handleResetBanner}>
                Cancel
              </Button>
            </div>
            <div className="basis-1/2">
              <Button className="border-2" onClick={handleSaveBanner}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
