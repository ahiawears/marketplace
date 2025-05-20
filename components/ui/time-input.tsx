import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Select } from "./select";

interface TimeScrollerProps {
	value: string; // Format: "HH:MM" (24h) or "HH:MM AM/PM" (12h)
	onChange: (time: string) => void;
	timeFormat?: "12h" | "24h";
	withTimezone?: boolean;
	className?: string;
}

export const TimeScroller = ({value, onChange, timeFormat = "24h", withTimezone = false, className, }: TimeScrollerProps) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [time, setTime] = React.useState(() => parseTime(value, timeFormat));

	function parseTime(timeStr: string, format: string) {
		if (!timeStr) 
			return { hours: 0, minutes: 0, ampm: "AM" };
		
		if (format === "24h") {
			const [h, m] = timeStr.split(":").map(Number);
			return { 
				hours: h || 0, 
				minutes: m || 0, 
				ampm: h >= 12 ? "PM" : "AM" 
			};
		} else {
			const [timePart, period] = timeStr.split(" ");
			const [h, m] = timePart.split(":").map(Number);
			return { 
				hours: h || 0, 
				minutes: m || 0, 
				ampm: period || "AM" 
			};
		}
	}

	const updateTime = (newTime: typeof time) => {
		setTime(newTime);
		
		let formattedTime;
		if (timeFormat === "24h") {
			let hours = newTime.hours;
			if (newTime.ampm === "PM" && hours < 12) 
				hours += 12;
			if (newTime.ampm === "AM" && hours === 12) 
				hours = 0;
			formattedTime = `${String(hours).padStart(2, "0")}:${String(newTime.minutes).padStart(2, "0")}`;
		} else {
			formattedTime = `${newTime.hours}:${String(newTime.minutes).padStart(2, "0")} ${newTime.ampm}`;
		}
		
		onChange(withTimezone ? `${formattedTime}` : formattedTime);
	};

	const adjustTime = (field: "hours" | "minutes", delta: number) => {
		const newTime = { ...time };
		
		if (field === "hours") {
			const max = timeFormat === "12h" ? 12 : 24;
			newTime.hours = (newTime.hours + delta + max) % max;
			if (timeFormat === "12h" && newTime.hours === 0) 
				newTime.hours = 12;
		} else {
			newTime.minutes = (newTime.minutes + delta + 60) % 60;
		}
		
		updateTime(newTime);
	};

	const toggleAmPm = () => {
		updateTime({ ...time, ampm: time.ampm === "AM" ? "PM" : "AM" });
	};

	return (
		<div className={cn("relative", className)}>
			<Button
				variant="outline"
				className="w-full justify-between border-2"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="flex items-center">
					<ClockIcon className="mr-2 h-4 w-4" />
					{timeFormat === "24h"
						? `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`
						: `${time.hours}:${String(time.minutes).padStart(2, "0")} ${time.ampm}`}
				</div>
				<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
			</Button>

			{isOpen && (
				<div className="absolute z-10 mt-1 w-full p-4 bg-white border-2 rounded-md shadow-lg">
					{/* Time Picker */}
					<div className="flex justify-center items-center space-x-4 mb-4">
						{/* Hours */}
						<div className="flex flex-col items-center">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => adjustTime("hours", 1)}
								className="h-8 w-8"
							>
								<ChevronUp className="h-4 w-4" />
							</Button>
							<div className="text-2xl font-mono px-4 py-2 border-2 rounded-md my-1">
								{String(time.hours).padStart(2, "0")}
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => adjustTime("hours", -1)}
								className="h-8 w-8"
							>
								<ChevronDown className="h-4 w-4" />
							</Button>
						</div>

						<div className="text-2xl">
							:
						</div>

						{/* Minutes */}
						<div className="flex flex-col items-center">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => adjustTime("minutes", 1)}
								className="h-8 w-8"
							>
								<ChevronUp className="h-4 w-4" />
							</Button>
							<div className="text-2xl font-mono px-4 py-2 border-2 rounded-md my-1">
								{String(time.minutes).padStart(2, "0")}
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => adjustTime("minutes", -1)}
								className="h-8 w-8"
							>
								<ChevronDown className="h-4 w-4" />
							</Button>
						</div>

						{/* AM/PM Toggle */}
						{timeFormat === "12h" && (
							<div className="flex flex-col ml-4">
								<Button
									variant={time.ampm === "AM" ? "default" : "ghost"}
									size="sm"
									onClick={toggleAmPm}
									className="mb-1 h-8"
								>
									AM
								</Button>
								<Button
									variant={time.ampm === "PM" ? "default" : "ghost"}
									size="sm"
									onClick={toggleAmPm}
									className="h-8"
								>
									PM
								</Button>
							</div>
						)}
					</div>

					<div className="flex justify-end">
						<Button size="sm" onClick={() => setIsOpen(false)}>
							Done
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

// Add this if you don't have Lucide icons imported
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	);
}