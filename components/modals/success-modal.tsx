import { Button } from "../ui/button";
import ModalBackdrop from "./modal-backdrop";

interface SuccessModalProps {
    productName: string;
    successMessage: string;
    onCancel: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({productName, successMessage, onCancel}) => {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none bg-black bg-opacity-50">
            <ModalBackdrop disableInteraction={false}/>

            <div className="pointer-events-auto bg-white p-6 rounded-lg shadow-lg w-1/3">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-check">
                        <path 
                            d="M20 6 9 17l-5-5"
                        />
                </svg>
                <p>{productName} {successMessage}</p>

                <div className="flex gap-4 float-right bottom-0">
                        
                    <Button onClick={onCancel} className="bg-gray-300">
                        OK
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SuccessModal