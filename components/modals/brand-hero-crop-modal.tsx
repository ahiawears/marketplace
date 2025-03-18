import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Cropper from "react-easy-crop";
import { Button } from "../ui/button";

type Props = {
    image?: string;
    onClose?: (image: string | undefined) => void;
};


export const BannerCropModal = (props: Props) => {

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
        },croppedAreaPixels: { 
            x: number; 
            y: number;
            width: number; 
            height: number 
        }
    ) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCrop = async () => {
        if (props.onClose && props.image) {
            const croppedImg = await getCroppedImg(props.image, croppedAreaPixels);
            props.onClose(croppedImg);
        }
    };

    
    const onClose = async () => {
        if (props.onClose) {    
          props.onClose("");
        }
    };

    return (
        <Dialog open={!!props.image} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crop</DialogTitle>
                   
                </DialogHeader>
                <div className="relative w-full h-64">
                    <Cropper
                        image={props.image}
                        crop={crop}
                        zoom={zoom}
                        aspect={4/2 } 
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleCrop}>Crop</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
    
};

export const getCroppedImg = ( imageSrc: string,crop: { x: number; y: number; width: number; height: number }) => {
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