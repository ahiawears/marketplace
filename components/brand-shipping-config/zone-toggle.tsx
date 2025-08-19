import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { CountryData } from "@/lib/country-data";
import { use, useEffect, useState } from "react";
import { SearchableSelect } from "../ui/searchable-select";
import { CountryState } from "@/lib/country-states";

type CountryListItem = {
    name: string;
    emoji: string;
};

interface ZoneToggleProps {
    label: string;
    checked: boolean;
    onToggle: (checked: boolean) => void;
    country: string;
    selectedCities?: string[];
    onCitiesChange?: (cities: string[]) => void;
    excludedCountries?: string[];
    onExcludedCountriesChange?: (countries: string[]) => void;
}

const ZoneToggle: React.FC<ZoneToggleProps> = ({
    label, 
	checked, 
	onToggle, 
    country,
    selectedCities = [], // Default to empty array if not provided
    onCitiesChange,
    excludedCountries = [], // Use the new prop
    onExcludedCountriesChange, // Use the new prop
}) => {
    const [sub_region, setSubRegion] = useState("");
    const [continent, setContinent] = useState("");
    const [sameDayStates, setSameDayStates] = useState<string[]>([]);
    const [countryFullName, setCountryFullName] = useState("");
    const [subRegionCountryList, setSubregionCountryList] = useState<CountryListItem[]>([]); 
    const [continentCountryList, setContinentCountryList] = useState<CountryListItem[]>([]); 
    const [globalCountryList, setGlobalCountryList] = useState<CountryListItem[]>([]); 

    useEffect(() => {
        if (country) {
            // Find the country object using the alpha2 code
            const countryInfo = CountryData.find((cr) => cr.iso2 === country);
            if (countryInfo && countryInfo.subregion) {
                setSubRegion(countryInfo.subregion); // Set the subregion state
            } else {
                // Handle case where country or subregion is not found
                console.warn(`Subregion not found for country code: ${country}`);
                setSubRegion(""); // Reset or set a default message
            }

            if(countryInfo && countryInfo.region) {
                setContinent(countryInfo.region)
            } else {
                setContinent("");
            }
        } else {
            setSubRegion(""); // Reset if country prop is empty
        }
    }, [country]);
    
    useEffect(() => {
        if(country) {
            const countryFName = CountryData.find((cfn) => cfn.iso2 === country);
            if(countryFName && countryFName.name) {
                setCountryFullName(countryFName.name);
            } 
    
            const countryStates = CountryState.find((cs) => cs.name === countryFName?.name);
            if(countryStates && countryStates.states){
                setSameDayStates(countryStates.states);
            }
        }
    }, [country]);

    useEffect(() => {
        if(sub_region && continent && countryFullName) {
            // Filter all countries that match the sub_region
            const countriesInSubregion = CountryData.filter((countryDataType) => (countryDataType.subregion === sub_region) && (countryDataType.name !== countryFullName));
            // Extract the names of these countries
            // Extract the name and emoji of these countries
            const countryObjects = countriesInSubregion.map(countryDataType => ({ name: countryDataType.name, emoji: countryDataType.emoji }));
            setSubregionCountryList(countryObjects);

            // Filter countries in the current continent
            const countriesInContinent = CountryData.filter((countryDataType) => countryDataType.region === continent && countryDataType.subregion !== sub_region);
            const continentCountryObjects = countriesInContinent.map(countryDataType => ({ name: countryDataType.name, emoji: countryDataType.emoji }));
            setContinentCountryList(continentCountryObjects);

            // Filter countries NOT in the current continent
            const countriesOutsideContinent = CountryData.filter((countryDataType) => countryDataType.region !== continent);
            const globalCountryObjects = countriesOutsideContinent.map(countryDataType => ({ name: countryDataType.name, emoji: countryDataType.emoji }));
            if (globalCountryObjects.length > 0) {
                setGlobalCountryList(globalCountryObjects);
            }
        }
    }, [sub_region, continent, countryFullName]);

    // Handler to add a city
    const handleAddCity = (city: string) => {
        // Check if onCitiesChange exists and the city is not already selected
        if (onCitiesChange && !selectedCities.includes(city)) {
            const newCities = [...selectedCities, city];
            onCitiesChange(newCities);
        }
    };

    // Handler to remove a city
    const handleRemoveCity = (cityToRemove: string) => {
        if (onCitiesChange) {
            const newCities = selectedCities.filter(city => city !== cityToRemove);
            onCitiesChange(newCities);
        }
    };
    
     // Handler to add an excluded country
     const handleAddExcludedCountry = (countryItem: CountryListItem) => {
        // Check if onExcludedCountriesChange exists and the country name is not already excluded
        if (onExcludedCountriesChange && !excludedCountries.includes(countryItem.name)) {
            const newExcluded = [...excludedCountries, countryItem.name];
            onExcludedCountriesChange(newExcluded);
        }
    };

    // Handler to remove an excluded country
    const handleRemoveExcludedCountry = (countryToRemove: string) => {
        if (onExcludedCountriesChange) {
            const newExcluded = excludedCountries.filter(country => country !== countryToRemove);
            onExcludedCountriesChange(newExcluded);
        }
    };
    return (
        <div className="flex flex-col p-4 border-2 rounded-lg space-y-3">
            <label className="flex items-center space-x-3">
                <Input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onToggle(e.target.checked)}
                    className={cn(
                        "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                        "peer appearance-none",
                        "checked:bg-black checked:border-transparent",
                        "hover:border-gray-500 cursor-pointer"
                    )} 
                />
                <span className="font-medium">{label}</span>
            </label>
            {checked && (
                <div className="space-y-2">
                    
                    {label.includes('Domestic') && (
                        <>
                            <p className="text-xs text-gray-500">Subregion: {sub_region} Region: {continent} Country Full Name: {countryFullName}</p>

                            <div> 
                                <label>Do not ship to: </label> 
                                <SearchableSelect
                                    options={sameDayStates} // Use the fetched states
                                    onSelect={handleAddCity} // Add selected city
                                    placeholder="Select cities for Same Day Delivery"
                                    getOptionLabel={(option: string) => option}
                                />
                                {/* Display selected cities */}
                                {selectedCities.length > 0 && (
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Selected Cities:</label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCities.map(city => (
                                                <span 
                                                    key={city} 
                                                    className="flex items-center bg-black text-white ring-offset-1 ring-black ring-2 px-2 py-1"
                                                    >
                                                    {city}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCity(city)}
                                                        className="ml-1 text-white hover:text-white focus:outline-none"
                                                        aria-label={`Remove ${city}`}
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {label.includes('Sub-Region') && (
                        <>
                            <p className="text-xs text-gray-500">Subregion: {sub_region}</p>

                            <div>
                                <label>Do not ship to: </label>
                                <SearchableSelect<CountryListItem>
                                    options={subRegionCountryList} // Use the fetched states
                                    onSelect={handleAddExcludedCountry} // Use country handler
                                    placeholder="Select cities for Same Day Delivery"
                                    getOptionLabel={(option) => `${option.emoji} ${option.name}`} 
                                    // Note: SearchableSelect might need a way to clear its input after selection.
                                    // For now, selecting just adds the city to the list below.
                                />
                                {/* Display excluded countries */}
                                {excludedCountries.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {excludedCountries.map(countryName => (
                                                <span 
                                                    key={countryName} 
                                                    className="flex items-center bg-black text-white ring-offset-1 ring-black ring-2 px-2 py-1"
                                                >
                                                    {countryName}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExcludedCountry(countryName)} // Use country handler
                                                        className="ml-1 text-white hover:text-white focus:outline-none"
                                                        aria-label={`Remove ${countryName}`}
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {label.includes('Continental') && (
                        <>
                            <p className="text-xs text-gray-500">Region: {continent}</p>
                            <div>
                                <label>Do not ship to:</label>
                                <SearchableSelect<CountryListItem>
                                    options={continentCountryList} // Use the fetched states
                                    onSelect={handleAddExcludedCountry}
                                    placeholder="Select cities for Same Day Delivery"
                                    getOptionLabel={(option) => `${option.emoji} ${option.name}`} 
                                />
                                 {/* Display excluded countries */}
                                 {excludedCountries.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {excludedCountries.map(countryName => (
                                                <span 
                                                    key={countryName} 
                                                    className="flex items-center bg-black text-white ring-offset-1 ring-black ring-2 px-2 py-1"
                                                >
                                                    {countryName}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExcludedCountry(countryName)}
                                                        className="ml-1 text-white hover:text-white focus:outline-none"
                                                        aria-label={`Remove ${countryName}`}
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </>
                    )}
                    { label.includes('International') && (
                        <>
                            <label>Do not ship to:</label>
                            <SearchableSelect<CountryListItem>
                                options={globalCountryList} // Use the global list
                                onSelect={handleAddExcludedCountry} // Assuming you want to exclude countries here too
                                placeholder="Select countries to exclude"
                                getOptionLabel={(option) => `${option.emoji} ${option.name}`} 
                            />
                            {/* Display excluded countries */}
                            {excludedCountries.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {excludedCountries.map(countryName => (
                                            <span 
                                                key={countryName} 
                                                className="flex items-center bg-black text-white ring-offset-1 ring-black px-2 py-1"
                                            >
                                                {countryName}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExcludedCountry(countryName)} // Use country handler
                                                    className="ml-1 text-white hover:text-white focus:outline-none"
                                                    aria-label={`Remove ${countryName}`}
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default ZoneToggle;