"use client";
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { createClient} from "@/supabase/client";
import LoadContent from '@/app/load-content/page';
import { BrandSubAccounts } from '@/lib/types';
import { brandCountries } from '@/lib/countries';
import { trim } from 'validator';
import AddBankForm from '@/components/brand-dashboard/add-bank-form';
import AccountsList from '@/components/brand-dashboard/brand-banks-list';

type ComponentItems = "addBank" | "banksList";

const PaymentSettings = () => {
    const [currentComponent, setCurrentComponent] = useState<ComponentItems>("banksList");
    const [userLocation, setuserLocation] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userSession, setUserSession] = useState<any>({});
    const [selectedCountry, setSelectedCountry] = useState("");
    const [countryName, setCountryName] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [countryFlag, setCountryFlag] = useState("");
    const [bankList, setBankList] = useState([]);

    const initialBankFormData: BrandSubAccounts = {
        account_bank: "",
        account_number: "",
        business_name: "",
        country: "",
        split_value: 0.05,
        business_mobile: "",
        business_email: "",
        business_contact: "",
        business_contact_mobile: "",
        split_type: "percentage",
        bank_name: "",
        subaccount_id: '',
    };

    const [bankFormData, setBankFormData] = useState<BrandSubAccounts>(initialBankFormData);

    const handleBankFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setBankFormData({
            ...bankFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            console.log("The formdata in frontend is ", bankFormData);
            const accessToken = userSession.access_token;
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/create-brand-subaccount`, 
                {
                    method: "POST",
                    headers: {
                        accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(bankFormData)
                }
            );
            if (!response.ok) {
                throw new Error("Failed to create a payment account");
            }

            const data = await response.json();
            console.log(data);
            //setCurrentComponent("banksList"); // Go back to the list after successful submission
        } catch (error: any) {
            console.error(`An error Occured: ${error}, cause: ${error.cause}, message: ${error.message}`);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await createClient().auth.getUser();

                if (error) {
                    console.error("Error fetching user:", error);
                    throw new Error(`Error fetching user: ${error.message}, cause: ${error.cause}`);
                } else if (!user) {
                    console.log("User not found");
                    throw new Error("User not found");
                } else {
                    setUserId(user.id);
                }

                const { data: {session}, error: sessionError } = await createClient().auth.getSession();
                if (sessionError) {
                    console.error("Error fetching user:", sessionError);
                    throw new Error(`Error fetching user: ${sessionError.message}, cause: ${sessionError.cause}`);
                }

                setUserSession(session);
            } catch (error: any) {
                console.error("An error occurred while fetching the user:", error);
                throw new Error(`An error occurred while fetching the user: ${error.message}, cause: ${error.cause}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (selectedCountry !== "") {
            const getBankLists = async () => {
                try {
                    const accessToken = userSession.access_token;
                    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/get-brand-countries-banklist?selectedCountry=${selectedCountry}`,
                        {
                            method: 'GET',
                            headers: {
                                accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${accessToken}`,
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
                    console.error("There has been an error when fetching the bank list: ", error);
                }
            };

            getBankLists();
        }
    }, [countryName, countryCode, countryFlag, selectedCountry, userSession?.access_token]);

    if (loading) {
        return <LoadContent />;
    }

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = trim(e.target.value);
        const country = brandCountries.find((country) => country.alpha2 === selectedId);

        if(country){
            setSelectedCountry(selectedId);
            setCountryName(country.name);
            setCountryCode(country.code);
            setCountryFlag(country.flag);
            setBankFormData(prev => ({ ...prev, country: selectedId }));
        }
    };

    const renderComponent = () => {
        if (currentComponent === "addBank") {
            return (
                <AddBankForm
                    onBack={() => setCurrentComponent("banksList")}
                    userLocation={userLocation}
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                    bankFormData={bankFormData}
                    handleBankFormChange={handleBankFormChange}
                    handleSubmit={handleSubmit}
                    bankList={bankList}
                />
            );
        }

        if (currentComponent === "banksList") {
            return (
                <AccountsList
                    onAddBankDetails={() => setCurrentComponent("addBank")}
                />
            );
        }
    };

    return (
        <div>
            <div className='p-4'>
                {renderComponent()}
            </div>
        </div>
    );
};

export default PaymentSettings;