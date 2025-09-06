import { FC, useState } from "react";
import { LookbookEditorDetails } from "./lookbook-client";
import { BrandProductListItem } from "@/actions/get-products-list/fetchBrandProducts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import LookbookImageManager from "./lookbook-image-manager";

interface LookbookEditorProps {
    onBack: () => void;
    initialData: LookbookEditorDetails;
    brandProducts: BrandProductListItem[];
}

const LookbookEditor: FC<LookbookEditorProps> = ({
    onBack,
    initialData,
    brandProducts,
}) => {
    const [formData, setFormData] = useState<LookbookEditorDetails>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!initialData.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading(isEditMode ? "Updating lookbook..." : "Creating lookbook...");

        try {
            // TODO: Implement server action for creating/updating lookbook
            console.log("Submitting lookbook data:", formData);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            toast.success(`Lookbook ${isEditMode ? 'updated' : 'created'} successfully!`, { id: toastId });
            onBack();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Error: ${errorMessage}`, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mx-auto p-4 sm:p-6 lg:p-8 border-2 shadow-lg rounded-none animate-in fade-in-50">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Lookbook' : 'Create a New Lookbook'}
                    </CardTitle>
                    <CardDescription className="text-md text-gray-600">
                        {isEditMode ? 'Update the details for your lookbook.' : 'Build a new lookbook to showcase your products.'}
                    </CardDescription>
                </div>
                <Button onClick={onBack} variant="outline">
                    Back to List
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {/* Basic Details */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                            Basic Details
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input 
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Summer 2024 Collection"
                                required
                                className="border-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="A short description of your lookbook's theme or story."
                                className="border-2 min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* Image Uploader & Manager */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                            Lookbook Pages
                        </h3>
                        <LookbookImageManager
                            images={formData.images}
                            onImagesChange={(updater) => {
                                setFormData(prev => ({ ...prev, images: updater(prev.images) }));
                            }}
                            brandProducts={brandProducts}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="text-white">
                            {isSubmitting ? "Saving..." : (isEditMode ? "Update Lookbook" : "Save Lookbook")}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default LookbookEditor;