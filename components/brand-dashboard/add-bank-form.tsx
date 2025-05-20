import { brandCountries } from "@/lib/countries";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SearchableSelect } from "../ui/searchable-select";
import { Select } from "../ui/select";
import { BrandSubAccounts } from '@/lib/types';

interface AddBankFormProps {
    onBack: () => void;
    userLocation: string | null;
    selectedCountry: string;
    handleCountryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    bankFormData: BrandSubAccounts;
    handleBankFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    bankList: { name: string; code: string }[];
}

const AddBankForm = ({ onBack, userLocation, selectedCountry, handleCountryChange, bankFormData, handleBankFormChange, handleSubmit, bankList }: AddBankFormProps) => {
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
export default AddBankForm;