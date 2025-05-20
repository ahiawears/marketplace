import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

interface AccountsListProps {
    onAddBankDetails: () => void;
}

const AccountsList = ({ onAddBankDetails }: AccountsListProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className='space-y-4 md:w-full'>
                <Button
                    onClick={onAddBankDetails}
                    className="px-4 py-2 mb-4 text-white rounded float-left"
                >
                    Add New Bank Details
                </Button>
                {/* You would typically list the existing bank accounts here */}
                {/* For example: */}
                {/* <ul>
                    <li>Bank Name: Example Bank, Account Number: *******1234</li>
                    <li>Bank Name: Another Bank, Account Number: *******5678</li>
                    </ul> */}
                <div>
                    <p>No bank accounts added yet.</p>
                </div>
            </div>
        </div>
    );
};

export default AccountsList;