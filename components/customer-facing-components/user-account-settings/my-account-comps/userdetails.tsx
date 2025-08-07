"use client";

import { updateUserMetaDetails } from '@/actions/user-auth/update-user-meta-details';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { FormEvent, useEffect, useState } from 'react';

interface UserDetailsProps {
    firstName: string;
    lastName: string;
    email: string;
    email_verified: boolean;
}

interface Errors {
    firstName?: string;
    lastName?: string;
}

const Userdetails: React.FC<{ userDetails: UserDetailsProps }> = ({ userDetails }) => {
    const [formData, setFormData] = useState<UserDetailsProps>(userDetails);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errors, setErrors] = useState<Errors>({});

    // Use a useEffect to keep local state in sync with props
    useEffect(() => {
        setFormData(userDetails);
        // Reset dirty state when props change
        setIsDirty(false);
        setStatusMessage('');
    }, [userDetails]);

    // Function to handle changes in form inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));

        // Check if the form data has changed from the initial props
        const hasChanged = value !== userDetails[name as keyof UserDetailsProps];
        setIsDirty(hasChanged);

        // Clear errors for the field being edited
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// const form = new FormData();
		// form.append('firstName', formData.firstName);
		// form.append('lastName', formData.lastName);
		const newErrors: Errors = {};
        if (!formData.firstName) {
            newErrors.firstName = "First name is required";
        }
        if (!formData.lastName) {
            newErrors.lastName = "Last name is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }
		setIsSubmitting(true);
		setStatusMessage('Updating...');

		// Create a new FormData object to pass to the server action
        const dataToSend = new FormData();
        dataToSend.append('firstName', formData.firstName);
        dataToSend.append('lastName', formData.lastName);
		
		try {
			const result = await updateUserMetaDetails(dataToSend);
			
			// Ensure we're working with plain objects
			const plainResult = JSON.parse(JSON.stringify(result));
			
			if (plainResult.success) {
				setStatusMessage(plainResult.message || 'Details updated successfully!');
				setIsDirty(false);
			} else {
				if (plainResult.errors) {
					setErrors(plainResult.errors);
					setStatusMessage('Validation failed. Please check the fields.');
				} else if (plainResult.message) {
					setStatusMessage(plainResult.message);
				}
			}
		} catch (error) {
			console.error(`Failed to update user details: ${error}`);
			setStatusMessage('Failed to update details. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

    return (
        <div className='p-4'>
            <div className="text-center py-5 mb-5">
                {/* SVG Icon */}
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
                    className="lucide lucide-book-user mx-auto"
                >
                    <path d="M15 13a3 3 0 1 0-6 0" />
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                    <circle cx="12" cy="8" r="2" />
                </svg>
                {/* Title */}
                <p className="mt-4 text-lg font-semibold">My Details</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor="firstName"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        First Name:*
                    </label>
                    <div>
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="block w-full border-2 p-2 text-gray-900 bg-transparent md:w-1/2"
                        />
						{errors.firstName && (
                            <p className="py-1 text-red-500 text-sm/6">
                                {errors.firstName}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="lastName"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        Last Name:*
                    </label>
                    <div>
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="block w-full border-2 p-2 text-gray-900 bg-transparent md:w-1/2"
                        />
						{errors.lastName && (
                            <p className="py-1 text-red-500 text-sm/6">
                                {errors.lastName}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        Email Address:*
                    </label>
                    <div>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            readOnly
                            className="block w-full border-2 p-2 text-gray-900 bg-transparent md:w-1/2"
                        />
                    </div>
                </div>

                <div className="text-sm">
                    <Button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Fields'}
                    </Button>
                </div>
            </form>
            {statusMessage && <p className="mt-4 text-sm text-center font-medium">{statusMessage}</p>}
        </div>
    );
};

export default Userdetails;
