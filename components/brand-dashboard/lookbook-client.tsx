'use client';
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandProductListItem } from "@/actions/get-products-list/fetchBrandProducts";
import LookbookList from "./lookbook-list";
import LookbookEditor from "./lookbook-editor";
import { toast } from "sonner";

type ViewMode = "list" | "editor";

export interface LookbookListItem {
    id: string;
    title: string;
    is_published: boolean;
    created_at: string;
    cover_image_url?: string;
    item_count: number;
}

export interface LookbookImage {
    id: string; // Can be a temporary client-side ID before upload, then the DB ID
    file?: File; // The actual file object for new uploads
    previewUrl: string; // For client-side preview
    storagePath?: string; // The path in Supabase storage after upload
    uploadProgress?: number;
    isUploading?: boolean;
    error?: string;
    sort_order: number;
    tags: LookbookProductTag[];
}

export interface LookbookProductTag {
    id: string;
    productId: string;
    productVariantId?: string;
    label: string;
    x_position: number;
    y_position: number;
    width?: number | null;
    height?: number | null;
}

export interface LookbookEditorDetails {
    id?: string;
    title: string;
    description: string;
    is_published: boolean;
    images: LookbookImage[];
}

interface LookbookDetailsResponse {
    success: boolean;
    message?: string;
    data?: LookbookEditorDetails | null;
}

interface LookbookDeleteResponse {
    success: boolean;
    message?: string;
}

export interface LookbookSaveSummary {
    id: string;
    title: string;
    is_published: boolean;
    created_at: string;
    cover_image_url?: string;
    item_count: number;
}

interface LookbookSaveResponse {
    success: boolean;
    message?: string;
    id?: string;
    lookbook?: LookbookSaveSummary;
}

export interface LookbookClientProps {
    userId: string;
    lookbookList: LookbookListItem[];
    brandProducts: BrandProductListItem[];  
}

const LookbookClient: FC<LookbookClientProps> = ({
    userId,
    lookbookList,
    brandProducts,
}) => {
    const router = useRouter();
    const [view, setView] = useState<ViewMode>("list");
    const [lookbooks, setLookbooks] = useState<LookbookListItem[]>(lookbookList);
    const [lookbookToEdit, setLookbookToEdit] = useState<LookbookEditorDetails | null>(null);

    useEffect(() => {
        setLookbooks(lookbookList);
    }, [lookbookList]);

    const handleCreateNew = () => {
        setLookbookToEdit(null); // Start with a blank slate
        setView("editor");
    };

    const handleEdit = async (lookbookId: string) => {
        const loadingToast = toast.loading("Loading lookbook...");
        try {
            const response = await fetch(`/api/lookbooks/${lookbookId}`, { cache: "no-store" });
            const result: LookbookDetailsResponse = await response.json();

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || "Failed to load lookbook.");
            }

            setLookbookToEdit(result.data);
            setView("editor");
            toast.dismiss(loadingToast);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load lookbook.", { id: loadingToast });
        }
    };

    const handleDelete = async (lookbookId: string) => {
        const loadingToast = toast.loading("Deleting lookbook...");
        try {
            const response = await fetch(`/api/lookbooks/${lookbookId}`, {
                method: "DELETE",
            });
            const result: LookbookDeleteResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete lookbook.");
            }

            setLookbooks((prev) => prev.filter((lookbook) => lookbook.id !== lookbookId));
            toast.success(result.message || "Lookbook deleted successfully.", { id: loadingToast });
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete lookbook.", { id: loadingToast });
        }
    };

    const handleBackToList = () => {
        setLookbookToEdit(null);
        setView("list");
        router.refresh();
    };

    const handleSaved = (savedLookbook: LookbookSaveSummary, savedDetails: LookbookEditorDetails) => {
        setLookbooks((prev) => {
            const next = prev.filter((lookbook) => lookbook.id !== savedLookbook.id);
            return [savedLookbook, ...next];
        });
        setLookbookToEdit(savedDetails);
        setView("list");
        router.refresh();
    };

    return (
        <div>
            {view === 'editor' ? (
                <LookbookEditor
                    onBack={handleBackToList}
                    onSaved={handleSaved}
                    initialData={lookbookToEdit || { title: "", description: "", is_published: false, images: [] }}
                    brandProducts={brandProducts}
                    userId={userId}
                />
            ) : (
                <LookbookList
                    lookbooks={lookbooks}
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default LookbookClient;
