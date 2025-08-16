"use client";

import { Button } from "@/components/ui/button";

interface DeleteAddressModalProps {
    title: string;
    message: string;
    onDelete: () => void;
    onCancel: () => void;
}

const DeleteModal = ({ title, message, onDelete, onCancel }: DeleteAddressModalProps) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white border-2 shadow-lg p-6 w-80">
                <h2 className="text-lg font-semibold mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        className="border-2"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="border-2"
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;