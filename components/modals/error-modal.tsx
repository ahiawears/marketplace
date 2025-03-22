import React from "react";
import ModalBackdrop from "./modal-backdrop";
import { Button } from "../ui/button";

interface ErrorModalProps {
  message: string; 
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {  
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50 px-4">
            <ModalBackdrop/>

            <div className="bg-red-400 p-6 rounded shadow-md w-full md:w-1/2 lg:w-1/2">

                <div className="">
                    <svg 
                        width="60" 
                        height="60" 
                        viewBox="0 0 577 577" 
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto"
                    >
                        <path 
                            d="M288.5 496C404.204 496 498 398.622 498 278.5C498 158.378 404.204 61 288.5 61C172.796 61 79 158.378 79 278.5C79 398.622 172.796 496 288.5 496Z" 
                            fill="bg-red-400" 
                            stroke="white" 
                            strokeWidth="20" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                        <path 
                            d="M360.625 208.875L216.375 348.125" 
                            stroke="white" 
                            strokeWidth="30" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                        <path 
                            d="M216.375 208.875L360.625 348.125" 
                            stroke="white" 
                            strokeWidth="30" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="w-full py-3">
                    <p className="text-center text-2xl text-white">Uh oh, something went wrong!</p>
                </div>
                
                <div className="flex gap-3 w-full m-auto">
                    
                    <div className=" m-auto">
                        
                        <p className="text-white">
                            {message}
                        </p>
                    </div>
                    
                </div>
                <Button
                    className="mt-6 px-4 py-2 float-right bg-red-500 text-white rounded hover:bg-red-500"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div> 
        </div>
    );
};

export default ErrorModal;
