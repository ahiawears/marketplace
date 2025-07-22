import React, { useRef, useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CropModal } from "../modals/crop-modal";

interface ProductImageUploadGridProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const ProductImageUploadGrid: React.FC<ProductImageUploadGridProps> = ({
  images,
  onImagesChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number | -1>(-1);
  const [localImages, setLocalImages] = useState<string[]>(images);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCropImage(e.target.result as string);
          setCropIndex(localImages.findIndex(img => img === ""));
        }
      };
      reader.readAsDataURL(file);
      // Reset the file input value to null
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCroppedImage = (croppedImage: string) => {
    if (cropIndex !== -1) {
      const newImages = [...localImages];
      newImages[cropIndex] = croppedImage;
      setLocalImages(newImages);
      onImagesChange(newImages);
    }
    setCropImage(null);
    setCropIndex(-1);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...localImages];
    newImages[index] = "";

    // Shift images to fill the gap
    const filteredImages = newImages.filter(img => img !== "");
    const updatedImages = [...filteredImages, ...Array(newImages.length - filteredImages.length).fill("")];

    setLocalImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {localImages.map((image, index) => (
          <div key={index} className="relative aspect-[510/650]">
            {image ? (
              <>
                <Image
                  src={image}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-full object-cover border-2 rounded-lg"
                  width={510}
                  height={650}
                  priority
                />
                <Button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 -mt-2 -mr-2 p-1 text-white bg-red-500 rounded-full"
                >
                  <FiX />
                </Button>
              </>
            ) : (
              <div
                className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={handleAddImageClick}
              >
                <div className="text-center">
                  <FiPlus className="mx-auto text-gray-400 text-2xl" />
                  <p className="text-sm text-gray-600">Add image</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept=".jpg,.jpeg,.png,.svg"
        style={{ display: "none" }}
      />

      {cropImage && (
        <CropModal
          image={cropImage}
          onClose={(croppedImage) => {
            if (croppedImage) {
              handleCroppedImage(croppedImage) 
            } else {
              setCropImage(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProductImageUploadGrid;
