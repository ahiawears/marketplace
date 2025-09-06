'use client';
import { FC, useState } from "react";
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
}

export interface LookbookEditorDetails {
    id?: string;
    title: string;
    description: string;
    is_published: boolean;
    images: LookbookImage[];
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
    const [view, setView] = useState<ViewMode>("list");
    const [lookbooks, setLookbooks] = useState<LookbookListItem[]>(lookbookList);
    const [lookbookToEdit, setLookbookToEdit] = useState<LookbookEditorDetails | null>(null);

    // TODO: Implement fetching lookbooks from the server
    const fetchLookbooks = async () => {
        // This function will be used to refresh the list after an action
        console.log("Refreshing lookbooks...");
        toast.info("Refreshing lookbooks list...");
    };

    const handleCreateNew = () => {
        setLookbookToEdit(null); // Start with a blank slate
        setView("editor");
    };

    const handleEdit = (lookbookId: string) => {
        // TODO: Fetch full lookbook details for editing
        const lookbook = lookbooks.find(lb => lb.id === lookbookId);
        if (lookbook) {
            setLookbookToEdit({
                id: lookbook.id,
                title: lookbook.title,
                description: `Description for ${lookbook.title}`,
                is_published: lookbook.is_published,
                images: [], // TODO: Fetch full lookbook details including images
            });
            setView("editor");
        }
    };

    const handleDelete = (lookbookId: string) => {
        // TODO: Implement delete functionality with a confirmation modal
        console.log("Deleting lookbook:", lookbookId);
        toast.warning("Delete functionality not yet implemented.");
    };

    const handleBackToList = () => {
        setLookbookToEdit(null);
        setView("list");
        fetchLookbooks();
    };

    return (
        <div>
            {view === 'editor' ? (
                <LookbookEditor 
                    onBack={handleBackToList}
                    initialData={lookbookToEdit || { title: "", description: "", is_published: false, images: [] }}
                    brandProducts={brandProducts}
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
}

export default LookbookClient;