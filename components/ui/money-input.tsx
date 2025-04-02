import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const MoneyInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const formatMoney = (value: string) => {
      // Remove all non-digit characters
      let digitsOnly = value.replace(/\D/g, "");

      // If no digits, return empty string
      if (digitsOnly.length === 0) {
        return "";
      }

      // Handle single-digit input (e.g., "1" becomes "0.01")
      if (digitsOnly.length === 1) {
        return `${digitsOnly}`;
      }

      // Handle two-digit input (e.g., "12" becomes "0.12")
      if (digitsOnly.length === 2) {
        return `${digitsOnly}`;
      }

      // For three or more digits, insert a decimal point after the first two digits
      const cents = digitsOnly.slice(-2);
      const dollars = digitsOnly.slice(0, -2);

      // Add thousands separators (commas)
      const formattedDollars = dollars
        .split("")
        .reverse()
        .join("")
        .replace(/(\d{3})(?=\d)/g, "$1,")
        .split("")
        .reverse()
        .join("");

      return `${formattedDollars}.${cents}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, ""); // Remove non-digits
      const formattedValue = formatMoney(rawValue);

      // Trigger the parent's onChange with the formatted value
      if (onChange) {
        e.target.value = formattedValue;
        onChange(e);
      }
    };

    // Ensure the displayed value is formatted correctly
    const displayValue = value ? formatMoney(value.toString().replace(/\D/g, "")) : "";

    return (
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right",
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