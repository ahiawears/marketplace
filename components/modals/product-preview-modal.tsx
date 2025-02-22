import React, { ReactNode } from 'react';
import { Button } from '../ui/button';
import ModalBackdrop from './modal-backdrop';

interface ProductPreviewModalProps {
    children: ReactNode;
    onClose: () => void;
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ children, onClose }) => {
    return (
        <div>
            <div className="m-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50] w-5/6 h-5/6 border-2">
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full h-full z-[60]">
                    <Button
                        className="bg-white absolute top-2 right-2 text-gray-600 hover:text-black z-[1000]"
                        onClick={onClose}
                    >
                        ✖
                    </Button>
                    {children} 
                </div>
            </div>
        </div>
    );
};

export default ProductPreviewModal;
