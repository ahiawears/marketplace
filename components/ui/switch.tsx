"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

// Define the props for the generic switch.
// It will accept standard button attributes.
interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        // The handler now just toggles the boolean state.
        const handleToggle = () => {
            onCheckedChange(!checked);
        };

        return (
            <button
                {...props}
                ref={ref}
                type="button"
                role="switch"
                aria-checked={checked}
                data-state={checked ? 'checked' : 'unchecked'}
                onClick={handleToggle}
                className={cn(
                    "relative inline-flex h-7 w-14 items-center transition-colors duration-200 ease-in-out",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
                    checked ? "bg-black" : "bg-gray-300 border-y-2 border-r-2",
                    className
                )}
            >
                <span
                    data-state={checked ? 'checked' : 'unchecked'}
                    className={cn(
                        "border-2 inline-flex h-7 w-7 transform items-center justify-center bg-white shadow-lg transition-transform duration-200 ease-in-out",
                        checked ? "translate-x-7" : "translate-x-0"
                    )}
                >
                    {checked ? (
                        <Check size={12} className="text-black" />
                    ) : (
                        <X size={12} className="text-gray-400" />
                    )}
                </span>
            </button>
        );
    }
);

Switch.displayName = "Switch";

export { Switch };