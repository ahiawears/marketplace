"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { FC, useEffect, useState, useMemo } from "react";
import { Select } from "./select";

export interface DatePickerProps {
	value: string;
	onChange: (date: string) => void;
	className?: string;
	id?: string;
	minDate?: Date;
	maxDate?: Date;
}

const DatePicker: FC<DatePickerProps> = ({ 
	value, 
	onChange, 
	className, 
	id,
	minDate = new Date(),
	maxDate
}) => {
	const [day, setDay] = useState<string>("");
	const [month, setMonth] = useState<string>("");
	const [year, setYear] = useState<string>("");
	const [validationError, setValidationError] = useState<string>("");

  	// Parse the value when component mounts or value changes
	useEffect(() => {
		if (value) {
			const [parsedYear, parsedMonth, parsedDay] = value.split('-');
			setYear(parsedYear || "");
			setMonth(parsedMonth || "");
			setDay(parsedDay || "");
		} else {
			setDay("");
			setMonth("");
			setYear("");
		}
	}, [value]);

	// Generate options
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
	const months = [
		{ value: "01", label: "Jan" },
		{ value: "02", label: "Feb" },
		{ value: "03", label: "Mar" },
		{ value: "04", label: "Apr" },
		{ value: "05", label: "May" },
		{ value: "06", label: "Jun" },
		{ value: "07", label: "Jul" },
		{ value: "08", label: "Aug" },
		{ value: "09", label: "Sep" },
		{ value: "10", label: "Oct" },
		{ value: "11", label: "Nov" },
		{ value: "12", label: "Dec" }
	];

	const days = useMemo(() => {
		if (!month || !year) {
			return Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
		}
		
		const monthNum = parseInt(month);
		const yearNum = parseInt(year);
		
		if (monthNum === 2) {
			const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
			const febDays = isLeapYear ? 29 : 28;
			return Array.from({ length: febDays }, (_, i) => (i + 1).toString().padStart(2, '0'));
		}
		
		if ([4, 6, 9, 11].includes(monthNum)) {
			return Array.from({ length: 30 }, (_, i) => (i + 1).toString().padStart(2, '0'));
		}
		
		return Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
	}, [month, year]);

	const isPastDate = (year: string, month: string, day: string): boolean => {
		if (!year || !month || !day) return false;
		
		const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		const today = new Date();
		today.setHours(0, 0, 0, 0); 
		
		return selectedDate < today;
	};

	const isValidDate = (year: string, month: string, day: string): boolean => {
		if (!year || !month || !day) return false;
		
		const monthNum = parseInt(month);
		const dayNum = parseInt(day);
		const yearNum = parseInt(year);
		
		// Basic validation
		if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return false;
		if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return false;
		if (isNaN(yearNum) || yearNum < currentYear) return false;
		
		// Check specific month-day combinations
		const date = new Date(yearNum, monthNum - 1, dayNum);
		return date.getFullYear() === yearNum && 
			date.getMonth() === monthNum - 1 && 
			date.getDate() === dayNum;
	};

  	const handleDateChange = (type: 'day' | 'month' | 'year', newValue: string) => {
		let newDay = day;
		let newMonth = month;
		let newYear = year;
		let error = "";

		switch (type) {
			case 'day':
				newDay = newValue;
				setDay(newValue);
				break;
			case 'month':
				newMonth = newValue;
				setMonth(newValue);
				// Reset day if month changes to prevent invalid combinations
				if (day) {
					const daysInNewMonth = getDaysInMonth(newMonth, newYear || year);
					if (parseInt(day) > daysInNewMonth) {
						newDay = "";
						setDay("");
					}
				}
				break;
			case 'year':
				newYear = newValue;
				setYear(newValue);
				// Reset day if year changes and it's February
				if (month === "02" && day) {
					const daysInFeb = getDaysInMonth("02", newValue);
					if (parseInt(day) > daysInFeb) {
						newDay = "";
						setDay("");
					}
				}
				break;
		}

		// Validate the date when all fields are filled
		if (newDay && newMonth && newYear) {
			if (!isValidDate(newYear, newMonth, newDay)) {
				error = "Invalid date for selected month";
			} else if (isPastDate(newYear, newMonth, newDay)) {
				error = "Cannot select a date in the past";
			} else {
				const formattedDate = `${newYear}-${newMonth}-${newDay}`;
				onChange(formattedDate);
				setValidationError("");
				return;
			}
		}
    
		setValidationError(error);
		onChange(""); 
  	};

	// Helper function to get days in a month
	const getDaysInMonth = (month: string, year: string): number => {
		if (!month) return 31;
		
		const monthNum = parseInt(month);
		const yearNum = year ? parseInt(year) : new Date().getFullYear();
		
		if (monthNum === 2) {
			const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
			return isLeapYear ? 29 : 28;
		}
		
		return [4, 6, 9, 11].includes(monthNum) ? 30 : 31;
	};

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex gap-2">
				{/* Day Dropdown */}
				<div className="flex-1">
					<label htmlFor={`${id}-day`} className="block text-xs font-medium text-gray-700 mb-1">Day</label>
					<div className="relative">
						<Select
							id={`${id}-day`}
							value={day}
							onChange={(e) => handleDateChange('day', e.target.value)}
							className="w-full appearance-none rounded-none border-2 px-3 py-2 pr-8 cursor-pointer"
						>
							<option value="">DD</option>
							{days.map((d) => (
								<option key={d} value={d}>
								{d}
								</option>
							))}
						</Select>
						<ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
					</div>
				</div>

				{/* Month Dropdown */}
				<div className="flex-1">
					<label htmlFor={`${id}-month`} className="block text-xs font-medium text-gray-700 mb-1">Month</label>
					<div className="relative">
						<Select
							id={`${id}-month`}
							value={month}
							onChange={(e) => handleDateChange('month', e.target.value)}
							className="w-full appearance-none rounded-none border-2 px-3 py-2 pr-8 cursor-pointer"
						>
							<option value="">MM</option>
							{months.map((m) => (
								<option key={m.value} value={m.value}>
								{m.label}
								</option>
							))}
						</Select>
						<ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
					</div>
				</div>

				{/* Year Dropdown */}
				<div className="flex-1">
					<label htmlFor={`${id}-year`} className="block text-xs font-medium text-gray-700 mb-1">Year</label>
					<div className="relative">
						<Select
							id={`${id}-year`}
							value={year}
							onChange={(e) => handleDateChange('year', e.target.value)}
							className="w-full appearance-none rounded-none border-2 px-3 py-2 pr-8 cursor-pointer"
						>
							<option value="">YYYY</option>
							{years.map((y) => (
								<option key={y} value={y}>
								{y}
								</option>
							))}
						</Select>
						<ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
					</div>
				</div>
			</div>

			{/* Validation feedback */}
			{validationError && (
				<p className="text-sm text-red-600">{validationError}</p>
			)}

			{/* Selected date preview */}
			{day && month && year && !validationError && (
				<p className="text-sm text-green-600">
					{new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', { 
						weekday: 'long', 
						year: 'numeric', 
						month: 'long', 
						day: 'numeric' 
					})}
				</p>
			)}
		</div>
	);
};

export { DatePicker };