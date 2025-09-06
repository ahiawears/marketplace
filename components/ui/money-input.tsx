import * as React from "react";
import { cn } from "@/lib/utils";

export interface MoneyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  numericValue: number;       // The actual numeric value (for form submission)
  onNumericChange: (value: number) => void; // Callback with numeric value
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, numericValue, onNumericChange, ...props }, ref) => {
    const formatMoney = (value: string) => {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly === "") return "";

      // Convert to cents (integer) then format
      const cents = parseInt(digitsOnly, 10);
      return (cents / 100).toLocaleString('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const parseMoney = (value: string): number => {
      const digitsOnly = value.replace(/\D/g, "");
      return digitsOnly ? parseInt(digitsOnly, 10) / 100 : 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9]/g, "");
      const formattedValue = formatMoney(rawValue);
      const numericValue = parseMoney(rawValue);

      // Update both display and numeric value
      if (onNumericChange) {
        onNumericChange(numericValue);
      }

      // Maintain controlled input
      if (props.onChange) {
        e.target.value = formattedValue;
        props.onChange(e);
      }
    };

    // Convert numeric value back to display format
    const displayValue = numericValue 
      ? (numericValue).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      : "";

    return (
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "flex h-12 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

MoneyInput.displayName = "MoneyInput";

export { MoneyInput };