"use client";

import { Button } from "@/components/ui/button";
import { useState } from 'react';
import DeleteModal from "@/components/modals/delete-modal";

interface UserAddressDetails {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    county: string;
    region: string;
    country: string;
    post_code: string;
    country_code: string;
    mobile: string;
    created_at: string;
    is_default: boolean;
}

interface AddressListProps {
    addresses: UserAddressDetails[];
    onAddAddress: () => void;
    onAddressDeleted: () => void;
}

const AddressList = ({ addresses, onAddAddress, onAddressDeleted }: AddressListProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressIdToDelete, setAddressIdToDelete] = useState<string | null>(null);
    const [isUpdatingDefault, setIsUpdatingDefault] = useState<string | null>(null);

    const handleDeleteClick = (addressId: string) => {
        setAddressIdToDelete(addressId);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (addressIdToDelete) {
            try {
                const response = await fetch(`/api/deleteAddress/${addressIdToDelete}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    onAddressDeleted();
                }
            } finally {
                setIsModalOpen(false);
                setAddressIdToDelete(null);
            }
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setAddressIdToDelete(null);
    };

    const handleSetDefault = async (addressId: string) => {
        try {
            setIsUpdatingDefault(addressId);
            const response = await fetch("/api/set-default-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ addressId }),
            });

            if (response.ok) {
                onAddressDeleted();
            }
        } finally {
            setIsUpdatingDefault(null);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-6">
                <Button
                    onClick={onAddAddress}
                    className="px-4 py-2 text-white"
                >
                    Add New Address
                </Button>
            </div>

            <div className="space-y-4">
                {addresses.length === 0 ? (
                    <div className="border p-4 rounded shadow-md text-center">
                        <p>No addresses saved yet</p>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div 
                            key={address.id} 
                            className="border-2 p-4 shadow-xl flex flex-col md:flex-row justify-between gap-4"
                        >
                            <div className="flex-1 space-y-2 text-left">
                                <h3 className="font-medium text-lg">
                                    {address.first_name} {address.last_name}
                                </h3>
                                {address.is_default && (
                                    <span className="inline-flex w-fit border border-stone-900 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-900">
                                        Default
                                    </span>
                                )}
                                
                                <div className="space-y-1">
                                    <p className="text-gray-800">{address.address}</p>
                                    <p className="text-gray-700">
                                        {[address.city, address.county, address.region]
                                          .filter(Boolean)
                                          .join(', ')}
                                    </p>
                                    <p className="text-gray-700">
                                        {address.post_code} {address.country}
                                    </p>
                                </div>
                                
                                <p className="text-sm text-gray-600">
                                    Phone: +{address.country_code} {address.mobile}
                                </p>
                            </div>

                            <div className="flex space-x-2 self-end md:self-center">
                                {!address.is_default && (
                                    <Button
                                        className="border-2"
                                        disabled={isUpdatingDefault === address.id}
                                        onClick={() => handleSetDefault(address.id)}
                                    >
                                        {isUpdatingDefault === address.id ? "Updating..." : "Set Default"}
                                    </Button>
                                )}
                                <Button
                                    className="border-2"
                                    onClick={() => handleDeleteClick(address.id)}
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
                    title="Delete Address"
                    message="Are you sure you want to delete this address?"
                    onDelete={handleDelete} 
                    onCancel={handleCancel} 
                />
            )}
        </div>
    );
};

export default AddressList;
