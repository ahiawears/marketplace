"use client";
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select';
import { brandCountries } from '@/lib/countries';
import React, { useEffect, useState } from 'react'
import { trim } from 'validator';
import { createClient} from "@/supabase/client";
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { BrandSubAccounts } from '@/lib/types';


type ComponentItems = "addBank" | "banksList"

const PaymentSettings = () => {
	const [currentComponent, setCurrentComponent] = useState<ComponentItems>("banksList")
	const [userLocation, setuserLocation] = useState<string | null>(null);

	const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); 
	const [userSession, setUserSession] = useState<any>({});

	const [selectedCountry, setSelectedCountry] = useState("");
	const [countryName, setCountryName] = useState("");
	const [countryCode, setCountryCode] = useState("");
	const [countryFlag, setCountryFlag] = useState("");

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
	};


	const [bankFormData, setBankFormData] = useState<BrandSubAccounts>(initialBankFormData);

	const [bankList, setBankList] = useState([]);

    const handleBankFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setBankFormData({
            ...bankFormData,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			console.log("The formdata in frontend is ", bankFormData)
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
				throw new Error("Failed to create a payment account")
			}

			const data = await response.json();
			console.log(data);
		} catch (error: any) {
			console.log(`An error Occured: ${error}, cause: ${error.cause}, message: ${error.message}`)
		}
	};
	

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const { data: { user }, error } = await createClient().auth.getUser();

				if (error) {
					console.error("Error fetching user:", error);
					throw new Error(`Error fetching user: ${error.message}, cause: ${error.cause}`)
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
				throw new Error(`An error occurred while fetching the user: ${error.message}, cause: ${error.cause}`)
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
			}

			getBankLists();
		}
	}, [countryName, countryCode, countryFlag, selectedCountry]);

	if (loading) {
        return <div>Loading...</div>; // Display a loading state
    }

	// useEffect(() => {
	// 	const getUserCountry = async () => {
	// 		try {
	// 			const response = await fetch('/functions/v1/get-users-location', {
	// 				method: 'GET',
	// 				headers: {
	// 					'Content-Type': 'application/json',
	// 				},
	// 			});
		
	// 			if (!response.ok) {
	// 				throw new Error("Failed to fetch user country.");
	// 			}
		
	// 			const data = await response.json();
	// 			console.log("User country data:", data);
	// 			setuserLocation(data.data);
	// 			//setuserLocation(data.data.country);
	// 			//return data.data.country;
	// 		} catch (error: any) {
	// 			setuserLocation(null);
	// 		}
	// 	};
	// 	getUserCountry();		
	// }, [])

	console.log("User location: ", userLocation);

	const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedId = trim(e.target.value);
		const country = brandCountries.find((country) => country.alpha2 === selectedId);

		if(country){
			setSelectedCountry(selectedId);
			setCountryName(country.name);
			setCountryCode(country.code);
			setCountryFlag(country.flag);
			bankFormData.country = selectedId;
		}
	}

	const renderComponent = () => {
		if (currentComponent === "addBank") {
			return (
				<AddBankForm 
					onBack={() => setCurrentComponent("banksList")}
					userLocation={userLocation}
					selectedCountry={selectedCountry}
					handleCountryChange={handleCountryChange}
					bankFormData={bankFormData as BrandSubAccounts}
                    handleBankFormChange={handleBankFormChange}
                    handleSubmit = {handleSubmit}
					bankList={bankList}
				/>
			)
		}

		if (currentComponent === "banksList") {
			return (
				<AccountsList 
					onAddBankDetails={() => setCurrentComponent("addBank")}
				/>
			)
		}
	}
	return (
		<div>
			<div className='p-4'>
				{renderComponent()}
			</div>
		</div>
	)
}

const AddBankForm = ({ onBack, userLocation, selectedCountry, handleCountryChange, bankFormData, handleBankFormChange, handleSubmit, bankList }: {onBack: () => void; userLocation: string | null; selectedCountry: string; handleCountryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; bankFormData: BrandSubAccounts; handleBankFormChange: any; handleSubmit: any; bankList:  { name: string; code: string }[];}) => {

	return (
		<div>
			<Button
				onClick={onBack}
                className="px-4 py-2 mb-4 text-white rounded float-left"			
			>
				Back
			</Button>

			<div>
				<form className='space-y-4' onSubmit={handleSubmit}>
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
									name="country"
									value={bankFormData.country || selectedCountry}
									onChange={handleCountryChange}
									className="text-muted-foreground block bg-transparent"
								>
									<option value="" disabled>
										Select
									</option>
									{brandCountries.map((country) => (
										<option key={`${country.code}-${country.name}`} value={country.alpha2}>
											{`${country.flag + " " + country.name + " " + country.code}`}
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
									getOptionLabel={(bank) => bank.name}
									onSelect={(selectedBank) =>
										handleBankFormChange({
											target: { name: "account_bank", value: selectedBank.code }
										} as any)
									}
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
									value={bankFormData.account_number}
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
									value={bankFormData.business_name}
									onChange={handleBankFormChange}
									required
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
									value={bankFormData.business_email}
									onChange={handleBankFormChange}
									type='email'
									required
								/>
							</div>
							<div className='basis-1/2'>
								<label htmlFor="business_mobile" className="block text-sm font-bold text-gray-900 mb-1">
									Business Mobile: *
								</label>
								<Input
									id='business_mobile'
									name='business_mobile'
									value={bankFormData.business_mobile}
									onChange={handleBankFormChange}
									type='tel'
									required
								/>
							</div>
						</div>

						{/* Business Contact Person */}
						<div className='flex lg:flex-row md:flex-row flex-col w-full lg:space-x-4 md:space-x-4 space-y-4 lg:space-y-0 md:space-y-0 my-4'>
							<div className='basis-1/2'>
								<label htmlFor="business_contact" className="block text-sm font-bold text-gray-900 mb-1">
									Business Contact Person: *
								</label>
								<Input
									id='business_contact'
									name='business_contact'
									value={bankFormData.business_contact}
									onChange={handleBankFormChange}
									required
								/>
							</div>
							<div className='basis-1/2'>
								<label htmlFor="business_contact_mobile" className="block text-sm font-bold text-gray-900 mb-1">
									Contact Mobile: *
								</label>
								<Input
									id='business_contact_mobile'
									name='business_contact_mobile'
									value={bankFormData.business_contact_mobile}
									onChange={handleBankFormChange}
									type='tel'
									required
								/>
							</div>
						</div>

						{/* Split Type & Value */}
						{/* <div className='flex lg:flex-row md:flex-row flex-col w-full lg:space-x-4 md:space-x-4 space-y-4 lg:space-y-0 md:space-y-0 my-4'>
							<div className='basis-1/2'>
								<label htmlFor="split_type" className="block text-sm font-bold text-gray-900 mb-1">
									Split Type: *
								</label>
								<Select
									id='split_type'
									name='split_type'
									value={bankFormData.split_type}
									onChange={handleBankFormChange}
									required
								>
									<option value="">Select</option>
									<option value="percentage">Percentage</option>
									<option value="flat">Flat</option>
								</Select>
							</div>
							<div className='basis-1/2'>
								<label htmlFor="split_value" className="block text-sm font-bold text-gray-900 mb-1">
									Split Value: *
								</label>
								<Input
									id='split_value'
									name='split_value'
									value={bankFormData.split_value}
									onChange={handleBankFormChange}
									type='number'
									required
								/>
							</div>
						</div>	 */}
					</div>	
					{/* Submit Button */}
					<Button type='submit' className="w-full mt-4">
						Submit
					</Button>		
				</form>
			</div>
		</div>
	)
}

const AccountsList = ({ onAddBankDetails}: {onAddBankDetails: () => void;}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div>
			<div className='space-y-4 md:w-full'>
				<Button
					onClick={onAddBankDetails}
					className="px-4 py-2 mb-4 text-white rounded float-left"
				>
					Add New Bank Details
				</Button>
			</div>
		</div>
	)
}


export default PaymentSettings