import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { RefundSwitch } from "@/components/ui/refund-switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChangeEvent, FC, FormEvent, useState } from "react";

interface ReturnPolicyProps {
	currencySymbol: string;
}
export interface RestockingFee {
	type: 'percentage' | 'fixed';
	value: number;
}
export type RefundMethod = 'original_payment' | 'store_credit' | 'exchange';

export interface ItemConditionRequirements {
	mustBeUnused: boolean;
	mustHaveOriginalTags: boolean;
	mustBeInOriginalPackaging: boolean;
	otherConditions: string;
}
export interface GeneralReturnPolicy {
	returnWindowDays: number;
	isReturnShippingFree: boolean;
	restockingFee: RestockingFee | null;
	acceptedRefundMethods: RefundMethod[];
	conditionRequirements: ItemConditionRequirements;
}
export interface ReturnAddress {
	useCentralized: boolean; 
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
}

export interface BrandReturnPolicy {
	isReturnable: "refundable" | "non-refundable"; // Quick yes/no flag
	general: GeneralReturnPolicy;
	exceptions: string;
	returnAddress: ReturnAddress;
	userFacingPolicyText: string;
}

interface ReturnPolicyInterface {
	isReturnable: "refundable" | "non-refundable"; // Quick yes/no flag
	returnWindowDays?: number; // How long after delivery a return is allowed
	refundMethods?: ("originalPayment" | "exchange")[];
	returnMethods?: ("pickup" | "dropoff" | "shipBack")[];
	restockingFee?: number; 
	returnShippingCost?: "buyer" | "seller" | "shared";
	conditionRequirements?: {
		unused?: boolean;
		originalPackaging?: boolean;
		tagsAttached?: boolean;
	};
	exclusions?: string[]; 
	notes?: string;
}

const ReturnPolicyDetailsForm: FC<ReturnPolicyProps> = ({ currencySymbol }) => {
    const [refundPolicy, setRefundPolicy] = useState<ReturnPolicyInterface> ({
        isReturnable: "non-refundable",
        returnWindowDays: 0,
        refundMethods: [],
        returnMethods: [],
        restockingFee: 0.00,
        returnShippingCost: "buyer",
        conditionRequirements: {
            unused: true,
            originalPackaging: true,
            tagsAttached: true,
        },
        exclusions: [] as string[],
        notes: "",
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleFormInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRefundPolicy({
            ...refundPolicy,
            [e.target.name]: e.target.value,
        })
    }

	// Modify handleNumberInput to accept either event or direct value
	const handleNumberInput = (e: ChangeEvent<HTMLInputElement> | number, name?: string) => {
		if (typeof e === 'number' && name) {
			setRefundPolicy(prev => ({
				...prev,
				[name]: e
			}));
		} else if (typeof e !== 'number') {
			const { name, value } = e.target;
			setRefundPolicy(prev => ({
				...prev,
				[name]: parseFloat(value)
			}));
		}
	};

	const handleArrayChange = (e: ChangeEvent<HTMLInputElement>, fieldName: keyof ReturnPolicyInterface) => {
		const { value, checked } = e.target;
		setRefundPolicy(prev => {
			const currentArray = (prev[fieldName] as string[] || []);
			const newArray = checked
				? [...currentArray, value]
				: currentArray.filter(item => item !== value);
			return {
				...prev,
				[fieldName]: newArray
			}
		});
	}

	const handleConditionChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setRefundPolicy(prev => ({
			...prev,
			conditionRequirements: {
				...prev.conditionRequirements,
				[name]: checked
			}
		}))
	}

	const handleStringInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setRefundPolicy(prev => ({
			...prev,
			[name]: name === "exclusions" ? value.split(',').map(s => s.trim()) : value,
		}))
	}

    const handleStatusChange = (newStatus: "refundable" | "non-refundable") => {
        setRefundPolicy({
            ...refundPolicy,
            isReturnable: newStatus,
        })
    }

    const handleSave = async (e: FormEvent<HTMLFormElement | HTMLSelectElement>) => {
        e.preventDefault();
		console.log("The refund policy is: ", refundPolicy);
        // setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSave}>
            <div className="my-4 border-2 p-4">
                <label 
                    htmlFor="isReturnable"
                    className="block text-sm font-bold text-gray-900 my-2"
                >
                    Is Returnable?
                </label>
                <p className="text-xs text-gray-600 mb-3">
                    Set if this product is refundable or non-refundable.
                </p>
                <RefundSwitch
                    status={refundPolicy.isReturnable}
                    onStatusChange={handleStatusChange}
                />
            </div>

            {refundPolicy.isReturnable === "refundable" && (
                <Card className="my-4 border-2 rounded-none">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Product Return Policy</CardTitle>
                        <CardDescription>Configure the details of your return policy.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="my-4">
								<label htmlFor="returnWindowDays"  className="block text-sm font-bold text-gray-900">
									Return Window (in days):*
								</label>
								<div className="my-1">
									<Input
										type="number"
										name="returnWindowDays"
										value={refundPolicy.returnWindowDays}
										onChange={handleNumberInput}
										className="border-2 rounded-none"
									/>
								</div>
							</div>
							<div className="my-4">
								<label className="block text-sm font-bold text-gray-900" htmlFor="restockingFee">
									Restocking Fee:*
								</label>
								<div className="my-1 flex items-center">
									<Input
										name="currencySymbol"
										type="text"
										value={currencySymbol}
										readOnly
										required
										disabled
										className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
									/>
									<MoneyInput
										name="restockingFee"
										onNumericChange={handleNumberInput}
										className="border-2 rounded-none"
										numericValue={refundPolicy.restockingFee ? refundPolicy.restockingFee : 0.00}
										required
										placeholder="0.00"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

								<div className="my-4">
									<label 
										className="block text-sm font-bold text-gray-900"
									>
										Refund Methods:*
									</label>
									<div className="my-1 space-y-2">
										{['originalPayment', 'exchange'].map(method => (
											<div key={method} className="flex items-center">
												<Input
													type="checkbox"
													name="refundMethods"
													value={method}
													checked={refundPolicy.refundMethods?.includes(method as any) ?? false}
													onChange={(e) => handleArrayChange(e, 'refundMethods')}
													className={cn(
																"h-5 w-5 mr-2 border-2 cursor-pointer",
																"peer appearance-none",
																"checked:bg-black checked:border-transparent"
															)}
												/>
												<label className="text-sm">{method.charAt(0).toUpperCase() + method.slice(1).replace(/([A-Z])/g, ' $1').trim()}</label>
											</div>
										))}
									</div>
								</div>
								<div className="my-4">
									<label 
										className="block text-sm font-bold text-gray-900"
									>
										Return Methods:*
									</label>
									<div className="my-1 space-y-2">

										{['pickup', 'dropoff', 'shipBack'].map(method => (
											<div key={method} className="flex items-center cursor-pointer">
												<Input
													type="checkbox"
													name="returnMethods"
													value={method}
													checked={refundPolicy.returnMethods?.includes(method as any) ?? false}
													onChange={(e) => handleArrayChange(e, 'returnMethods')}
													className={cn(
																"h-5 w-5 mr-2 border-2 cursor-pointer",
																"peer appearance-none",
																"checked:bg-black checked:border-transparent"
															)}
												/>
												<label className="text-sm">{method.charAt(0).toUpperCase() + method.slice(1).replace(/([A-Z])/g, ' $1').trim()}</label>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="my-4">
								<label 
									className="block text-sm font-bold text-gray-900"
								>
									Return Shipping Cost
								</label>
								<div className="my-1 flex space-x-4">
									{['buyer', 'seller', 'shared'].map(cost => (
										<div key={cost} className="flex items-center">
											<Input
												type="radio"
												name="returnShippingCost"
												value={cost}
												checked={refundPolicy.returnShippingCost === cost}
												onChange={handleStringInput}
												className={cn(
																"h-5 w-5 mr-2 border-2 cursor-pointer",
																"peer appearance-none",
																"checked:bg-black checked:border-transparent"
															)}
											/>
											<label className="text-sm">{cost.charAt(0).toUpperCase() + cost.slice(1)}</label>
										</div>
									))}
								</div>
							</div>
							<div className="my-4">
								<label
									className="block text-sm font-bold text-gray-900"
								>
									Condition Requirements:*
								</label>
								<div className="space-y-2 my-1">
									{Object.entries(refundPolicy.conditionRequirements || {}).map(([key, value]) => (
										<div key={key} className="flex items-center">
											<Input
												type="checkbox"
												name={key}
												checked={value}
												onChange={handleConditionChange}
												className={cn(
																"h-5 w-5 mr-2 border-2 cursor-pointer",
																"peer appearance-none",
																"checked:bg-black checked:border-transparent"
															)}
											/>
											<label className="text-sm">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}</label>
										</div>
									))}
								</div>
							</div>
							<div className="space-y-4">
								<div className="my-4">
									<label 
										className="block text-sm font-bold text-gray-900"
									>
										Exclusions
									</label>
									<div className="my-1">
										<Textarea
											name="exclusions"
											rows={3}
											value={refundPolicy.exclusions?.join(', ') ?? ''}
											onChange={handleStringInput}
											className="w-full border-2 p-2"
											placeholder="e.g., clearance items, final sale, personalized products"
										/>
									</div>
								</div>

								<div className="my-4">
									<label 
										className="block text-sm font-bold text-gray-900"
									>
										Additional Notes
									</label>
									<div className="my-1">
										<Textarea
											name="notes"
											rows={3}
											value={refundPolicy.notes ?? ''}
											onChange={handleStringInput}
											className="w-full border-2 p-2"
											placeholder="e.g., Items must be returned within business hours."
										/>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
                </Card>
            )}
			<div className="my-6 flex justify-end">
				<Button
					type="submit"
					disabled={isSubmitting}
					className="flex justify-center px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
				>
					{isSubmitting ? "Saving..." : "Save Policy"}
				</Button>
			</div>
        </form>
    )
}

export default ReturnPolicyDetailsForm;