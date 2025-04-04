import { Button } from "../ui/button";
import ModalBackdrop from "./modal-backdrop";

interface SuccessModalProps {
    successMessage: string;
    onCancel: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ successMessage, onCancel}) => {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none bg-black bg-opacity-50">
            <ModalBackdrop/>

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
                    className="lucide lucide-check mx-auto my-4">
                        <path 
                            d="M20 6 9 17l-5-5"
                        />
                </svg>
                <p className="text-center my-4">{successMessage}</p>

                <div className="flex gap-4 mx-auto bottom-0 mt-6">
                    <Button onClick={onCancel} className="w-full py-2 px-4 text-white rounded-lg">
                        OK
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SuccessModal