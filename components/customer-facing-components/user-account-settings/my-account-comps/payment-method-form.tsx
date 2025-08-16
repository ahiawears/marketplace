'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select";
import { CountryData } from "@/lib/country-data";
import { CountryState } from "@/lib/country-states";
import { encryptAES } from "@/lib/encrptAes";


interface PaymentMethodFormProps {
    full_name: string;
    card_number: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
    billing_city: string;
    billing_country: string;
    billing_line1: string;
    billing_line2?: string;
    billing_postal_code: string;
    billing_state: string;
}

interface Errors {
    full_name?: string;
    card_number?: string;
    expiry_month?: string;
    expiry_year?: string;
    cvv?: string;
    billing_city?: string;
    billing_country?: string;
    billing_line1?: string;
    billing_line2?: string;
    billing_postal_code?: string;
    billing_state?: string;
}


const PaymentMethodForm = ({ onBack, onPaymentMethodAdded }: { onBack: () => void; onPaymentMethodAdded: () => void; }) => {
    const [formData, setFormData] = useState<PaymentMethodFormProps>({
        full_name: '',
        card_number: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        billing_city: '',
        billing_country: 'NG',
        billing_line1: '',
        billing_line2: '',
        billing_postal_code: '',
        billing_state: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [countryStates, setCountryStates] = useState<string[]>([]);
    
    const selectedCountry = CountryData.find(c => c.iso2 === formData.billing_country);

    // This is the encryption key from Flutterwave. You should get this from your environment variables.
    const encryptionKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_ENCRYPTION_KEY_V4; 

    // Helper to generate a 12-character random nonce
    const generateNonce = (): string => {
        return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(6)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .slice(0, 12);
    };

    useEffect(() => {
        const countryWithStates = CountryState.find(c => c.name === selectedCountry?.name);
        if (countryWithStates) {
            setCountryStates(countryWithStates.states);
        } else {
            setCountryStates([]);
        }
        setFormData(prevData => ({ ...prevData, billing_state: '' })); // Corrected field name
    }, [selectedCountry]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
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
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Validation logic...
        const newErrors: Partial<PaymentMethodFormProps> = {};
        if (!formData.full_name.trim()) newErrors.full_name = 'Required';
        if (!/^\d{16}$/.test(formData.card_number)) newErrors.card_number = 'Invalid card number';
        if (!/^\d{2}$/.test(formData.expiry_month)) newErrors.expiry_month = 'MM required';
        if (!/^\d{2}$/.test(formData.expiry_year)) newErrors.expiry_year = 'YY required';
        if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'Invalid CVV';
        if (!formData.billing_city.trim()) newErrors.billing_city = 'Required';
        if (!formData.billing_line1.trim()) newErrors.billing_line1 = 'Required';
        if (!formData.billing_postal_code.trim()) newErrors.billing_postal_code = 'Required';
        if (!formData.billing_state.trim()) newErrors.billing_state = 'Required';

        if (Object.keys(newErrors).length > 0) {
            console.log("YThe new errors are ", newErrors);
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        if (!encryptionKey) {
            console.log("Encryption key is not configured");
            setErrors(prev => ({ ...prev, general: "Encryption key is not configured." }));
            setIsSubmitting(false);
            return;
        }

        try {
            const nonce = generateNonce();
            // Encrypt sensitive data using the new function
            console.log("begin encrypting data")
            const encrypted_card_number = await encryptAES(formData.card_number, encryptionKey, nonce);
            console.log("card number encrypted")
            const encrypted_expiry_month = await encryptAES(formData.expiry_month, encryptionKey, nonce);
            const encrypted_expiry_year = await encryptAES(formData.expiry_year, encryptionKey, nonce);
            const encrypted_cvv = await encryptAES(formData.cvv, encryptionKey, nonce);

            const payload = {
                card: {
                    billing_address: {
                        city: formData.billing_city,
                        country: formData.billing_country,
                        line1: formData.billing_line1,
                        line2: formData.billing_line2 || '',
                        postal_code: formData.billing_postal_code,
                        state: formData.billing_state
                    },
                    nonce: nonce,
                    encrypted_expiry_month,
                    encrypted_expiry_year,
                    encrypted_card_number,
                    encrypted_cvv,
                    card_holder_name: formData.full_name
                },
                type: 'card'
            };
            
            // Send to your API endpoint
            const response = await fetch('/api/add-payment-method', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add payment method');
            }

            const result = await response.json();

            if (result.success) {
                setStatusMessage('Payment method added successfully!');
                onPaymentMethodAdded();
                setTimeout(() => onBack(), 1500);
            }
            
        } catch (error) {
            console.error('Error:', error);
            setErrors(prev => ({ ...prev, general: (error as Error).message || "An unexpected error occurred." }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // ... (Your form JSX remains the same) ...
        <div>
            <div className="space-y-2 my-2">
                <Button
                    onClick={onBack}
                    className="px-4 py-2 mb-4 text-white"    
                >
                    Back
                </Button>
            </div>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Card Details Section */}
                <div className="border-2 p-4">
                    <h3 className="font-medium mb-4">Card Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <Input
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                className="border-2"
                            />
                            {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Card Number</label>
                            <Input
                                name="card_number"
                                value={formData.card_number}
                                autoComplete="false"
                                onChange={handleInputChange}
                                placeholder="4242 4242 4242 4242"
                                maxLength={16}
                                className="border-2"
                            />
                            {errors.card_number && <p className="text-red-500 text-sm">{errors.card_number}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Expiry Month</label>
                                <Input
                                    name="expiry_month"
                                    value={formData.expiry_month}
                                    onChange={handleInputChange}
                                    placeholder="MM"
                                    maxLength={2}
                                    className="border-2"
                                />
                                {errors.expiry_month && <p className="text-red-500 text-sm">{errors.expiry_month}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Expiry Year</label>
                                <Input
                                    name="expiry_year"
                                    value={formData.expiry_year}
                                    onChange={handleInputChange}
                                    placeholder="YY"
                                    maxLength={2}
                                    className="border-2"
                                />
                                {errors.expiry_year && <p className="text-red-500 text-sm">{errors.expiry_year}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">CVV</label>
                            <Input
                                name="cvv"
                                type="password"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                placeholder="123"
                                maxLength={4}
                                className="border-2"
                            />
                            {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
                        </div>
                    </div>
                </div>
                {/* Billing Address Section */}
                <div className="border-2 p-4">
                    <h3 className="font-medium mb-4">Billing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Address Line 1</label>
                            <Input
                                name="billing_line1"
                                value={formData.billing_line1}
                                onChange={handleInputChange}
                                className="border-2"
                            />
                            {errors.billing_line1 && <p className="text-red-500 text-sm">{errors.billing_line1}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                            <Input
                                name="billing_line2"
                                value={formData.billing_line2}
                                onChange={handleInputChange}
                                className="border-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <Input
                                name="billing_city"
                                value={formData.billing_city}
                                className="border-2"
                                onChange={handleInputChange}
                            />
                            {errors.billing_city && <p className="text-red-500 text-sm">{errors.billing_city}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Postal Code</label>
                            <Input
                                name="billing_postal_code"
                                value={formData.billing_postal_code}
                                onChange={handleInputChange}
                                className="border-2"
                            />
                            {errors.billing_postal_code && <p className="text-red-500 text-sm">{errors.billing_postal_code}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            <Select
                                name="billing_country"
                                value={formData.billing_country}
                                onChange={handleSelectChange}
                                className="border-2 w-full p-2"
                            >
                                <option value="">Select a country</option>
                                {CountryData.map((country) => (
                                    <option key={country.iso2} value={country.iso2}>
                                        {`${country.emoji} ${country.name} (${country.iso2})`}
                                    </option>
                                ))}
                            </Select>
                            {errors.billing_country && <p className="text-red-500 text-sm mt-1">{errors.billing_country}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Region</label>
                            <Select
                                name="billing_state"
                                value={formData.billing_state}
                                onChange={handleSelectChange}
                                className="border-2 w-full p-2"
                            >
                                <option value="">
                                    {countryStates.length > 0 ? "Select a region" : "No regions available"}
                                </option>
                                {countryStates.map((stateName) => (
                                    <option value={stateName} key={stateName}>
                                        {stateName}
                                    </option>
                                ))}
                            </Select>
                            {errors.billing_state && <p className="text-red-500 text-sm">{errors.billing_state}</p>}
                        </div>
                    </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Saving...' : 'Save Payment Method'}
                </Button>
            </form>
        </div>
    );
};

export default PaymentMethodForm;