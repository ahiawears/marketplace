'use client';

import { FC, useCallback } from "react";
import { LookbookImage } from "./lookbook-client";
import { BrandProductListItem } from "@/actions/get-products-list/fetchBrandProducts";
import { useDropzone, FileRejection } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { GripVertical, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

// TODO: Create this server action to upload to Supabase Storage
async function uploadLookbookImage(file: File, onProgress: (progress: number) => void): Promise<{ success: boolean, path?: string, message: string }> {
    // Simulate upload for now
    console.log(`Uploading ${file.name}`);
    return new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            onProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                const randomPath = `lookbooks/image_${Date.now()}_${file.name}`;
                console.log(`Uploaded ${file.name} to ${randomPath}`);
                resolve({ success: true, path: randomPath, message: "Upload successful" });
            }
        }, 200);
    });
}

interface LookbookImageManagerProps {
    images: LookbookImage[];
    onImagesChange: (updater: (prevImages: LookbookImage[]) => LookbookImage[]) => void;
    brandProducts: BrandProductListItem[];
}

interface SortableImageItemProps {
    image: LookbookImage;
    onRemove: (id: string) => void;
}

const SortableImageItem: FC<SortableImageItemProps> = ({ image, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-3 bg-white border-2 rounded-md shadow-sm">
            <button {...attributes} {...listeners} className="cursor-grab p-2 text-gray-500 hover:bg-gray-100 rounded-md touch-none">
                <GripVertical className="h-5 w-5" />
            </button>
            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                <Image src={image.previewUrl} alt="Lookbook page preview" layout="fill" objectFit="cover" />
                {image.isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="text-white text-sm font-bold">{image.uploadProgress}%</p>
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-gray-800 truncate">{image.file?.name || 'Uploaded Image'}</p>
                {image.isUploading ? (
                    <Progress value={image.uploadProgress} className="h-2" />
                ) : image.error ? (
                    <p className="text-xs text-red-600">{image.error}</p>
                ) : (
                    <p className="text-xs text-green-600">Ready</p>
                )}
            </div>
            <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-600" onClick={() => onRemove(image.id)}>
                <Trash2 className="h-5 w-5" />
            </Button>
        </div>
    );
}

const LookbookImageManager: FC<LookbookImageManagerProps> = ({ images, onImagesChange, brandProducts }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFileUpload = useCallback(async (file: File, tempId: string) => {
        onImagesChange(prevImages => prevImages.map(img => img.id === tempId ? { ...img, isUploading: true } : img));
        
        try {
            const result = await uploadLookbookImage(file, (progress) => {
                onImagesChange(prevImages => prevImages.map(img =>
                    img.id === tempId ? { ...img, uploadProgress: progress } : img
                ));
            });

            if (result.success && result.path) {
                onImagesChange(prevImages => prevImages.map(img =>
                    img.id === tempId ? { ...img, isUploading: false, storagePath: result.path, file: undefined } : img
                ));
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Upload failed";
            onImagesChange(prevImages => prevImages.map(img =>
                img.id === tempId ? { ...img, isUploading: false, error: errorMessage } : img
            ));
            toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
    }, [onImagesChange]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        fileRejections.forEach(({ file, errors }) => {
            errors.forEach(error => toast.error(`Error with ${file.name}: ${error.message}`));
        });

        const newImages: LookbookImage[] = acceptedFiles.map((file) => ({
            id: uuidv4(),
            file,
            previewUrl: URL.createObjectURL(file),
            isUploading: false,
            uploadProgress: 0,
            sort_order: 0, // Placeholder, will be set in the updater
        }));

        onImagesChange(prevImages => {
            const updatedNewImages = newImages.map((img, index) => ({ ...img, sort_order: prevImages.length + index }));
            return [...prevImages, ...updatedNewImages];
        });

        newImages.forEach(image => image.file && handleFileUpload(image.file, image.id));
    }, [onImagesChange, handleFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    const handleRemoveImage = (idToRemove: string) => {
        const imageToRemove = images.find(img => img.id === idToRemove);
        if (imageToRemove?.previewUrl) URL.revokeObjectURL(imageToRemove.previewUrl);
        // TODO: Add logic to delete from Supabase storage if already uploaded
        onImagesChange(prevImages => prevImages.filter(img => img.id !== idToRemove));
        toast.info("Image removed.");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            onImagesChange(prevImages => {
                const oldIndex = prevImages.findIndex((img) => img.id === active.id);
                const newIndex = prevImages.findIndex((img) => img.id === over.id);
                const reorderedImages = arrayMove(prevImages, oldIndex, newIndex).map((img, index) => ({ ...img, sort_order: index }));
                return reorderedImages;
            });
        }
    };

    return (
        <div className="space-y-4">
            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <UploadCloud className="h-10 w-10" />
                    <p className="font-semibold">{isDragActive ? "Drop the files here ..." : "Drag & drop some files here, or click to select files"}</p>
                    <p className="text-xs">PNG, JPG, GIF, WEBP up to 5MB</p>
                </div>
            </div>

            {images.length > 0 && (
                <div className="space-y-3">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {images.map(image => <SortableImageItem key={image.id} image={image} onRemove={handleRemoveImage} />)}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
};

export default LookbookImageManager;