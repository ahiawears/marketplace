"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { countries } from "@/lib/countries";
import { Button } from "../ui/button";
import { addUserAddress } from "@/actions/add-user-address";

const AddressBook = () => {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [countryName, setCountryName] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');

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
                <AddressForm 
                    selectedCountry={selectedCountry}
                    countryCode={countryCode}
                    handleChange={handleChange}
                    firstName={firstName}
                    lastName={lastName}
                    countryName={countryName}
                />
            </div>
        </div>
    );
};

const AddressForm = ({ selectedCountry, countryCode, handleChange, firstName, lastName, countryName}: { selectedCountry: string; countryCode: string; handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; firstName: string; lastName: string;countryName: string;}) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        formData.append("countryName", countryName);

        await addUserAddress(formData);
    };
    return (
        <div>
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
