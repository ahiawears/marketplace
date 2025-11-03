"use client";

import { FC, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

interface ConfirmationModalProps {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "OK",
    cancelText = "Cancel",
}) => {
    useEffect(() => {
        // Prevent background scrolling when the modal is open
        document.body.style.overflow = "hidden";

        // Re-enable scrolling when the modal is closed
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Card className="w-full max-w-sm rounded-none border-2">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="pt-2">{description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" className="border-2" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button className="border-2" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ConfirmationModal;