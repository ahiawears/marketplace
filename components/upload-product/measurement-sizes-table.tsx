// src/components/upload-product/MeasurementSizesTable.tsx
import React, { FC, useMemo } from 'react';
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { categoriesList } from "../../lib/categoriesList";

interface MeasurementSizesTableProps {
	category: string;
	measurements: Record<string, any>;
	onMeasurementChange: (size: string, field: string, value: number | undefined) => void;
	measurementUnit: "Inch" | "Centimeter";
	onUnitChange: (unit: "Inch" | "Centimeter") => void;
}

const SIZES = [
    "XXS",
    "XS",
    "Small",
    "Medium",
    "Large",
    "XL",
    "XXL",
    "3XL",
    "4XL",
    "One Size",
    "Oversized"
];
const MeasurementSizesTable: React.FC<MeasurementSizesTableProps> = ({
	category,
	measurements,
	onMeasurementChange,
	measurementUnit,
	onUnitChange,
}) => {
	const categoryData = useMemo(() => 
		categoriesList.find((cat) => cat.name === category),
		[category]
	);

	const selectedSizes = useMemo(() => 
		SIZES.filter(size => measurements.hasOwnProperty(size)),
		[measurements]
	);

	if (!category) {
		return <p className="text-gray-500">Please select a category to proceed.</p>;
	}

	const handleSizeSelection = (size: string) => {
		const isSelected = selectedSizes.includes(size);
		
		if (isSelected) {
			onMeasurementChange(size, "remove", 0);
		} else {
			onMeasurementChange(size, "quantity", 0);
			categoryData?.measurements.forEach((measurement) => {
				onMeasurementChange(size, measurement, 0);
			});
		}
	};

	const handleInputChange = (size: string, field: string, value: string, isQuantity: boolean) => {
		if (value === "") {
			onMeasurementChange(size, field, undefined);
			return;
		}

		let numericValue: number | undefined;
		
		if (isQuantity) {
			const parsed = parseInt(value, 10);
			if (!isNaN(parsed) && parsed >= 0) {
				numericValue = parsed;
			}
		} else {
			const parsed = parseFloat(value);
			if (!isNaN(parsed) && parsed >= 0) {
				numericValue = parsed;
			}
		}

		if (numericValue !== undefined) {
			onMeasurementChange(size, field, numericValue);
		}
	};

	return (
		<div className="overflow-x-auto mt-5">
			<h2 className="text-xl font-bold my-4">Category: {categoryData?.name}</h2>

			<MeasurementUnitSelector 
				unit={measurementUnit} 
				onChange={onUnitChange} 
			/>

			<SizeSelector 
				sizes={SIZES}
				selectedSizes={selectedSizes}
				onSelect={handleSizeSelection}
			/>

			{selectedSizes.length > 0 && (
				<MeasurementsTable
					sizes={selectedSizes}
					measurements={measurements}
					categoryData={categoryData}
					measurementUnit={measurementUnit}
					onInputChange={handleInputChange}
				/>
			)}
		</div>
	);
};

const MeasurementUnitSelector: FC<{ unit: string; onChange: (unit: any) => void }> = ({ unit, onChange }) => (
	<div className="my-4 border-2 p-4">
		<label className="block text-sm font-bold text-gray-900">
			Select the measurement unit
		</label>
		<div className="flex gap-4 mt-2">
			{["Inch", "Centimeter"].map((option) => (
				<div key={option} className="flex items-center">
					<Input
						type="radio"
						value={option}
						checked={unit === option}
						onChange={(e) => onChange(e.target.value as "Inch" | "Centimeter")}
						className={cn(
							"h-4 w-4 border-2 cursor-pointer",
							"peer appearance-none",
							"checked:bg-black checked:border-transparent"
						)}
					/>
					<label className="ml-2 text-sm peer-checked:text-black">
						{option}
					</label>
				</div>
			))}
		</div>
	</div>
);

const SizeSelector: FC<{ sizes: string[]; selectedSizes: string[]; onSelect: (size: string) => void }> = ({
	sizes,
	selectedSizes,
	onSelect,
}) => (
	<div className="flex flex-wrap gap-3 mb-4 ">
		{sizes.map((size) => (
			<div
				key={size}
				className={cn(
					"px-3 border-2 py-1 text-sm cursor-pointer transition-colors",
					selectedSizes.includes(size)
						? "bg-black text-white ring-2 ring-black ring-offset-2"
						: "bg-gray-200 text-gray-700 hover:bg-gray-300"
				)}
				onClick={() => onSelect(size)}
			>
				{size}
			</div>
		))}
	</div>
);

const MeasurementsTable: FC<any> = ({ sizes, measurements, categoryData, measurementUnit, onInputChange }) => (
	<table className="table-auto w-full border-collapse border border-gray-300">
		<thead>
			<tr className="bg-gray-100">
				<th className="border-2 px-4 py-2">Size</th>
				{categoryData.measurements.map((measurement: string) => (
					<th key={measurement} className="border-2 px-4 py-2">
						{measurement} ({measurementUnit === "Inch" ? "in" : "cm"})
					</th>
				))}
				<th className="border-2 px-4 py-2">Quantity</th>
			</tr>
		</thead>
		<tbody>
			{sizes.map((size: string) => (
				<tr key={size}>
					<td className="border-2 px-4 py-2 font-medium">{size}</td>
					{categoryData.measurements.map((measurement: string) => (
						<td key={measurement} className="border-2 px-4 py-2">
							<Input
								type="number"
								placeholder={measurement}
								value={measurements[size]?.[measurement] || ""}
								onChange={(e) => onInputChange(size, measurement, e.target.value, false)}
								className="w-full border-2  [&::-webkit-inner-spin-button]:appearance-none"
							/>
						</td>
					))}
					<td className="border-2 px-4 py-2">
						<Input
							type="number"
							placeholder="Quantity"
							value={measurements[size]?.quantity || ""}
							onChange={(e) => onInputChange(size, "quantity", e.target.value, true)}
							className="w-full border-2"
						/>
					</td>
				</tr>
			))}
		</tbody>
	</table>
);

export default MeasurementSizesTable;