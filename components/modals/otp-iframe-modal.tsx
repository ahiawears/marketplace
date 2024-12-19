import React from "react";
import { Button } from "../ui/button";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-4 relative w-[90%] max-w-lg">
            <Button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
                X
            </Button>
            {children}
        </div>
    </div>
  );
};

export default Modal;
