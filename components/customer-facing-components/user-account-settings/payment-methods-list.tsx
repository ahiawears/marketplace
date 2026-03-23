import { Button } from "@/components/ui/button";
import { useState } from 'react';
import Image from 'next/image';
import DeleteModal from "@/components/modals/delete-modal";

interface PaymentMethodDetails {
    id: string;
    expiry_month: number;
    expiry_year: number;
    card_brand: string;
    last_four: string; 
    flutterwave_id: string;
    is_default: boolean;
    card_holder?: string; 
}

interface PaymentMethodsProps {
    paymentMethods: PaymentMethodDetails[];
    onPaymentMethodDeleted: () => void;
}

const PaymentMethodsList = ({ paymentMethods, onPaymentMethodDeleted }: PaymentMethodsProps) => {
    const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdatingDefault, setIsUpdatingDefault] = useState<string | null>(null);
    const paymentMethodsLogos = [
        "/images/paymentMethods/afrigo.png",
        "/images/paymentMethods/verve.png",
        "/images/paymentMethods/visa.png",
        "/images/paymentMethods/mastercard.png",
        "/images/paymentMethods/amex.png"
    ];

    const networkLogoMap: { [key: string]: string } = {
        "VISA": "/images/paymentMethods/visa.png",
        "MASTERCARD": "/images/paymentMethods/mastercard.png",
        "VERVE": "/images/paymentMethods/verve.png",
        "AFRIGO": "/images/paymentMethods/afrigo.png",
        "AMEX": "/images/paymentMethods/amex.png",
    };

    const handleDeleteClick = (methodId: string) => {
        setMethodToDelete(methodId);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (methodToDelete) {
            try {
                const response = await fetch(`/api/deletePaymentMethod/${methodToDelete}`, {
                    method: "Delete",
                });
                if (response.ok) {
                    onPaymentMethodDeleted();
                }
            } finally {
                setIsModalOpen(false);
                setMethodToDelete(null);
            }
        }
    }

    const handleCancel = () => {
        setIsModalOpen(false);
        setMethodToDelete(null);
    };

    const handleSetDefault = async (paymentMethodId: string) => {
        try {
            setIsUpdatingDefault(paymentMethodId);
            const response = await fetch("/api/set-default-payment-method", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ paymentMethodId }),
            });

            if (response.ok) {
                onPaymentMethodDeleted();
            }
        } finally {
            setIsUpdatingDefault(null);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-6 space-y-3 flex flex-col justify-center">
                <div className="flex flex-row justify-center items-center space-x-2">
                    <p>We Accept:</p>
                    {paymentMethodsLogos.map((logoPath, index) => (
                        <div key={index} className="w-10 h-8 relative">
                            <Image
                                src={logoPath}
                                alt="Payment method logo"
                                layout="fill"
                                objectFit="contain"
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            /> 
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                    <div className="border-2 p-4 shadow-md text-center">
                        <p>No payment methods saved yet</p>
                    </div>
                ) : (
                    paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            className="border-2 p-4 shadow-xl flex flex-col md:flex-row justify-between gap-4"
                        >
                            <div className="flex-1 space-y-1 text-left">
                                {networkLogoMap[method.card_brand] && (
                                    <div className="w-10 h-8 relative">
                                        <Image
                                            src={networkLogoMap[method.card_brand]}
                                            alt={`${method.card_brand} logo`}
                                            layout="fill"
                                            objectFit="contain"
                                            priority={true}
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                    </div>
                                )}
                                {method.is_default && (
                                    <span className="inline-flex w-fit border border-stone-900 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-900">
                                        Default
                                    </span>
                                )}
                                <p>Ending in {method.last_four}</p>
                                <p>{method.card_holder}</p>
                                <p>{method.expiry_month}/{method.expiry_year}</p>
                            </div>
                            <div className="flex space-x-2 self-end md:self-center">
                                {!method.is_default && (
                                    <Button
                                        className="border-2"
                                        onClick={() => handleSetDefault(method.id)}
                                        disabled={isUpdatingDefault === method.id}
                                    >
                                        {isUpdatingDefault === method.id ? "Updating..." : "Set Default"}
                                    </Button>
                                )}
                                <Button
                                    className="border-2"
                                    onClick={() => handleDeleteClick(method.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <DeleteModal
                    title="Delete Payment Method"
                    message="Are you sure you want to delete this payment method?"
                    onDelete={handleDelete}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default PaymentMethodsList;
