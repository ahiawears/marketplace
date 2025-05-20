import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { MoneyInput } from "../ui/money-input";

interface FreeShippingSectionProps {
    label: string;
    checked: boolean;
    onToggle: (checked: boolean) => void;
    threshold: number;
    onThresholdChange: (threshold: number) => void;
    availableMethods: ("standard" | "express")[]; // Methods that *can* be selected
    selectedMethods: ("standard" | "express")[]; // Methods currently *selected*
    onSelectedMethodsChange: (methods: ("standard" | "express")[]) => void;
    excludedCountries: string[]; // Countries excluded based on zone settings
    currency: string; // For the threshold input
}

const FreeShippingSection: React.FC<FreeShippingSectionProps> = ({label, checked, onToggle, threshold, onThresholdChange, availableMethods, selectedMethods, onSelectedMethodsChange, excludedCountries, currency }) => {
    const handleMethodClick = (method: "standard" | "express") => {
        const currentlySelected = selectedMethods.includes(method);
        let newSelectedMethods: ("standard" | "express")[];

        if (currentlySelected) {
            // Remove the method
            newSelectedMethods = selectedMethods.filter(m => m !== method);
        } else {
            // Add the method
            newSelectedMethods = [...selectedMethods, method];
        }
        onSelectedMethodsChange(newSelectedMethods);
    };
    return (
        <div className="flex flex-col p-4 border-2 rounded-lg space-y-3">
            <label className="flex items-center space-x-3">
                <Input
                    type="checkbox"
                    className={cn(
                                "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
                                "peer appearance-none",
                                "checked:bg-black checked:border-transparent",
                                "hover:border-gray-500 cursor-pointer"
                            )} 
                    checked={checked}
                    onChange={(e) => onToggle(e.target.checked)}
                />
                <span className="font-medium">{label}</span>
            </label>
            {checked && (
                <div className="space-y-2">
                    {/* Threshold Input */}
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Order Value ({currency})
                            </label>
                            <MoneyInput
                                numericValue={threshold}
                                className="border-2 w-full"
                                onNumericChange={(value) => {
                                    onThresholdChange(value);
                                }}
                                placeholder="0.00"
                            />
                             <p className="text-xs text-gray-500 mt-1">Set the order total required to qualify for free shipping.</p>
                        </div>
                    </div>
                     {/* Applicable Methods Selection */}
                     {availableMethods.length > 0 && (
                         <div className="flex-1 mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apply Free Shipping To:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableMethods.map((method) => (
                                    <span
                                        key={method}
                                        onClick={() => handleMethodClick(method)}
                                        className={`px-3 py-1 text-sm cursor-pointer transition-colors duration-150 ease-in-out rounded
                                            ${selectedMethods.includes(method)
                                                ? "bg-black text-white ring-2 ring-offset-1 ring-black"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                                            `}
                                    >
                                        {method === 'standard' ? 'Standard Shipping' : 'Express Shipping'}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Select which of your active shipping methods should be free when the threshold is met.</p>
                        </div>
                    )}
                    {availableMethods.length === 0 && (
                         <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200 mt-4">
                            You need to enable 'Standard Shipping' or 'Express Shipping' in the 'Shipping Methods' section above before you can select them for free shipping.
                         </p>
                    )}
                    {/* Display Excluded Countries (Informational) */}
                    {excludedCountries.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700">Note: Free shipping will not apply to orders going to countries you've excluded in your Shipping Zones:</p>
                            <p className="text-xs text-gray-500 break-words">{excludedCountries.join(', ')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FreeShippingSection