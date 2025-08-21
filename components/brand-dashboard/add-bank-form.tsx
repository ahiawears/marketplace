"use client"
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SearchableSelect } from "../ui/searchable-select";
import { FormEvent, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { toast } from "sonner";
import validator from 'validator';

interface AddBankFormProps {
    onBack: () => void;
    currency: string;
    bankList: { name: string; code: string, id: number }[];
}

interface BeneficiaryAccountType {
    account_bank: string;
    account_number: string;
    beneficiary_name: string;
    currency: string;
    bank_name: string;
}

const AddBankForm = ({ onBack, currency, bankList }: AddBankFormProps) => {
    const initialBankFormData: BeneficiaryAccountType = {
        account_bank: "",
        account_number: "",
        beneficiary_name: "",
        currency: currency,
        bank_name: "",
    };
    const [bankFormData, setBankFormData] = useState<BeneficiaryAccountType>(initialBankFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleBankFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setBankFormData({
            ...bankFormData,
            [e.target.name]: e.target.value,
        });
    };

    const isFormValid = () => {
        return (
            validator.isNumeric(bankFormData.account_number) &&
            validator.trim(bankFormData.beneficiary_name).length > 0 &&
            validator.trim(bankFormData.account_bank).length > 0 &&
            validator.trim(bankFormData.bank_name).length > 0
        )
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid()) {
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/create-beneficiary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankFormData),
            });
            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                onBack();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An unexpected Error occured. Please try again.")
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <Card className="mx-auto p-4 sm:p-6 lg:p-8 border-2 shadow-lg rounded-none">
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-3xl my-4 font-bold text-gray-900 text-center">Add Payment Account</CardTitle>
                    <CardDescription className="text-md text-gray-600">
                        Please provide your business and bank details to receive payments.
                    </CardDescription>
                </div>
                <Button
                    onClick={onBack}
                    className="flex-shrink-0"
                >
                    Back
                </Button>
            </CardHeader>

            <CardContent className="py-4">
                <form className='space-y-6' onSubmit={handleSubmit}>
                    {/* Bank Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">Bank Details</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div> 
                                <Label htmlFor="account_bank">Select Bank: *</Label>
                                <SearchableSelect
                                    options={bankList}
                                    getOptionLabel={(bank) => bank.name}
                                    onSelect={(selectedBank) => {
                                        setBankFormData(prev => ({
                                            ...prev,
                                            account_bank: selectedBank.code,
                                            bank_name: selectedBank.name,
                                        }));
                                    }}
                                />                                
                            </div>
                            <div>
                                <Label htmlFor="account_number">Account Number: *</Label>
                                <Input
                                    id='account_number'
                                    name='account_number'
                                    value={bankFormData.account_number}
                                    onChange={handleBankFormChange}
                                    required
                                    type='text'
                                    className="border-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Details Section */}
                    <div className="space-y-4">
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor="beneficiary_name">Beneficiary Name: *</Label>
                                <Input
                                    id='beneficiary_name'
                                    name='beneficiary_name'
                                    value={bankFormData.beneficiary_name}
                                    onChange={handleBankFormChange}
                                    required
                                    type='text'
                                    className="border-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type='submit' 
                        className="w-full mt-6"
                        disabled={isSubmitting || !isFormValid()}
                    >
                        {isSubmitting ? "Saving..." : "Submit"}
                    </Button>       
                </form>
            </CardContent>
        </Card>
    )
}

export default AddBankForm;