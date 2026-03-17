'use client';

import { FC, MouseEvent, useCallback, useState } from "react";
import { LookbookImage, LookbookProductTag } from "./lookbook-client";
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
import { createClient } from "@/supabase/client";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";

const LOOKBOOK_BUCKET = "lookbook-images";

async function uploadLookbookImage(
    userId: string,
    file: File,
    onProgress: (progress: number) => void
): Promise<{ success: boolean; path?: string; publicUrl?: string; message: string }> {
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `lookbooks/${userId}/${uuidv4()}-${safeName}`;

    onProgress(15);

    const { error } = await supabase.storage
        .from(LOOKBOOK_BUCKET)
        .upload(storagePath, file, {
            upsert: false,
            contentType: file.type,
        });

    if (error) {
        return { success: false, message: error.message };
    }

    onProgress(85);

    const { data: publicUrlData } = supabase.storage
        .from(LOOKBOOK_BUCKET)
        .getPublicUrl(storagePath);

    onProgress(100);

    return {
        success: true,
        path: storagePath,
        publicUrl: publicUrlData.publicUrl,
        message: "Upload successful",
    };
}

interface LookbookImageManagerProps {
    images: LookbookImage[];
    onImagesChange: (updater: (prevImages: LookbookImage[]) => LookbookImage[]) => void;
    brandProducts: BrandProductListItem[];
    userId: string;
}

interface SortableImageItemProps {
    image: LookbookImage;
    brandProducts: BrandProductListItem[];
    activePlacementTagId: string | null;
    onRemove: (id: string) => void;
    onAddTag: (imageId: string) => void;
    onUpdateTag: (imageId: string, tagId: string, updates: Partial<LookbookProductTag>) => void;
    onRemoveTag: (imageId: string, tagId: string) => void;
    onStartPlacement: (imageId: string, tagId: string) => void;
    onPlaceTag: (imageId: string, tagId: string, x: number, y: number) => void;
}

const SortableImageItem: FC<SortableImageItemProps> = ({
    image,
    brandProducts,
    activePlacementTagId,
    onRemove,
    onAddTag,
    onUpdateTag,
    onRemoveTag,
    onStartPlacement,
    onPlaceTag,
}) => {
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

    const tagProductOptions = brandProducts;
    const isPlacementActive = activePlacementTagId !== null;

    const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!activePlacementTagId) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        onPlaceTag(image.id, activePlacementTagId, x, y);
    };

    return (
        <div ref={setNodeRef} style={style} className="space-y-4 bg-white border-2 rounded-md p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <button {...attributes} {...listeners} className="cursor-grab p-2 text-gray-500 hover:bg-gray-100 rounded-md touch-none">
                    <GripVertical className="h-5 w-5 outline-2" />
                </button>
                <div
                    className={`relative h-32 w-32 overflow-hidden rounded-md bg-gray-100 ${
                        isPlacementActive ? "cursor-crosshair ring-2 ring-black ring-offset-2" : ""
                    }`}
                    onClick={handlePreviewClick}
                >
                    <Image
                        src={image.previewUrl}
                        alt="Lookbook page preview"
                        fill
                        className="object-cover"
                    />
                    {image.tags.map((tag, index) => (
                        <span
                            key={tag.id}
                            className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white"
                            style={{ left: `${tag.x_position}%`, top: `${tag.y_position}%` }}
                        >
                            {index + 1}
                        </span>
                    ))}
                    {image.isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <p className="text-white text-sm font-bold">{image.uploadProgress}%</p>
                        </div>
                    )}
                    {isPlacementActive && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                            Click image to place marker
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
                    <Trash2 className="h-5 w-5 outline-2 outline-black" />
                </Button>
            </div>

            <div className="space-y-3 border-t-2 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Tagged products</p>
                        <p className="text-xs text-gray-500">Attach products to this page and position their marker.</p>
                    </div>
                    <Button className="border-2" type="button" variant="outline" onClick={() => onAddTag(image.id)}>
                        Add Product Tag
                    </Button>
                </div>

                {image.tags.length === 0 ? (
                    <p className="text-sm text-gray-500">No products tagged on this page yet.</p>
                ) : (
                    <div className="space-y-3">
                        {image.tags.map((tag) => {
                            const selectedProduct = tagProductOptions.find((product) => product.id === tag.productId);
                            const variants = selectedProduct?.variants || [];

                            return (
                                <div key={tag.id} className="grid gap-3 border-2 bg-gray-50 p-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Product</Label>
                                        <Select
                                            className="border-2"
                                            value={tag.productId}
                                            onChange={(event) => {
                                                const nextProductId = event.target.value;
                                                const nextProduct = tagProductOptions.find((product) => product.id === nextProductId);
                                                onUpdateTag(image.id, tag.id, {
                                                    productId: nextProductId,
                                                    productVariantId: "",
                                                    label: nextProduct?.name || tag.label,
                                                })
                                            }}
                                        >
                                            <option value="">Select product</option>
                                            {tagProductOptions.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Variant</Label>
                                        <Select
                                            className="border-2"
                                            value={tag.productVariantId || ""}
                                            onChange={(event) =>
                                                onUpdateTag(image.id, tag.id, { productVariantId: event.target.value || undefined })
                                            }
                                            disabled={!selectedProduct || variants.length === 0}
                                        >
                                            <option value="">All variants</option>
                                            {variants.map((variant) => (
                                                <option key={variant.id} value={variant.id}>
                                                    {variant.name || variant.sku || "Variant"}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Label</Label>
                                        <Input
                                            value={tag.label}
                                            onChange={(event) => onUpdateTag(image.id, tag.id, { label: event.target.value })}
                                            placeholder="Optional label shown on the page"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>X position (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={tag.x_position}
                                            onChange={(event) =>
                                                onUpdateTag(image.id, tag.id, {
                                                    x_position: Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Y position (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={tag.y_position}
                                            onChange={(event) =>
                                                onUpdateTag(image.id, tag.id, {
                                                    y_position: Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-end justify-end">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                className="border-2 rounded-none"
                                                variant={activePlacementTagId === tag.id ? "default" : "outline"}
                                                onClick={() => onStartPlacement(image.id, tag.id)}
                                            >
                                                {activePlacementTagId === tag.id ? "Placing..." : "Place on Image"}
                                            </Button>
                                            <Button className="rounded-none" type="button" variant="destructive" onClick={() => onRemoveTag(image.id, tag.id)}>
                                                Remove Tag
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const LookbookImageManager: FC<LookbookImageManagerProps> = ({ images, onImagesChange, brandProducts, userId }) => {
    const [activePlacement, setActivePlacement] = useState<{ imageId: string; tagId: string } | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFileUpload = useCallback(async (file: File, tempId: string) => {
        onImagesChange(prevImages => prevImages.map(img => img.id === tempId ? { ...img, isUploading: true } : img));
        
        try {
            const result = await uploadLookbookImage(userId, file, (progress) => {
                onImagesChange(prevImages => prevImages.map(img =>
                    img.id === tempId ? { ...img, uploadProgress: progress } : img
                ));
            });

            if (result.success && result.path && result.publicUrl) {
                const uploadedPath = result.path;
                const uploadedUrl = result.publicUrl;
                onImagesChange(prevImages => prevImages.map(img =>
                    img.id === tempId
                        ? {
                            ...img,
                            isUploading: false,
                            storagePath: uploadedPath,
                            previewUrl: uploadedUrl,
                            file: undefined,
                          }
                        : img
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
            tags: [],
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
        setActivePlacement((prev) => (prev?.imageId === idToRemove ? null : prev));
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

    const handleAddTag = (imageId: string) => {
        const newTagId = uuidv4();
        onImagesChange((prevImages) =>
            prevImages.map((image) =>
                image.id === imageId
                    ? {
                          ...image,
                          tags: [
                              ...image.tags,
                              {
                                  id: newTagId,
                                  productId: "",
                                  productVariantId: "",
                                  label: "",
                                  x_position: 50,
                                  y_position: 50,
                                  width: null,
                                  height: null,
                              },
                          ],
                      }
                    : image
            )
        );
        setActivePlacement({ imageId, tagId: newTagId });
    };

    const handleUpdateTag = (imageId: string, tagId: string, updates: Partial<LookbookProductTag>) => {
        onImagesChange((prevImages) =>
            prevImages.map((image) =>
                image.id === imageId
                    ? {
                          ...image,
                          tags: image.tags.map((tag) =>
                              tag.id === tagId
                                  ? {
                                        ...tag,
                                        ...updates,
                                        x_position:
                                            updates.x_position !== undefined
                                                ? Math.max(0, Math.min(100, updates.x_position))
                                                : tag.x_position,
                                        y_position:
                                            updates.y_position !== undefined
                                                ? Math.max(0, Math.min(100, updates.y_position))
                                                : tag.y_position,
                                    }
                                  : tag
                          ),
                      }
                    : image
            )
        );
    };

    const handleRemoveTag = (imageId: string, tagId: string) => {
        onImagesChange((prevImages) =>
            prevImages.map((image) =>
                image.id === imageId
                    ? {
                          ...image,
                          tags: image.tags.filter((tag) => tag.id !== tagId),
                      }
                    : image
            )
        );
        setActivePlacement((prev) => (prev?.tagId === tagId ? null : prev));
    };

    const handleStartPlacement = (imageId: string, tagId: string) => {
        setActivePlacement({ imageId, tagId });
    };

    const handlePlaceTag = (imageId: string, tagId: string, x: number, y: number) => {
        handleUpdateTag(imageId, tagId, {
            x_position: x,
            y_position: y,
        });
        setActivePlacement(null);
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
                            {images.map((image) => (
                                <SortableImageItem
                                    key={image.id}
                                    image={image}
                                    brandProducts={brandProducts}
                                    activePlacementTagId={activePlacement?.imageId === image.id ? activePlacement.tagId : null}
                                    onRemove={handleRemoveImage}
                                    onAddTag={handleAddTag}
                                    onUpdateTag={handleUpdateTag}
                                    onRemoveTag={handleRemoveTag}
                                    onStartPlacement={handleStartPlacement}
                                    onPlaceTag={handlePlaceTag}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
};

export default LookbookImageManager;
