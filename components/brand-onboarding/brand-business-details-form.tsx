import { BrandOnboarding } from "@/lib/types";
import { Select } from "../ui/select";
import { useEffect, useState } from "react";
import { brandCountries } from "@/lib/countries";
import { trim } from "validator";
import { Input } from "../ui/input";

type BrandBusinessData = BrandOnboarding["businessDetails"]

interface BrandBusinessProps {
    data: BrandBusinessData;
    onDataChange: (data: BrandBusinessData, isValid: boolean) => void;
}

const BrandBusinessDetailsForm = ({ data, onDataChange }: BrandBusinessProps) => {

    const [selectedCountry, setSelectedCountry] = useState("");
    const [countryName, setCountryName] = useState(data.country_of_registration);
    const [countryCode, setCountryCode] = useState("");
    const [business_registration_name, setBusinessRegistrationName] = useState(data.business_registration_name);
    const [business_registration_number, setBusinessRegistrationNumber] = useState(data.business_registration_number);


    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = trim(event.target.value); 
        const country = brandCountries.find((c) => c.alpha2 === selectedId);
    
        if (country) {
            setSelectedCountry(String(selectedId)); 
            setCountryName(country.name);
            setCountryCode(country.code);
        }    
    };

    useEffect(() => {
    
        if (data.country_of_registration) {
            const country = brandCountries.find((c) => c.alpha2 === data.country_of_registration);
            if (country) {
                setSelectedCountry(country.alpha2);
                setCountryName(country.name);
                setCountryCode(country.code);
            }
        }
    }, [data.country_of_registration])

    useEffect(() => {
        const isValid = countryCode.length > 0 && countryName.length > 0 && business_registration_name.length > 0 && business_registration_number.length > 0;
        onDataChange({
            country_of_registration: selectedCountry,
            business_registration_name: business_registration_name,
            business_registration_number: business_registration_number,
        }, isValid);
    }, [selectedCountry, countryName, countryCode, business_registration_name, business_registration_number]);
    
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label
                    htmlFor="country_of_registration"
                    className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                >
                    Country of Incorporation:*
                </label>
                
                <div className="space-y-2">
                    <Select
                        id="country_of_registration"
                        name="country_of_registration"
                        value={selectedCountry}
                        onChange={handleChange}
                        className="text-muted-foreground block border-2 bg-transparent md:w-1/2 w-full"
                    >
                        <option value="" disabled>
                            {countryName || "Select a country..."}
                        </option>
                        {brandCountries.map((country) => (
                            <option key={`${country.code}-${country.name}`} value={country.alpha2}>
                                {`${country.flag + " " + country.name}`}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="sm:space-y-4 md:space-x-4 lg:space-x-4 flex w-full lg:flex-row md:flex-row flex-col">
                <div className="basis-1/2 sm:space-y-1 my-4">
                    <label 
                        htmlFor="business_registration_name"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                    >
                        Enter the Business Registration Name:*
                    </label>
                    <Input
                        id="business_registration_name"
                        type="text"
                        name="business_registration_name"
                        value={business_registration_name}
                        onChange={(e) => {
                            setBusinessRegistrationName(e.target.value);
                        }}
                        className="border-2"
                    />
                </div>
                <div className="basis-1/2 sm:space-y-1 my-4">
                    <label 
                        htmlFor="business_registration_number"
                        className="block text-sm font-bold text-gray-900 mb-1 w-fit">
                        Enter the Business Registration Number:*
                    </label>
                    <Input 
                        id="business_registration_number"
                        type="text"
                        name="business_registration_number"
                        value={business_registration_number}
                        onChange={(e) => {
                            setBusinessRegistrationNumber(e.target.value);
                        }}
                        className="border-2"
                    />
                </div>
            </div>
        </div>
    )
}

export default BrandBusinessDetailsForm;