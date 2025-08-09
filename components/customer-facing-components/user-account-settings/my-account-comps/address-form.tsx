'use client';

import { Input } from "../../../ui/input";
import { Select } from "../../../ui/select";
import { Button } from "../../../ui/button";
import { addUserAddress } from "@/actions/user-actions/my-account/add-user-address";
import React, { useState, useEffect } from "react";
import { trim } from "validator";
import { CountryState, CountryStatesType } from "@/lib/country-states";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { isValidPhoneNumber } from 'react-phone-number-input/input';

interface UserAddressProps {
    firstName: string;
    lastName: string;
    country: string;
    region: string; 
    city: string;
    county: string;
    address: string;
    mobile: string;
    postCode: string;
}

interface Errors {
    firstName?: string;
    lastName?: string;
    country?: string;
    region?: string;
    city?: string;
    county?: string;
    address?: string;
    mobile?: string;
    postCode?: string;
}

const AddressForm = ({ onBack, onAddressAdded }: { onBack: () => void; onAddressAdded: () => void; }) => {
    const [formData, setFormData] = useState<UserAddressProps>({
        firstName: '',
        lastName: '',
        country: '',
        region: '',
        city: '',
        county: '',
        address: '',
        mobile: '',
        postCode: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [countryStates, setCountryStates] = useState<string[]>([]);
    const selectedCountry = CountryData.find(c => c.iso2 === formData.country);
    const countryCode = selectedCountry ? selectedCountry.phonecode : '';

    useEffect(() => {
        const countryWithStates = CountryState.find(c => c.name === selectedCountry?.name);
        if (countryWithStates) {
            setCountryStates(countryWithStates.states);
        } else {
            setCountryStates([]);
        }
        setFormData(prevData => ({ ...prevData, region: '' }));
    }, [selectedCountry]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        // Clear error when user types
        if (errors[name as keyof Errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        if (errors[name as keyof Errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;
        const newErrors: Errors = {};

        // Check all required fields
        if (!trim(formData.firstName)) {
            newErrors.firstName = "First name is required";
            isValid = false;
        }

        if (!trim(formData.lastName)) {
            newErrors.lastName = "Last name is required";
            isValid = false;
        }

        if (!trim(formData.country)) {
            newErrors.country = "Country is required";
            isValid = false;
        }

        if (!trim(formData.region)) {
            newErrors.region = "Region is required";
            isValid = false;
        }

        if (!trim(formData.city)) {
            newErrors.city = "City is required";
            isValid = false;
        }

        if (!trim(formData.county)) {
            newErrors.county = "County is required";
            isValid = false;
        }

        if (!trim(formData.address)) {
            newErrors.address = "Address is required";
            isValid = false;
        }

        if (!trim(formData.postCode)) {
            newErrors.postCode = "Post code is required";
            isValid = false;
        }

        // Validate mobile number
        if (!trim(formData.mobile)) {
            newErrors.mobile = "Mobile number is required";
            isValid = false;
        } else if (formData.country) {
            const fullMobileNumber = `+${countryCode}${formData.mobile}`;
            if (!isValidPhoneNumber(fullMobileNumber)) {
                newErrors.mobile = "Invalid mobile number format";
                isValid = false;
            }
        } else {
            // If country isn't selected but mobile is entered
            newErrors.mobile = "Please select country first";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage('');

        // Validate form before submission
        if (!validateForm()) {
            setIsSubmitting(false);
            setStatusMessage('Please correct the errors in the form');
            return;
        }

        // Prepare form data
        const form = new FormData();
        form.append('firstName', trim(formData.firstName));
        form.append('lastName', trim(formData.lastName));
        form.append('country', formData.country);
        form.append('region', formData.region); 
        form.append('countryName', selectedCountry?.name || '');
        form.append('countryCode', countryCode);
        form.append('mobile', trim(formData.mobile));
        form.append('postCode', trim(formData.postCode));
        form.append('county', trim(formData.county));
        form.append('city', trim(formData.city));
        form.append('address', trim(formData.address));

        
        try {
            const response = await addUserAddress(form);

            if (response.success) {
                setStatusMessage('Address added successfully!');
                onAddressAdded();
                setTimeout(() => onBack(), 1500);
            } else {
                if (response.errors) {
                    const serverErrors: Errors = {};
                    Object.entries(response.errors).forEach(([key, value]) => {
                        if (value && Array.isArray(value) && value.length > 0) {
                            serverErrors[key as keyof Errors] = value[0];
                        } else {
                            serverErrors[key as keyof Errors] = "Invalid value";
                        }
                    });
                    setErrors(serverErrors);
                }
                setStatusMessage(response.message || 'Failed to save address.');
            }
        } catch (error) {
            console.error(error);
            setStatusMessage('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="space-y-2 my-2">
                <Button
                    onClick={onBack}
                    className="px-4 py-2 mb-4 text-white"
                >
                    Back
                </Button>
                <p>
                    Add a new address to your account for future deliveries.
                </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {/* First Name */}
                <div>
                    <label htmlFor="firstName" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        First Name:*
                    </label>
                    <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        type="text"
                        className="block w-full rounded-md border-2 p-2 text-gray-900 bg-transparent"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                    <label htmlFor="lastName" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        Last Name:*
                    </label>
                    <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        type="text"
                        className="block w-full rounded-md border-2 p-2 text-gray-900 bg-transparent "
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                {/* Country */}
                <div>
                    <label htmlFor="country" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        Country:*
                    </label>
                    <Select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleSelectChange}
                        className="text-muted-foreground block border-2 bg-transparent"
                    >
                        <option value="">Select a country</option>
                        {CountryData.map((country) => (
                            <option key={country.iso2} value={country.iso2}>
                                {`${country.emoji} ${country.name} (${country.iso2})`}
                            </option>
                        ))}
                    </Select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                    <label htmlFor="mobile" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        Mobile Number:*
                    </label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="countryCode"
                            name="countryCode"
                            type="tel"
                            value={"+" + countryCode}
                            readOnly
                            className="text-center block border-2 p-2 text-gray-900 bg-transparent w-1/5"
                        />                        
                        <Input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            className="block border-2 p-2 text-gray-900 bg-transparent w-full"
                        />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                </div>

                {/* Region */}
                <div>
                    <label htmlFor="region" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        Region:*
                    </label>
                    <Select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleSelectChange}
                        disabled={!formData.country || countryStates.length === 0}
                        className="text-muted-foreground block border-2 bg-transparent"
                    >
                        <option value="">
                            {countryStates.length > 0 ? "Select a region" : "No regions available"}
                        </option>
                        {countryStates.map((stateName) => (
                            <option key={stateName} value={stateName}>
                                {stateName}
                            </option>
                        ))}
                    </Select>
                    {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                </div>
                
                {/* Post Code */}
                <div>
                    <label htmlFor="postCode" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        Post Code:*
                    </label>
                    <Input
                        id="postCode"
                        name="postCode"
                        type="text"
                        value={formData.postCode}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-2 p-2 text-gray-900 bg-transparent"
                    />
                    {errors.postCode && <p className="text-red-500 text-sm mt-1">{errors.postCode}</p>}
                </div>

                {/* County */}
                <div>
                    <label htmlFor="county" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        County:*
                    </label>
                    <Input
                        id="county"
                        name="county"
                        type="text"
                        value={formData.county}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-2 p-2 text-gray-900 bg-transparent"
                    />
                    {errors.county && <p className="text-red-500 text-sm mt-1">{errors.county}</p>}
                </div>
                
                {/* City */}
                <div>
                    <label htmlFor="city" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        City:*
                    </label>
                    <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-2 p-2 text-gray-900 bg-transparent "
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* Address */}
                <div>
                    <label htmlFor="address" className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        Address:*
                    </label>
                    <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-2 p-2 text-gray-900 bg-transparent"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xl "
                >
                    {isSubmitting ? 'Saving...' : 'Save Address'}
                </Button>
            </form>
            {statusMessage && (
                <p className={`mt-4 text-sm text-center font-medium ${
                    statusMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'
                }`}>
                    {statusMessage}
                </p>
            )}
        </div>
    );
};

export default AddressForm;