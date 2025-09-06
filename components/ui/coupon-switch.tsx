"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface StatusSwitchProps {
    status: "active" | "inactive";
    onStatusChange: (status: "active" | "inactive") => void;
    className?: string;
}

const CouponSwitch: React.FC<StatusSwitchProps> = ({ status, onStatusChange, className }) => {
    const handleToggle = () => {
        onStatusChange(status === "active" ? "inactive" : "active");
    };

    const isActive = status === "active";

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "relative inline-flex h-7 w-14 items-center transition-colors duration-200 ease-in-out",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
                    isActive ? "bg-black" : "bg-gray-300 border-y-2 border-r-2"
                )}
            >
                <span
                    className={cn(
                        "border-2 inline-flex h-7 w-7 transform items-center justify-center bg-white shadow-lg transition-transform duration-200 ease-in-out",
                        isActive ? "translate-x-7" : "translate-x-0"
                    )}
                    >
                    {isActive ? (
                        <Check size={12} className="text-black" />
                    ) : (
                        <X size={12} className="text-gray-400" />
                    )}
                </span>
            </button>
        
        </div>
    );
};

export { CouponSwitch };