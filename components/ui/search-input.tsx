import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    onSearch?: () => void;
};

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, onSearch, ...props }, ref) => {
        return (
            <div className="relative w-11/12">
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    ref={ref}
                    {...props}
                />

                <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:cursor-pointer"
                    onClick={onSearch}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24"  
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="lucide lucide-search"
                    >
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                    </svg>
                </div>
            </div>
            
        );
    }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
