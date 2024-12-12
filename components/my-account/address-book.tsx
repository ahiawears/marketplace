"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { countries } from "@/lib/countries";
import { Button } from "../ui/button";
import { addUserAddress } from "@/actions/add-user-address";
import { UserAddressType } from "@/lib/types";
import { useRouter } from "next/navigation";

type ComponentItems = "addressList" | "addAddress";

interface DeleteAddressModalProps {
    onDelete: () => void;
    onCancel: () => void;
}

const AddressBook = () => {
    
    const [selectedCountry, setSelectedCountry] = useState("");
    const [countryName, setCountryName] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
    const [currentComponent, setCurrentComponent] = useState<ComponentItems>("addressList");
    const [addressData, setAddressData] = useState<UserAddressType[]>([]);


    useEffect(() => {
        const fetchUserDetails = async () => {
			try {
				const response = await fetch('/api/getUserDetails');
				const data = await response.json();

				if (response.ok && data.data) {
					setFirstName(data.data.first_name || '');
					setLastName(data.data.last_name || '');
				} else {
					console.error("Failed to fetch user details:", data.error);
				}
			} catch (error) {
				console.error("Error fetching user details:", error);
			}
		};
		fetchUserDetails();
    }, []);

    const fetchUserAddresses = async () => {
        try {
            const response = await fetch('/api/getUserAddresses');
            const { data: uAddress} = await response.json();

            if(!response.ok) throw new Error("Failed to fetch user addresses");

            const addressItems = uAddress.map((address: UserAddressType) => ({
                ...address,
            }));
            setAddressData(addressItems)
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    }

    useEffect(() => {
        fetchUserAddresses();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(event.target.value); 
        const country = countries.find((c) => c.id === selectedId); 
    
        if (country) {
            setSelectedCountry(String(selectedId)); 
            setCountryName(country.name);
            setCountryCode(country.code);
        }
    
        console.log(selectedId); 
    };

    const renderComponent = () => {
        if (currentComponent === "addressList") {
            return (
                <UserAddresses 
                    onAddAddress={() => setCurrentComponent("addAddress")} 
                    addressInfo={addressData}
                    onAddressAdded={fetchUserAddresses} 
                />
            )
        }
        if (currentComponent === "addAddress") {
            return (
                <AddressForm
                    selectedCountry={selectedCountry}
                    countryCode={countryCode}
                    handleChange={handleChange}
                    firstName={firstName}
                    lastName={lastName}
                    countryName={countryName}
                    onBack={() => setCurrentComponent("addressList")}
                    onAddressAdded={fetchUserAddresses}
                />
            );
        }
    };

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
                        className="lucide lucide-map-pin-house mx-auto"
                    >
                        <path 
                            d="M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z" 
                        />
                        <path 
                            d="M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2" 
                        />
                        <path 
                            d="M18 22v-3" 
                        />
                        <circle 
                            cx="10" 
                            cy="10" 
                            r="3" 
                        />
                    </svg>
                    <p className="mt-4 text-lg font-semibold">Address Book</p>
                </div>
                {renderComponent()}
            </div>
        </div>
    );
};

const UserAddresses = ({ onAddAddress, addressInfo, onAddressAdded, }: { onAddAddress: () => void; addressInfo: UserAddressType[]; onAddressAdded: () => void; }) => {  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressIdToDelete, setAddressIdToDelete] = useState<string | null>(null);

    
    const handleDeleteClick = (addressId: string) => {
        setAddressIdToDelete(addressId);
        setIsModalOpen(true); 
    };
    
    const handleDelete = async () => {
        if (addressIdToDelete) {
            try {
                const response = await fetch(`/api/deleteAddress/${addressIdToDelete}`, {method: "DELETE",});
                if (response.ok) {
                    console.log("Address deleted successfully");
                    onAddressAdded();
                } else {
                    console.error("Failed to delete address");
                }
            } catch (error) {
                console.error("Error deleting address:", error);
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
        <div>
            <div className="space-y-4 md:w-full">
                <Button
                    onClick={onAddAddress}
                    className="px-4 py-2 mb-4 text-white rounded float-left"
                >
                    Add New Address
                </Button>
                {/* Example card structure */}
                {addressInfo.map((uAddress) => (
                    <div key={uAddress.id} className="border p-4 rounded shadow-md flex justify-between items-center md:w-full">
                        <div>
                            <p >{uAddress.address}</p>
                            <p >{uAddress.city + ", " + uAddress.county}</p>
                            <p>{uAddress.post_code}</p>
                            <p>{uAddress.country}</p>
                            <p>{uAddress.country_code + " " + uAddress.mobile}</p>
                        </div>
                        <div className="flex space-x-2">
                            <Button className="p-2 rounded hover:bg-lime-400">
                                Edit
                            </Button>
                            <Button
                                onClick={() => handleDeleteClick(uAddress.id)} 
                                className="p-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </Button>
                            {isModalOpen && (
                                <DeleteAddressModal onDelete={handleDelete} onCancel={handleCancel} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DeleteAddressModal: React.FC<DeleteAddressModalProps> = ({ onDelete, onCancel }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                <h2 className="text-lg font-semibold mb-4">Delete Address</h2>
                <p className="mb-6">Are you sure you want to delete this address?</p>
                <div className="flex justify-end space-x-4">
                    <Button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

const AddressForm = ({ selectedCountry, countryCode, handleChange, firstName, lastName, countryName, onBack, onAddressAdded, }: { selectedCountry: string; countryCode: string; handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; firstName: string; lastName: string;countryName: string; onBack: () => void; onAddressAdded: () => void; }) => {
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        formData.append("countryName", countryName);

        const response = await addUserAddress(formData);
        if (response.error) {
            console.error(response.error);
            alert("Failed to save address: " + response.error);
        } else {
            onAddressAdded();
        }
        onBack();
    };

    return (
        <div>
            <Button
                onClick={onBack}
                className="px-4 py-2 mb-4 text-white rounded float-left"
            >
                Back
            </Button>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor="firstname"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        First Name:*
                    </label>
                    <Input
                        id="firstname"
                        name="firstname"
                        value={firstName}
                        type="text"
                        readOnly
                        required
                        className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="lastname"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        Last Name:*
                    </label>
                    <Input
                        id="lastname"
                        name="lastname"
                        value={lastName}
                        type="text"
                        readOnly
                        required
                        className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                    />
                </div>
                <div>
                    <label
                        htmlFor="mobile"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        Country:*
                    </label>
                    <div className="space-y-6">
                        <Select
                            id="country"
                            name="country"
                            value={selectedCountry}
                            onChange={handleChange}
                            className="text-muted-foreground block border-l border-gray-300 bg-transparent md:w-1/2"
                        >
                            <option value="" disabled>
                                Select
                            </option>
                            {countries.map((country) => (
                                <option key={`${country.code}-${country.name}`} value={country.id}>
                                    {`${country.flag} ${country.name} ${country.code}`}
                                </option>
                            ))}
                        </Select>
                        <div className="flex items-center border border-gray-300 rounded-md md:w-1/2">
                            <Input
                                id="countryCode"
                                name="countryCode"
                                type="tel"
                                value={countryCode}
                                readOnly
                                required
                                className="text-center block border-l border-gray-300 p-2 text-gray-900 bg-transparent w-1/5"
                            />                        
                            <Input
                                id="mobile"
                                name="mobile"
                                type="tel"
                                required
                                className="block border-l border-gray-300 p-2 text-gray-900 bg-transparent w-10/12"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="postCode"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        Post Code :*
                    </label>
                    <Input
                        id="postCode"
                        name="postCode"
                        type="text"
                        required
                        className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                    />
                </div>
                <div>
                    <label
                        htmlFor="county"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        County :*
                    </label>
                    <Input
                        id="county"
                        name="county"
                        type="text"
                        required
                        className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                    />
                </div>
                
                <div>
                    <label
                        htmlFor="city"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        City :*
                    </label>
                    <Input
                        id="city"
                        name="city"
                        type="text"
                        required
                        className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="address"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        Address:*
                    </label>
                    <Input
                        id="address"
                        name="address"
                        type="text"
                        required
                        className="block w-full rounded-md border border-gray-300 p-2 text-gray-900 bg-transparent md:w-1/2"
                    />
                </div>

                <Button
                    type="submit"
                    className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:w-2/3"
                >
                    Save Address
                </Button>
            </form>
        </div>
    );
    
};

export default AddressBook;
