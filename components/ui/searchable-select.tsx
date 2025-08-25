import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

export type SearchableSelectProps<T> = {
    options: T[];
    getOptionLabel: (option: T) => string;
    onSelect: (option: T) => void;
    placeholder?: string;
    className?: string;
};

export function SearchableSelect<T>({
    options,
    getOptionLabel,
    onSelect,
    placeholder = "Select or search for an option...",
    className,
}: SearchableSelectProps<T>) {
    const [search, setSearch] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [filteredOptions, setFilteredOptions] = React.useState<T[]>(options);
    const [selectedOption, setSelectedOption] = React.useState<T | null>(null); // Track the selected option
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (search === "" && !isOpen) {
            setFilteredOptions(options);
        } else {
            setFilteredOptions(
                options.filter((option) =>
                    getOptionLabel(option).toLowerCase().includes(search.toLowerCase())
                )
            );
        }
    }, [search, options, getOptionLabel, isOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (selectedOption) {
                    setSearch(getOptionLabel(selectedOption));
                } else {
                    setSearch("");
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedOption, getOptionLabel]);

    const handleOptionSelect = (option: T) => {
        onSelect(option);
        setSelectedOption(option); // Update the selected option
        setSearch(getOptionLabel(option));
        setIsOpen(false);
    };

    const handleFocus = () => {
        setIsOpen(true);
        setSearch("");
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={handleFocus}
                    className="pr-10 border-2"
                />
                {isOpen ?
                    (
                        <ChevronUp
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" 
                            size={18}
                            onClick={() => {isOpen ? setIsOpen(false) : setIsOpen(true)}}
                        />
                    ) : (
                        <ChevronDown 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" 
                            size={18}
                            onClick={() => {isOpen ? setIsOpen(false) : setIsOpen(true)}}
                        />
                    )
                }
            </div>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full border-2 bg-background shadow-md max-h-52 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {getOptionLabel(option)}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
}
