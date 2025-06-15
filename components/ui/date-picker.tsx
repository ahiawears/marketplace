"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input"; // Your existing Input component

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        
        <Input
          type="date"
          id={id}
          className={cn(
            "h-12 w-full block rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className)} // Ensure it takes full width and applies custom classes
          ref={ref}
          {...props}
        /> 
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";

export { DatePicker };