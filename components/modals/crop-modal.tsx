"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "../ui/button";

type Props = {
  image?: string;
  onClose?: (image: string) => void;
};

export const CropModal = (props: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const onCropComplete = (
    croppedArea: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    croppedAreaPixels: { x: number; y: number; width: number; height: number }
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const onClose = async () => {
    if (props.onClose && props.image) {
      const croppedImg = await getCroppedImg(props.image, croppedAreaPixels);

      props.onClose(croppedImg);
    }
  };

  return (
    <Dialog open={!!props.image} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop</DialogTitle>
        </DialogHeader>

        <div className="relative h-[50vh] min-h-[500px]">
          {/* <Cropper
            image={props.image}
            crop={crop}
            zoom={zoom}
            aspect={1 / 1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          /> */}
          <Cropper
            image={props.image}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4} // Example: 4:3 aspect ratio
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            minZoom={1} // Minimum zoom level
            maxZoom={3} // Maximum zoom level
          />

        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Crop</Button>
          </DialogClose>
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
