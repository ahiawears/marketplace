import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { RefundSwitch } from "@/components/ui/refund-switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { toast } from "sonner";
import { ReturnPolicyValidationSchema } from "@/lib/validation-logics/add-product-validation/product-schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { submitFormData } from "@/lib/api-helpers";

interface ReturnPolicyProps {
	currencySymbol: string;
}
export interface RestockingFee { 
	type: 'percentage' | 'fixed';
	value: number;
}

interface ReturnPolicyInterface {
	isReturnable: "refundable" | "non-refundable"; 
	returnWindowDays?: number; 
	refundMethods?: ("originalPayment" | "exchange")[];
	returnMethods?: ("pickup" | "dropoff" | "shipBack")[];
	restockingFee?: RestockingFee; 
	returnShippingCost?: "buyer" | "seller" | "shared";
	conditionRequirements?: {
		unused?: boolean;
		originalPackaging?: boolean;
		tagsAttached?: boolean;
	};
	exclusions?: string[]; 
	notes?: string;
	internationalReturnsAllowed?: boolean;
	internationalReturnWindowDays?: number;
	customsAndDutiesResponsibility?: "buyer" | "seller";
	internationalReturnNotes?: string;
}

const ReturnPolicyDetailsForm: FC<ReturnPolicyProps> = ({ currencySymbol }) => {
    const [refundPolicy, setRefundPolicy] = useState<ReturnPolicyInterface> ({
        isReturnable: "non-refundable",
        returnWindowDays: 0,
        refundMethods: [],
        returnMethods: [],
        restockingFee: {
            type: 'fixed',
            value: 0.00
        },
        returnShippingCost: "buyer",
        conditionRequirements: {
            unused: true,
            originalPackaging: true,
            tagsAttached: true,
        },
        exclusions: [] as string[],
        notes: "",
        internationalReturnsAllowed: false,
        internationalReturnWindowDays: 0,
        customsAndDutiesResponsibility: "buyer",
        internationalReturnNotes: "",
    });
    const { productId } = useProductFormStore();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const dataToValidate = {
            ...refundPolicy,
            productId: productId,
        };

        const result = 
		ReturnPolicyValidationSchema.safeParse(dataToValidate);
        if (!result.success) {
            const flatErrors = result.error.flatten().fieldErrors;
            setErrors(flatErrors);
            toast.error("Please fix the errors highlighted below.");
            return false;
        }
        setErrors({});
        return true;
    };

	const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setRefundPolicy(prev => ({
			...prev,
			[name]: parseInt(value, 10) || 0,
		}));
	};

	const handleRestockingFeeValueChange = (value: number | undefined) => {
		setRefundPolicy(prev => ({
			...prev,
			restockingFee: {
                ...prev.restockingFee!,
                value: value || 0.00,
            },
		}));
	};

    const handleRestockingFeePercentageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const numericValue = parseFloat(value);
        setRefundPolicy(prev => ({
            ...prev,
            restockingFee: {
                ...prev.restockingFee!,
                value: isNaN(numericValue) ? 0 : numericValue,
            },
        }));
    };
    const handleRestockingFeeTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRefundPolicy(prev => ({
            ...prev,
            restockingFee: { ...prev.restockingFee!, type: e.target.value as 'percentage' | 'fixed' },
        }));
    };

	const handleArrayChange = (e: ChangeEvent<HTMLInputElement>, fieldName: 'refundMethods' | 'returnMethods') => {
		const { value, checked } = e.target;
		setRefundPolicy(prev => {
			const currentArray = prev[fieldName] || [];
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

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const finalReturnPolicy = {
            ...refundPolicy,
            productId: productId
        };

        const formData = new FormData();
        formData.append('returnPolicy', JSON.stringify(finalReturnPolicy));

        await submitFormData('/api/products/upload-return-policy', formData, {
            loadingMessage: "Saving return policy...",
            successMessage: "Return policy saved successfully!",
        });

        setIsSubmitting(false);
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
										value={refundPolicy.returnWindowDays === 0 ? '' : refundPolicy.returnWindowDays}
										onChange={handleNumberInputChange}
										placeholder="e.g., 30"
                                        min="0"
									/>
                                    {errors.returnWindowDays && <p className="text-red-500 text-xs mt-1">{errors.returnWindowDays[0]}</p>}
								</div>
							</div>
							<div className="my-4">
								<div className="flex items-center gap-1">
									<label className="block text-sm font-bold text-gray-900" htmlFor="restockingFee">
										Restocking Fee:*
									</label>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Info size={14} className="cursor-help text-gray-500" />
											</TooltipTrigger>
											<TooltipContent>
												<p className="max-w-xs">The percentage is calculated based on the price of the specific product variant at the time of purchase. For cross-border sales, this will be based on the transaction currency.</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
                                <div className="flex gap-4 my-2">
                                    <div className="flex items-center">
                                        <Input
                                            type="radio"
                                            id="restockingFeeFixed"
                                            name="restockingFeeType"
                                            value="fixed"
                                            checked={refundPolicy.restockingFee?.type === 'fixed'}
                                            onChange={handleRestockingFeeTypeChange}
                                            className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                        />
                                        <label htmlFor="restockingFeeFixed" className="ml-2 text-sm peer-checked:text-black">Fixed Amount</label>
                                    </div>
                                    <div className="flex items-center">
                                        <Input
                                            type="radio"
                                            id="restockingFeePercentage"
                                            name="restockingFeeType"
                                            value="percentage"
                                            checked={refundPolicy.restockingFee?.type === 'percentage'}
                                            onChange={handleRestockingFeeTypeChange}
                                            className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                        />
                                        <label htmlFor="restockingFeePercentage" className="ml-2 text-sm peer-checked:text-black">Percentage (%)</label>
                                    </div>
                                </div>
								<div className="my-2 flex items-center">
									<Input
										name="currencySymbol"
										type="text"
										value={refundPolicy.restockingFee?.type === 'fixed' ? currencySymbol : '%'}
										readOnly
										required
										disabled
										className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
									/>
									{refundPolicy.restockingFee?.type === 'fixed' ? (
										<MoneyInput
											name="restockingFeeValue"
											onNumericChange={handleRestockingFeeValueChange}
											className="border-2 rounded-none"
											numericValue={refundPolicy.restockingFee?.value || 0.00}
											required
											placeholder="0.00"
										/>
									) : (
										<Input
											name="restockingFeeValue"
											type="number"
											value={refundPolicy.restockingFee?.value === 0 ? '' : refundPolicy.restockingFee?.value}
											onChange={handleRestockingFeePercentageChange}
											placeholder="0.00"
											className="border-2 rounded-none w-4/5"
											min="0"
											max="100"
										/>
									)}
									
                                    {errors.restockingFee && <p className="text-red-500 text-xs mt-1">{typeof errors.restockingFee === 'string' ? errors.restockingFee : errors.restockingFee.value[0]}</p>}
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
													checked={refundPolicy.refundMethods?.includes(method as "originalPayment" | "exchange") ?? false}
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
                                    {errors.refundMethods && <p className="text-red-500 text-xs mt-1">{errors.refundMethods[0]}</p>}
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
													checked={refundPolicy.returnMethods?.includes(method as "pickup" | "dropoff" | "shipBack") ?? false}
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
                                    {errors.returnMethods && <p className="text-red-500 text-xs mt-1">{errors.returnMethods[0]}</p>}
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
                                {errors.returnShippingCost && <p className="text-red-500 text-xs mt-1">{errors.returnShippingCost[0]}</p>}
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
                                {errors.conditionRequirements && <p className="text-red-500 text-xs mt-1">{errors.conditionRequirements[0]}</p>}
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
                                        {errors.exclusions && <p className="text-red-500 text-xs mt-1">{errors.exclusions[0]}</p>}
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
                                        {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes[0]}</p>}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
                </Card>
            )}

			<Card className="my-4 border-2 rounded-none">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">International & Cross-Border Returns</CardTitle>
					<CardDescription>Configure a separate policy for international sales. If disabled, the standard policy above will apply.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-2">
						<Switch
							id="international-returns"
							checked={refundPolicy.internationalReturnsAllowed ?? false}
							onCheckedChange={(checked) => setRefundPolicy(prev => ({ ...prev, internationalReturnsAllowed: checked }))}
						/>
						<Label htmlFor="international-returns">Enable Separate International Return Policy</Label>
					</div>

					{refundPolicy.internationalReturnsAllowed && (
						<div className="mt-4 space-y-4 border-t pt-4">
							<div>
								<label htmlFor="internationalReturnWindowDays" className="block text-sm font-bold text-gray-900">
									International Return Window (in days):*
								</label>
								<div className="my-1">
									<Input
										type="number"
										name="internationalReturnWindowDays"
										value={refundPolicy.internationalReturnWindowDays === 0 ? '' : refundPolicy.internationalReturnWindowDays}
										onChange={handleNumberInputChange}
										placeholder="e.g., 45"
										min="0"
									/>
									{errors.internationalReturnWindowDays && <p className="text-red-500 text-xs mt-1">{errors.internationalReturnWindowDays[0]}</p>}
								</div>
							</div>

							<div>
								<label className="block text-sm font-bold text-gray-900">
									Customs & Duties Responsibility:*
								</label>
								<p className="text-xs text-gray-600 mb-2">Who is responsible for any customs and duties fees on the returned item?</p>
								<div className="my-1 flex space-x-4">
									{['buyer', 'seller'].map(resp => (
										<div key={resp} className="flex items-center">
											<Input
												type="radio"
												name="customsAndDutiesResponsibility"
												value={resp}
												checked={refundPolicy.customsAndDutiesResponsibility === resp}
												onChange={handleStringInput}
												className={cn("h-5 w-5 mr-2 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
											/>
											<label className="text-sm">{resp.charAt(0).toUpperCase() + resp.slice(1)}</label>
										</div>
									))}
								</div>
								{errors.customsAndDutiesResponsibility && <p className="text-red-500 text-xs mt-1">{errors.customsAndDutiesResponsibility[0]}</p>}
							</div>

							<div>
								<label className="block text-sm font-bold text-gray-900">Additional International Notes</label>
								<div className="my-1">
									<Textarea
										name="internationalReturnNotes"
										rows={3}
										value={refundPolicy.internationalReturnNotes ?? ''}
										onChange={handleStringInput}
										className="w-full border-2 p-2"
										placeholder="e.g., Customer must use a tracked shipping service for all international returns."
									/>
									{errors.internationalReturnNotes && <p className="text-red-500 text-xs mt-1">{errors.internationalReturnNotes[0]}</p>}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

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