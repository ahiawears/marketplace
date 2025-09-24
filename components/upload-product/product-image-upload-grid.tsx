import React, { useRef, useState, useEffect, FC } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CropModal } from "../modals/crop-modal";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductImageUploadGridProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const SortableImage: FC<{
  id: number;
  image: string;
  index: number;
  handleRemoveImage: (index: number) => void;
  handleAddImageClick: () => void;
}> = ({ id, image, index, handleRemoveImage, handleAddImageClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !image });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(image ? attributes : {})}
      {...(image ? listeners : {})}
      className="relative aspect-[510/650] touch-none"
    >
      {image ? (
        <>
          <Image
            src={image}
            alt={`Uploaded image ${index + 1}`}
            className="w-full h-full object-cover border-2 "
            width={510}
            height={650}
            priority
          />
          <Button
            onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
            className="absolute top-0 right-0 -mt-2 -mr-2 p-1 text-white  rounded-none z-20"
          >
            <FiX />
          </Button>
        </>
      ) : (
        <div
          className="flex items-center justify-center w-full h-full border-2 border-dashed cursor-pointer hover:bg-gray-50"
          onClick={handleAddImageClick}
        >
          <div className="text-center">
            <FiPlus className="mx-auto text-gray-400 text-2xl" />
            <p className="text-sm text-gray-600">Add image</p>
          </div>
        </div>
      )}
    </div>
  );
};

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require pointer to move 8px to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = active.id as number;
      const newIndex = over.id as number;
      onImagesChange(arrayMove(localImages, oldIndex, newIndex));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be 2MB or less.");
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
    if (localImages.every(img => img && img.trim() !== "")) {
        toast.error("You can upload a maximum of 4 images.");
        return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const imageIds = localImages.map((_, index) => index);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <SortableContext items={imageIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-4">
            {localImages.map((image, index) => (
              <SortableImage
                key={index}
                id={index}
                image={image}
                index={index}
                handleRemoveImage={handleRemoveImage}
                handleAddImageClick={handleAddImageClick}
              />
            ))}
          </div>
        </SortableContext>

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
    </DndContext>
  );
};

export default ProductImageUploadGrid;
