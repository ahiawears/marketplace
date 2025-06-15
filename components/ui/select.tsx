import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, ...props }, ref) => { // Destructure 'value' from props
    // Determine if the currently selected value is the disabled option's value.
    // Assuming your disabled option has value="" as per your example.
    const isDefaultOptionSelected = value === "";

    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Conditionally apply text color based on if the disabled option is selected
          isDefaultOptionSelected ? 'text-gray-400' : 'text-gray-900', // Adjust 'text-gray-900' to your default text color
          className // Make sure to include the original className last to allow overrides
        )}
        ref={ref}
        value={value} // Pass the value prop to the select element
        {...props}
      />
    );
  }
);

Select.displayName = "Select";

export { Select };