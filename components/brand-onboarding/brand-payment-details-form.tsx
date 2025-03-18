import { BrandOnboarding } from "@/lib/types";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { SearchableSelect } from "../ui/searchable-select";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import LoadContent from "@/app/load-content/page";
import { Select } from "../ui/select";
import { brandCountries } from "@/lib/countries";
import ModalBackdrop from "../modals/modal-backdrop";
import ErrorModal from "../modals/error-modal";

type BrandPaymentData = BrandOnboarding['paymentInformation'];

interface BrandPaymentProps {
    data: BrandPaymentData;
    onDataChange: (data: BrandPaymentData, isValid: boolean) => void;
}

const BrandPaymentDetailsForm = ({ data, onDataChange }: BrandPaymentProps) => {
    const [accountNumber, setAccountNumber] = useState<string>(data.account_number);
    const [businessName, setBusinessName] = useState<string>(data.business_name);
    const [businessEmail, setBusinessEmail] = useState<string>(data.business_email);
    const [businessMobile, setBusinessMobile] = useState<string>(data.business_mobile);
    const [businessContact, setBusinessContact] = useState<string>(data.business_contact);
    const [businessContactMobile, setBusinessContactMobile] = useState<string>(data.business_contact_mobile);
    const [country, setCountry] = useState<string>(data.country);
    const [bankList, setBankList] = useState([]);
    const [selectedCountryName, setSelectedCountryName] = useState<string>("");

    const [selectedBank, setSelectedBank] = useState<string>(data.account_bank);
    const [selectedBankName, setSelectedBankName] = useState<string>(data.bank_name);
    const [selectedBankObject, setSelectedBankObject] = useState<{ name: string; code: string } | null>(null);


    const [errorMessage, setErrorMessage] = useState("");

    // const {userId, userSession, loading, error, resetError} = useAuth();

    // if (loading) {
    //     return <LoadContent />
    // }

    // if (error) {
    //     setErrorMessage(error.message || "Something went wrong, please try again.");
    // }

    // if (!userId) {
    //     redirect("/login-brand");
    // }

    useEffect(() => {
        if (data.country !== "") {
            setCountry(data.country);
            const countryData = brandCountries.find((c) => c.alpha2 === data.country);
            if (countryData) {
                setSelectedCountryName(countryData.name);
            }
        }
        setBusinessEmail(data.business_email);
        setBusinessMobile(data.business_mobile);
        setBusinessName(data.business_name);
    }, [data.country, data.business_email, data.business_mobile, data.business_name]);

    useEffect(() => {
        if (bankList.length > 0 && data.account_bank) {
            const foundBank = bankList.find((bank: any) => bank.code === data.account_bank);
            if (foundBank) {
                setSelectedBankObject(foundBank || null);
            } 
        }
    }, [bankList, data.account_bank]);

    useEffect(() => {
        setSelectedBank(data.account_bank);
    }, [data.account_bank]);

    useEffect(() => {
        const isValid = accountNumber.length > 0 && businessName.length > 0 && businessEmail.length > 0 && businessMobile.length > 0 && businessContact.length > 0 && businessContactMobile.length > 0;
        onDataChange({
            ...data,
            account_number: accountNumber,
            business_name: businessName,
            business_email: businessEmail,
            business_mobile: businessMobile,
            business_contact: businessContact,
            business_contact_mobile: businessContactMobile,
            country: country,
            account_bank: selectedBank,
            bank_name: selectedBankName,

        }, isValid);
    }, [accountNumber, businessName, businessEmail, businessMobile, businessContact, businessContactMobile, country]);

    useEffect(() => {
        if (country !== "") {
            const getBankLists = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-countries-banklist?selectedCountry=${country}`,
                        {
                            method: 'GET', 
                            headers: {
                                accept: 'application/json',
                                'Content-Type': 'application/json',
                            }
                        }
                    );
                    if(!response.ok) {
                        throw new Error("Failed to fetch user country.");
                    }

                    const data = await response.json();

                    console.log(data.data.data);
                    setBankList(data.data.data);
                } catch (error) {
                    if (error instanceof Error) {
                        setErrorMessage(`${error.message} ${error.cause}` || "Something went wrong, please try again.");
                    }
                }
            }

            getBankLists();
        }
    }, [country]);

    const handleBankFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target.name === "account_number") {
            setAccountNumber(e.target.value);
        } else if (e.target.name === "business_name") {
            setBusinessName(e.target.value);
        } else if (e.target.name === "business_email") {
            setBusinessEmail(e.target.value);
        } else if (e.target.name === "business_mobile") {
            setBusinessMobile(e.target.value);
        } else if (e.target.name === "business_contact") {
            setBusinessContact(e.target.value);
        } else if (e.target.name === "business_contact_mobile") {
            setBusinessContactMobile(e.target.value);
        }
    }

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountryCode = e.target.value;
        setCountry(selectedCountryCode);
        const selectedCountry = brandCountries.find((c) => c.alpha2 === selectedCountryCode);
        if (selectedCountry) {
            setSelectedCountryName(selectedCountry.name);
        }
    };
    return (
        <>
            {errorMessage && (
                <>
                    <ErrorModal
                        message={errorMessage}
                        onClose={() => {
                            setErrorMessage("");
                            //resetError();
                        }}
                    />
                </>
            )}
            <form>
                <div>
                    <div className='flex lg:flex-row md:flex-row flex-col w-full lg:space-x-4 md:space-x-4 space-y-4 lg:space-y-0 md:space-y-0 my-4'>

                        <div className='basis-1/2'>
                            <label 
                                htmlFor="country"
                                className="block text-sm font-bold text-gray-900 mb-1"
                            >
                                Country: *
                            </label>
                            <Select
                                id="country"
                                disabled={true}
                                name="country"
                                value={country}
                                onChange={handleCountryChange}
                                className="text-muted-foreground block bg-transparent"
                            >
                                <option value="" disabled>
                                    {selectedCountryName || "Select"}
                                </option>
                                {brandCountries.map((country) => (
                                    <option key={`${country.alpha2}-${country.name}`} value={country.alpha2}>
                                        {`${country.flag + " " + country.name + " " + country.alpha2}`}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        
                        <div className='basis-1/2'> 
                            <label 
                                htmlFor="account_bank"
                                className="block text-sm font-bold text-gray-900 mb-1"
                            >
                                Select Bank: *
                            </label>
                            <SearchableSelect
                                options={bankList}
                                getOptionLabel={(bank: any) => bank?.name}                            
                                onSelect={(selectedBank: any) => {
                                    setSelectedBank(selectedBank.code);
                                    console.log(`the selected bank code is ${selectedBank.code} and the name is ${selectedBank.name}`)
                                    setSelectedBankObject(selectedBank);
                                    setSelectedBankName(selectedBank.name);
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex lg:flex-row md:flex-row flex-col w-full lg:space-x-4 md:space-x-4 space-y-4 lg:space-y-0 md:space-y-0 my-4'>
                        <div className='basis-1/2'>
                            <label htmlFor="account_number" className="block text-sm font-bold text-gray-900 mb-1">
                                Account Number: *
                            </label>
                            <Input
                                id='account_number'
                                name='account_number'
                                value={accountNumber}
                                onChange={handleBankFormChange}
                                required
                                type='string'
                            />
                        </div>
                        <div className='basis-1/2'>
                            <label htmlFor="business_name" className="block text-sm font-bold text-gray-900 mb-1">
                                Brand Name: *
                            </label>
                            <Input
                                id='business_name'
                                name='business_name'
                                value= {businessName}
                                onChange={handleBankFormChange}
                                required
                                disabled
                                type='string'
                            />
                        </div>
                    </div>
                    <div className='flex lg:flex-row md:flex-row flex-col w-full lg:space-x-4 md:space-x-4 space-y-4 lg:space-y-0 md:space-y-0 my-4'>
                        <div className='basis-1/2'>
                            <label htmlFor="business_email" className="block text-sm font-bold text-gray-900 mb-1">
                                Business Email: *
                            </label>
                            <Input
                                id='business_email'
                                name='business_email'
                                value= {businessEmail}
                                onChange={handleBankFormChange}
                                type='email'
                                required
                                disabled
                            />
                        </div>
                        <div className='basis-1/2'>
                            <label htmlFor="business_mobile" className="block text-sm font-bold text-gray-900 mb-1">
                                Business Mobile: *
                            </label>
                            <Input
                                id='business_mobile'
                                name='business_mobile'
                                value={businessMobile}
                                onChange={handleBankFormChange}
                                type='tel'
                                disabled
                                required
                            />
                        </div>
                    </div>

                    <div className='flex lg:flex-row md:flex-row flex-col w-full lg:space-x-4 md:space-x-4 space-y-4 lg:space-y-0 md:space-y-0 my-4'>
                        <div className='basis-1/2'>
                            <label htmlFor="business_contact" className="block text-sm font-bold text-gray-900 mb-1">
                                Account Contact Person Name: *
                            </label>
                            <Input
                                id='business_contact'
                                name='business_contact'
                                value={businessContact}
                                onChange={handleBankFormChange}
                                type='string'
                                required
                            />
                        </div>
                        <div className='basis-1/2'>
                            <label htmlFor="business_contact_mobile" className="block text-sm font-bold text-gray-900 mb-1">
                                Account Contact Person Mobile: *
                            </label>
                            <Input
                                id='business_contact_mobile'
                                name='business_contact_mobile'
                                value={businessContactMobile}
                                onChange={handleBankFormChange}
                                type='tel'
                                required
                            />
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default BrandPaymentDetailsForm;