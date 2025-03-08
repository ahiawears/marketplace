import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

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
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		setFilteredOptions(
			options.filter((option) =>
				getOptionLabel(option).toLowerCase().includes(search.toLowerCase())
			)
		);
	}, [search, options, getOptionLabel]);

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={containerRef} className={cn("relative w-full", className)}>
			<div className="relative">
				<Input
					type="text"
					placeholder={placeholder}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onFocus={() => setIsOpen(true)}
					className="pr-10"
				/>
				<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
			</div>
			{isOpen && (
				<div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-md max-h-52 overflow-y-auto">
					{filteredOptions.length > 0 ? (
						filteredOptions.map((option, index) => (
							<div
								key={index}
								className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
								onClick={() => {
									onSelect(option);
									setSearch(getOptionLabel(option));
									setIsOpen(false);
								}}
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
