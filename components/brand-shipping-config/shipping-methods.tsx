import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { MoneyInput } from "../ui/money-input";
import { TimeScroller } from "../ui/time-input";
import { SearchableSelect } from "../ui/searchable-select";
import { useEffect, useState } from "react";
import { CountryData } from "@/lib/country-data";
import { CountryState } from "@/lib/country-states";
import { DeliveryZone } from "@/app/dashboard/shipping-configuration/page"; // Import the type

// Define the structure for estimated delivery including fee per zone
interface EstimatedDeliveryWithFees {
    domestic?: { from: number; to: number; fee: number; };
    regional?: { from: number; to: number; fee: number; };
    sub_regional?: { from: number; to: number; fee: number; };
    global?: { from: number; to: number; fee: number; };
    // Keep cutOffTime/timeZone separate for same-day if needed, or integrate if structure changes
    cutOffTime?: string;
    timeZone?: string;
    // Add other potential zones like 'africa' if used
    africa?: { from: number; to: number; fee: number; };
};

interface MethodToggleProps {
    label: string;
    checked: boolean;
    fee: number;
    onToggle: (checked: boolean) => void;
    onFeeChange: (fee: number) => void; // Handles the single fee for Same Day Delivery
    currency: string;
    country: string;
    estimatedDelivery?: EstimatedDeliveryWithFees; // Use the updated type
    onDeliveryTimeChange: (
        zone: DeliveryZone, 
        field: 'from' | 'to',
        value: number
    ) => void;
    onZoneFeeChange: (zone: DeliveryZone, value: number) => void; // New handler for zone-specific fees
    cutOffTimeValue?: string;
    timeZoneValue?: string;   
    onSameDayInputChange?: (field: 'cutOffTime' | 'timeZone', value: string) => void; // Handler
    onCitiesChange?: (cities: string[]) => void; 
    selectedCities?: string[];
    enabledZones?: DeliveryZone[]; // Add prop to receive enabled zones
}

const MethodToggle: React.FC<MethodToggleProps> = ({ label, checked, onToggle, fee, onFeeChange, currency, country, estimatedDelivery, onDeliveryTimeChange, onZoneFeeChange, cutOffTimeValue, timeZoneValue, onSameDayInputChange, onCitiesChange, selectedCities = [], enabledZones = []}) => {
    const [countryTimezones, setCountryTimezones] = useState<string[]>([]); // Store timezone names as strings
    const [selectedTimezoneName, setSelectedTimezoneName] = useState<string | null>(timeZoneValue || null); // Store selected name

    const [sameDayStates, setSameDayStates] = useState<string[]>([]);
    const [countryFullName, setCountryFullName] = useState("");

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

            // Get timezones from CountryData
            if (countryFName && countryFName.timezones && countryFName.timezones.length > 0) {
                // Extract only the zoneName strings from the timezone objects
                const timezoneNames = countryFName.timezones.map(tz => tz.zoneName);
                setCountryTimezones(timezoneNames); // Set the array of timezone names
                // Optionally set the default selected timezone if not already set by prop
                if (!selectedTimezoneName && timeZoneValue && timezoneNames.includes(timeZoneValue)) {
                    setSelectedTimezoneName(timeZoneValue);
                } else if (!selectedTimezoneName) {
                    // If no prop value, maybe default to the first one? Or leave null.
                    // setSelectedTimezoneName(countryFName.timezones[0]);
                }
            }
        }
    }, [country])

    const renderSameDayInput = () => {
        // Ensure the handler exists before using it
        const handleTimeChange = (time: string) => {
            if (onSameDayInputChange) {
                onSameDayInputChange('cutOffTime', time);
            } else {
                console.warn("onSameDayInputChange handler is missing for TimeScroller");
            }
        };

        const handleTimezoneSelect = (selectedTimeZone: string) => {
            setSelectedTimezoneName(selectedTimeZone); // Update local state for display
            if (onSameDayInputChange) {
                // Store the standard timezone name (e.g., "Africa/Lagos")
                onSameDayInputChange('timeZone', selectedTimeZone);
            } else {
                console.warn("onSameDayInputChange handler is missing for SearchableSelect");
            }
        };

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
        return (
            <div className="w-full space-y-4">
                <div className="flex items-center space-x-2 justify-between">
                    <span className="text-sm text-gray-600">
                        Fee:
                    </span>
                    <MoneyInput 
                        numericValue={fee}
                        className="w-full border-2"
                        onNumericChange={(value) => {
                            onFeeChange(value);
                        }}
                        placeholder="0.00"
                    />
                    <span className="text-sm text-gray-600">
                        {`${currency}`}
                    </span>
                </div>
                <div className="w-full"> {/* Ensure child takes full width */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cut-off time for same day delivery: </label>
                    <TimeScroller
                        // Use the value from props, provide a default if undefined/empty
                        value={cutOffTimeValue || "12:00"} // Default to 12:00 if no value
                        onChange={handleTimeChange}
                        timeFormat="24h" // Use 24h format for easier storage/parsing
                        // withTimezone // Remove this if TimeScroller adds timezone string itself
                        className="w-full" // Ensure TimeScroller takes full width
                    />
                </div>
                <div className="w-full"> {/* Ensure child takes full width */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone: </label>
                    <SearchableSelect
                        options={countryTimezones}
                        getOptionLabel={(timeZoneName: string) => timeZoneName} // Display the name directly
                        onSelect={handleTimezoneSelect}
                        // Pass the currently selected *object* to SearchableSelect if it supports a 'value' prop
                        // Or handle initial selection via useEffect as done above
                        placeholder={selectedTimezoneName || "Select Timezone"} // Show selected name or placeholder
                        className="w-full" // Ensure SearchableSelect takes full width
                    />
                    {/* Display the stored value for confirmation */}
                    {timeZoneValue && 
                        // <p className="text-xs text-gray-500 mt-1">Selected: {timeZoneValue}</p>
                        <div className="my-2 flex">
                            <span
                                className="flex items-center bg-black text-white ring-offset-1 ring-black px-2 py-1"
                            >
                                {timeZoneValue}
                            </span>
                        </div>
                    }
                </div>
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable states:</label>
                    <SearchableSelect
                        options={sameDayStates}
                        onSelect={handleAddCity}
                        placeholder="Select cities where same day delivery is applicable"
                        getOptionLabel={(option: string) => option}
                        className="w-full"
                    />
                    {/* Display selected cities */}
                    {selectedCities.length > 0 && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selected states:</label>
                            <div className="flex flex-wrap gap-2">
                                {selectedCities.map(city => (
                                    <span 
                                        key={city} 
                                        className="flex items-center bg-black text-white ring-offset-1 ring-black px-2 py-1"
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
            </div>
        );
    }

    const renderDeliveryTimeInputs = (zone: DeliveryZone, zoneLabel: string) => {
        if (!estimatedDelivery || !estimatedDelivery[zone]) return null; // Only render if data exists

        const timeData = estimatedDelivery[zone]!; // Assert non-null as we checked

        return (
            <>
                <h2 className="font-medium mt-4">
                    Estimated Delivery Time:
                </h2>
                <div className="border-t pt-3 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{zoneLabel} (Days)</label>
                    <div className="flex items-center space-x-2 w-full justify-between">
                        <div className="flex-1">
                            <Input
                                value={timeData.from === 0 ? 0 : timeData.from}
                                onChange={(e) => onDeliveryTimeChange(zone, 'from', Number(e.target.value))}
                                className="w-full border-2"
                                min="0" // Allow 0 for domestic potentially
                                placeholder="0"
                            />
                            <label className="block text-xs font-medium text-gray-500 mt-1 text-center">From</label>
                        </div>
                        <div className="text-gray-500 px-1">to</div>
                        <div className="flex-1">
                            <Input
                                value={timeData.to === 0 ? 0 : timeData.to}
                                onChange={(e) => onDeliveryTimeChange(zone, 'to', Number(e.target.value))}
                                className="w-full border-2"
                                min={timeData.from || 0} // 'To' must be >= 'From'
                                placeholder="0"
                            />
                            <label className="block text-xs font-medium text-gray-500 mt-1 text-center">To</label>
                        </div>
                    </div>
                    {/* Fee Input for the Zone */}
                    <div className="flex items-center space-x-2 justify-between">
                        <span className="text-sm text-gray-600">
                            Fee:
                        </span>
                        <MoneyInput
                            numericValue={timeData.fee} // Use the fee from the zone data
                            className="w-full border-2"
                            onNumericChange={(value) => onZoneFeeChange(zone, value)} // Use the zone fee handler
                            placeholder="0.00"
                        />
                        <span className="text-sm text-gray-600">{currency}</span>
                    </div>                 
                </div>
            </>
            
        );
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
                <div className="space-y-3">
                    <div className="space-y-2">
                        {/* Conditionally render inputs based on method label */}
                        {label === 'Standard Shipping' && (
                            <>
                                {enabledZones.includes('domestic') && renderDeliveryTimeInputs('domestic', 'Domestic')}
                                {enabledZones.includes('sub_regional') && renderDeliveryTimeInputs('sub_regional', 'Sub-Regional')}
                                {enabledZones.includes('regional') && renderDeliveryTimeInputs('regional', 'Regional')}
                                {enabledZones.includes('global') && renderDeliveryTimeInputs('global', 'International')}
                            </>
                        )}
                        {label === 'Express Shipping' && (
                            <>
                                {enabledZones.includes('domestic') && renderDeliveryTimeInputs('domestic', 'Domestic')}
                                {enabledZones.includes('sub_regional') && renderDeliveryTimeInputs('sub_regional', 'Sub-Regional')}
                                {enabledZones.includes('regional') && renderDeliveryTimeInputs('regional', 'Regional')}
                                {enabledZones.includes('global') && renderDeliveryTimeInputs('global', 'International')}
                            </>
                        )}
                        {/* Add logic for Same Day if needed, might require different inputs */}
                        {label === 'Same Day Delivery' && (
                            // Or render specific inputs for cut-off/delivery-by if desired here
                            <>
                                {renderSameDayInput()}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MethodToggle;