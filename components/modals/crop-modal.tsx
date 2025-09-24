"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type Props = {
  image?: string;
  onClose?: (image?: string) => void; // Allow undefined for cancellation
  aspectRatio?: number;
};

export const CropModal = ({ image, onClose, aspectRatio = 3 / 4 }: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    if (!image) return;
    setIsCropping(true);
    try {
      const croppedImg = await getCroppedImg(image, croppedAreaPixels);
      onClose?.(croppedImg);
    } catch (e) {
      console.error(e);
      onClose?.(); // Close without image on error
    } finally {
      setIsCropping(false);
    }
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <Dialog open={!!image} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the image to fit the required frame. You can scroll or use the slider to zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[500px] w-full bg-gray-100 border-2">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoom-slider">Zoom</Label>
          <Input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-4 p-0 bg-gray-200 rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-black"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" className="border-2 rounded-none" onClick={handleCancel} disabled={isCropping}>
            Cancel
          </Button>
          <Button onClick={handleCrop} className="border-2 rounded-none" disabled={isCropping}>
            {isCropping ? "Cropping..." : "Crop & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const getCroppedImg = (
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number }
) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx?.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, "image/png");
    };
    image.onerror = reject;
  }) as Promise<string>;
};
