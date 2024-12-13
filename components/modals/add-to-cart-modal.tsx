import { Button } from "../ui/button";
import ModalBackdrop from "./modal-backdrop";

interface AddToCartModalProps {
    productId: string;
    onAdd: () => void;
    onCancel: () => void;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ productId, onAdd, onCancel }) => {
    console.log(productId);
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none bg-black bg-opacity-50">
            <ModalBackdrop disableInteraction={false} />
            <div className="pointer-events-auto bg-white p-6 rounded-lg shadow-lg">
                {/* Modal Content */}
                <h2>Confirm Add to Cart</h2>
                <p>Are you sure you want to add this item to your cart?</p>
                <div className="flex gap-4 mt-4">
                    <Button onClick={onAdd} className="bg-blue-500 text-white">
                        Confirm
                    </Button>
                    <Button onClick={onCancel} className="bg-gray-300">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddToCartModal