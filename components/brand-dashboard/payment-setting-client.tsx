"use client";
import React, { useState } from 'react';
import AddBankForm from '@/components/brand-dashboard/add-bank-form';
import AccountsList from '@/components/brand-dashboard/brand-banks-list';
import { toast } from 'sonner';
import DeleteModal from '../modals/delete-modal';

type ComponentItems = "addBank" | "banksList";

interface PaymentSettingsClientProps {
    userId: string;
    currency: string;
    bankList: {
        id: number;
        name: string;
        code: string;
    }[];
    beneficiaryData: {
        id: string;
        beneficiary_id: number;
        beneficiary_name: string;
        bank_name: string;
        bank_code: string;
        account_number: string;
        currency: string;
        created_at: string;
    }[];
}

const PaymentSettingsClient: React.FC<PaymentSettingsClientProps> = ({
    userId,
    currency,
    bankList,
    beneficiaryData
}) => {
    const [currentComponent, setCurrentComponent] = useState<ComponentItems>("banksList");
    const [beneficiaryList, setBeneficiaryList] = useState<PaymentSettingsClientProps["beneficiaryData"]>(beneficiaryData);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<number | null>(null);

    const fetchBeneficiaries = async () => {
        try {
            const response = await fetch('/api/get-brand-beneficiary', {
                cache: 'no-store',
            })
            const data = await response.json();
            if (response.ok) {
                setBeneficiaryList(data);
            } 
        } catch(error) {
            toast.error("Failed to fetch beneficiaries. Please refresh the page.")
        }
    }

    const confirmDeletion = async () => {
        if (!beneficiaryToDelete) return;

        // Close the modal and show a loading toast
        setIsModalOpen(false);
        const deletionToastId = toast.loading("Deleting account...");

        try {
            const response = await fetch('/api/delete-beneficiary', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: beneficiaryToDelete }),
            });
            const result = await response.json();

            if (result.success) {
                toast.success(result.message, { id: deletionToastId });
                // After successful deletion, refetch the list
                fetchBeneficiaries();
            } else {
                toast.error(result.message, { id: deletionToastId });
            }
        } catch (error) {
            toast.error("An unexpected error occurred during deletion.", { id: deletionToastId });
        } finally {
            setBeneficiaryToDelete(null);
        }
    };
    
    const cancelDeletion = () => {
        setIsModalOpen(false);
        setBeneficiaryToDelete(null);
    };

    const handleDeleteBeneficiary = (beneficiaryId: number) => {
        setBeneficiaryToDelete(beneficiaryId);
        setIsModalOpen(true);
    };

    const renderComponent = () => {
        if (currentComponent === "addBank") {
            return (
                <AddBankForm
                    onBack={() => {
                        setCurrentComponent("banksList");
                        fetchBeneficiaries();
                    }}
                    currency={currency}
                    bankList={bankList}
                />
            );
        }

        if (currentComponent === "banksList") {
            return (
                <AccountsList
                    onAddBankDetails={() => setCurrentComponent("addBank")}
                    data={beneficiaryList}
                    onDeleteBeneficiary={handleDeleteBeneficiary}
                />
            );
        }
    };

    // Find the beneficiary to get their name for the modal message
    const currentBeneficiary = beneficiaryList.find(b => b.beneficiary_id === beneficiaryToDelete);
    const beneficiaryName = currentBeneficiary ? currentBeneficiary.beneficiary_name : "this account";

    return (
        <div>
            {renderComponent()}

            {isModalOpen && (
                <DeleteModal
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete the payment account for ${beneficiaryName}? This action cannot be undone.`}
                    onDelete={confirmDeletion}
                    onCancel={cancelDeletion}
                />
            )}
        </div>
    );


    return (
        <div>
            <div className='p-4'>
                {renderComponent()}
            </div>
        </div>
    );
};

export default PaymentSettingsClient;