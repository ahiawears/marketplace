import * as React from "react";
import { cn } from "@/lib/utils";

export interface MoneyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  numericValue: number;       // The actual numeric value (for form submission)
  onNumericChange: (value: number) => void; // Callback with numeric value
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, numericValue, onNumericChange, ...props }, ref) => {
    const formatMoney = (value: number) => {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const [displayValue, setDisplayValue] = React.useState(
      numericValue ? formatMoney(numericValue) : ""
    );
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(numericValue ? formatMoney(numericValue) : "");
      }
    }, [isFocused, numericValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9.]/g, "");
      const decimalParts = rawValue.split(".");
      const sanitizedValue = decimalParts.length > 2
        ? `${decimalParts[0]}.${decimalParts.slice(1).join("")}`
        : rawValue;
      const parsedValue = parseFloat(sanitizedValue);

      setDisplayValue(sanitizedValue);
      onNumericChange(Number.isFinite(parsedValue) ? parsedValue : 0);

      if (props.onChange) {
        e.target.value = sanitizedValue;
        props.onChange(e);
      }
    };

    return (
      <input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setDisplayValue(numericValue ? formatMoney(numericValue) : "");
          props.onBlur?.(e);
        }}
        className={cn(
          "flex h-12 w-full rounded-none border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right",
          className
        )}
        ref={ref}
      />
    );
  }
);

MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
