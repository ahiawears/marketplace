"use client";

import { Button } from "@/components/ui/button";
import { useState } from 'react';
import DeleteAddressModal from "@/components/modals/delete-address-modal";

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

            {/* Address List */}
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

                            {/* Right-aligned action buttons */}
                            <div className="flex space-x-2 self-end md:self-center">
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
                <DeleteAddressModal 
                    onDelete={handleDelete} 
                    onCancel={handleCancel} 
                />
            )}
        </div>
    );
};

export default AddressList;