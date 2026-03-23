"use client";

import PaymentMethodsList from "../payment-methods-list";

// Update the interface to include the cardholderName
interface DbPaymentMethodDetails {
    id: string;
    expiry_month: number;
    expiry_year: number;
    card_brand: string;
    last_four: string; 
    flutterwave_id: string;
    is_default: boolean;
    card_holder: string; 
}

interface PartialMethodsProps {
    dbPaymentMethod: DbPaymentMethodDetails[];
}

const PaymentMethods: React.FC<PartialMethodsProps> = ({ dbPaymentMethod }) => {
    return (
        <div>
            <div className="p-4">
                <div className="text-center py-5 mb-5">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="30" 
                        height="30"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round" 
                        className="lucide lucide-banknote-arrow-up-icon lucide-banknote-arrow-up mx-auto"
                    >
                        <path d="M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"/>
                        <path d="M18 12h.01"/><path d="M19 22v-6"/>
                        <path d="m22 19-3-3-3 3"/><path d="M6 12h.01"/>
                        <circle cx="12" cy="12" r="2"/>
                    </svg>
                    <p className="mt-4 text-lg font-semibold">Payment Methods</p>
                </div>
                <div className="mb-6 border-2 bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-700">
                    Cards cannot be added manually right now.
                    Saved payment methods will be supported through successful checkout.
                    You can still pay with a card during checkout.
                </div>
                <PaymentMethodsList 
                    paymentMethods={dbPaymentMethod}
                    onPaymentMethodDeleted={async () => {
                        window.location.reload();
                    }}
                />
            </div>
        </div>
    );
};

export default PaymentMethods;
