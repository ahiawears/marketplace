import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, BanknoteIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AccountsListProps {
    onAddBankDetails: () => void;
    data: {
        id: string;
        beneficiary_id: number;
        beneficiary_name: string;
        bank_name: string;
        bank_code: string;
        account_number: string;
        currency: string;
        created_at: string;
    }[];
    onDeleteBeneficiary: (beneficiaryId: number) => void;

}

const ClientFormattedDate = ({ dateString }: { dateString: string }) => {
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        // This code runs only on the client side
        setFormattedDate(new Date(dateString).toLocaleDateString());
    }, [dateString]);

    // Render a loading state or the final date
    return <>{formattedDate || '...'}</>;
};


const AccountsList = ({ onAddBankDetails, data, onDeleteBeneficiary }: AccountsListProps) => {

    return (
        <div className="container mx-auto border-2 p-4 sm:p-6 lg:p-8">
            <div className="justify-between items-center my-6">
                <h1 className="text-3xl font-bold text-gray-900 my-4">Payment Accounts</h1>
                <Button onClick={onAddBankDetails} className=" text-white transition-colors duration-200">
                    Add New Bank Details
                </Button>
            </div>

            {data.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 border-2 shadow-inner">
                    <BanknoteIcon className="h-12 w-12 mx-auto" />
                    <p className="mt-4 text-lg text-gray-600">No bank accounts added yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Click the button above to add your first payment account.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((beneficiary) => (
                        <Card key={beneficiary.id} className="relative overflow-hidden group hover:shadow-lg border-2 transition-shadow duration-300 rounded-none">
                            <CardHeader className="bg-gray-50 p-4 border-b-2">
                                <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                                    <span className="truncate">{beneficiary.bank_name}</span>
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600">
                                    Account Number: <span className="font-mono">{beneficiary.account_number}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-700">
                                    <p className="mt-1 font-semibold">{beneficiary.beneficiary_name}</p>
                                    <span className="ml-auto text-sm font-medium text-gray-500">{beneficiary.currency}</span>

                                </div>
                                <div className="text-sm text-gray-500 mt-4">
                                    Added on: <ClientFormattedDate dateString={beneficiary.created_at} />
                                </div>
                            </CardContent>

                            {/* Action Buttons */}
                            <div className="absolute top-0 right-0 p-2 flex space-x-2 transition-opacity duration-300">
                                
                                <Button size="icon" variant="ghost" className="hover:text-gray-500" onClick={() => onDeleteBeneficiary(beneficiary.beneficiary_id)}>
                                    <Trash2 className="h-12 w-12" size={24}/>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccountsList;