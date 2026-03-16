import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { RefundSwitch } from "@/components/ui/refund-switch";
import { Textarea } from "@/components/ui/textarea";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { ChangeEvent, FC, FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { ReturnPolicySchemaType, validateReturnPolicy } from "@/lib/validation-logics/add-product-validation/product-schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { submitFormData } from "@/lib/api-helpers";
import { ReturnPolicy as GlobalReturnPolicy } from "@/lib/return-policy-validation";

interface ReturnPolicyProps {
    currencySymbol: string;
    globalReturnPolicy: GlobalReturnPolicy | null;
    onSaveSuccess?: () => void;
}
export interface RestockingFee { 
    type: 'percentage' | 'fixed';
    value: number;
}

const mapGlobalToProductReturnPolicy = (globalPolicy: GlobalReturnPolicy): ReturnPolicySchemaType => ({
    productId: "",
    isReturnable: globalPolicy.isActive ? "returnable" : "non-returnable",
    useProductSpecificReturnPolicy: false,
    returnWindowDays: globalPolicy.returnWindowDays,
    conditionRequirements: {
        unwornAndUnwashed: globalPolicy.conditionRequirements.unwornAndUnwashed,
        originalPackagingAndTagsIntact: globalPolicy.conditionRequirements.originalPackaging,
        notADiscountedItem: globalPolicy.conditionRequirements.notDiscounted,
        notCustomMade: globalPolicy.conditionRequirements.notCustomMade,
        damagedItem: {
            allowed: globalPolicy.conditionRequirements.damagedItem.allowed,
            imagesRequired: globalPolicy.conditionRequirements.damagedItem.imagesRequired,
        },
        finalSaleItemsNotAllowed: globalPolicy.conditionRequirements.finalSaleNotAllowed,
        otherConditions: Boolean(globalPolicy.conditionRequirements.otherConditions),
    },
    returnShippingResponsibility: {
        brandPays: globalPolicy.returnShipping.responsibility === "brand",
        customerPays: globalPolicy.returnShipping.responsibility === "customer",
        dependsOnReason: globalPolicy.returnShipping.responsibility === "depends_on_reason",
    },
    refundMethods: {
        fullRefund: globalPolicy.refundMethods.includes("full_refund"),
        storeCredit: globalPolicy.refundMethods.includes("store_credit"),
        exchange: globalPolicy.refundMethods.includes("exchange"),
        replace: globalPolicy.refundMethods.includes("replacement"),
    },
    refundProcessingTimeDays: globalPolicy.refundProcessingTimeDays,
    restockingFee: {
        type: globalPolicy.restockingFee.type === "percentage" ? "percentage" : "fixed",
        value: globalPolicy.restockingFee.type === "none" ? 0 : (globalPolicy.restockingFee.value ?? 0),
    },
    returnInstruction: globalPolicy.returnInstructions || "",
});

const ReturnPolicyDetailsForm: FC<ReturnPolicyProps> = ({ currencySymbol, globalReturnPolicy, onSaveSuccess }) => {
    const { productId, setReturnPolicy, returnPolicy } = useProductFormStore();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});
    const inheritedPolicy = useMemo(
        () => globalReturnPolicy ? mapGlobalToProductReturnPolicy(globalReturnPolicy) : null,
        [globalReturnPolicy]
    );

    const validateForm = () => {
        if (returnPolicy.isReturnable === "returnable" && !returnPolicy.useProductSpecificReturnPolicy && !inheritedPolicy) {
            setErrors({
                useProductSpecificReturnPolicy: ["No global return policy was found. Create one first or enable a product-specific policy."],
            });
            return false;
        }

        const dataToValidate = {
            ...(returnPolicy.useProductSpecificReturnPolicy ? returnPolicy : inheritedPolicy || returnPolicy),
            productId: productId,
        };

        // const result = ReturnPolicyValidationSchema.safeParse(dataToValidate);
        // if (!result.success) {
        //     const flatErrors = result.error.flatten().fieldErrors;
        //     setErrors(flatErrors);
        //     toast.error("Please fix the errors highlighted below.");
        //     return false;
        // }
        // setErrors({});
        // return true;
		const result = validateReturnPolicy(dataToValidate);
		if (!result.success) {
			const flatErrors = result.error.flatten().fieldErrors;
			setErrors(flatErrors);
			return false;
		}
		setErrors(null);
		return true;
    };

    const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>) => {

        const { name, value } = e.target;
        const fieldName = name as keyof ReturnPolicySchemaType;
        setReturnPolicy({ [fieldName]: parseInt(value, 10) || 0, });
    };

    const handleRestockingFeeValueChange = (value: number | undefined) => {
        setReturnPolicy({
            ...returnPolicy,
            restockingFee: {
                ...returnPolicy.restockingFee!,
                value: value || 0.00,
            },
        });
    };

    const handleRestockingFeePercentageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const numericValue = parseFloat(value);
        setReturnPolicy({
            ...returnPolicy,
            restockingFee: {
                ...returnPolicy.restockingFee,
                value: isNaN(numericValue) ? 0 : numericValue,
            }

        })
    };
    
    const handleRestockingFeeTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setReturnPolicy({
            ...returnPolicy,
            restockingFee: {
                ...returnPolicy.restockingFee!,
                type: e.target.value as 'percentage' | 'fixed',
                value: 0
            }
        })
    };


    const handleConditionChange = (key: string, checked: boolean) => {
        setReturnPolicy({
            ...returnPolicy,
            conditionRequirements: {
                ...returnPolicy.conditionRequirements,
                [key]: checked
            }
        })
    }

    const handleStringInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReturnPolicy({
            ...returnPolicy,
            [name]: name === "exclusions" ? value.split(',').map(s => s.trim()) : value,
        });
    };


    const handleStatusChange = (newStatus: "returnable" | "non-returnable") => {
        setReturnPolicy({
            ...returnPolicy,
            isReturnable: newStatus,
            useProductSpecificReturnPolicy: newStatus === "non-returnable" ? false : returnPolicy.useProductSpecificReturnPolicy,
        })
    }
    
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        // if (validateForm()) {
        //     setIsSubmitting(true);
        //     // Example submission logic
        //     console.log("Submitting return policy:", productReturnPolicy);
        //     // await submitFormData('/api/products/return-policy', productReturnPolicy);
        //     setIsSubmitting(false);
        //     toast.success("Return Policy saved successfully!");
        // }
		if (!validateForm()) {
			toast.error("Please fix the validation errors before submitting");
			return;
		}

		setIsSubmitting(true);
		const finalProductReturnPolicy = {
			...(returnPolicy.useProductSpecificReturnPolicy ? returnPolicy : inheritedPolicy || returnPolicy),
			productId: productId,
            useProductSpecificReturnPolicy: returnPolicy.useProductSpecificReturnPolicy,
		};

		const formData = new FormData();
		formData.append("returnPolicyData", JSON.stringify(finalProductReturnPolicy));

		const result = await submitFormData(
			'/api/products/upload-return-policy',
			formData,
			{
				loadingMessage: "Saving return policy...",
				successMessage: "Return policy saved successfully!",
				errorMessage: "Failed to save return policy.",
			}
		);

        if (result) {
            onSaveSuccess?.();
        }
		setIsSubmitting(false);
    }

    // Helper to format keys like 'unwornAndUnwashed' to 'Unworn And Unwashed'
    const formatKey = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="my-4 flex flex-col md:flex-row md:justify-between">
                
                {/* --- 1. Is Returnable? Control --- */}
                <div className="flex flex-col w-full">
                    <Label 
                        htmlFor="isReturnable"
                        className="block text-sm font-bold text-gray-900 my-2"
                    >
                        Is Returnable?
                    </Label>
                    <p className="text-xs text-gray-600 mb-3">
                        Set if this product is returnable or non-returnable.
                    </p>
                    <RefundSwitch
                        status={returnPolicy.isReturnable}
                        onStatusChange={handleStatusChange}
                    />
                </div>

                {/* --- 2. Custom Policy Switch (Aligned with RefundSwitch) --- */}
                <div className="flex flex-col w-full">
					{returnPolicy.isReturnable === "returnable" && (
						<>
							<Label 
								htmlFor="useCustomPolicy" 
								className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2"
							>
								Use Product-Specific Return Policy
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="h-4 w-4 text-gray-400 cursor-help" />
										</TooltipTrigger>
										<TooltipContent>
											<p>If disabled, the store's **Global Policy** will be used.</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</Label>
								
							
							<p className="text-xs text-gray-600 mb-3">
								Define a policy specific to this product.
							</p>
							<Switch
								id="useCustomPolicy"
								checked={returnPolicy.useProductSpecificReturnPolicy}
								onCheckedChange={(checked) => {
                                    if (checked && inheritedPolicy) {
                                        setReturnPolicy({
                                            ...inheritedPolicy,
                                            productId: productId,
                                            isReturnable: returnPolicy.isReturnable,
                                            useProductSpecificReturnPolicy: true,
                                        });
                                        return;
                                    }

                                    
                                    setReturnPolicy({
                                        ...returnPolicy,
                                        useProductSpecificReturnPolicy: checked,
                                    })
								}}
							/>
						</>
					)}
				</div>                
            </div>

            {returnPolicy.isReturnable === "returnable" && !returnPolicy.useProductSpecificReturnPolicy && (
                <div className="rounded-none border-2 bg-gray-50 p-4 text-sm">
                    {globalReturnPolicy ? (
                        <div className="space-y-2">
                            <p className="font-semibold">This product will inherit the brand global return policy.</p>
                            <p>Return window: {globalReturnPolicy.returnWindowDays} days</p>
                            <p>Refund methods: {globalReturnPolicy.refundMethods.join(", ").replaceAll("_", " ")}</p>
                            <p>Shipping responsibility: {globalReturnPolicy.returnShipping.responsibility.replaceAll("_", " ")}</p>
                            {globalReturnPolicy.returnInstructions && (
                                <p>Instructions: {globalReturnPolicy.returnInstructions}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-red-600">
                            No global return policy found. Create one first, or enable a product-specific policy for this product.
                        </p>
                    )}
                    {errors?.useProductSpecificReturnPolicy?.[0] && (
                        <p className="mt-2 text-xs text-red-500">{errors.useProductSpecificReturnPolicy[0]}</p>
                    )}
                </div>
            )}
            
            {/* --- Conditional Product-Specific Policy Form Section (Indented) --- */}
            {returnPolicy.isReturnable === "returnable" && returnPolicy.useProductSpecificReturnPolicy && (
                <div className="flex flex-col">
					<div className="w-full flex flex-col md:flex-row gap-6 my-4">
						<div className="w-full">
							<Label htmlFor="returnWindowDays" className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2">
								Return Window (Days)
							</Label>
							<div className="mt-2">
								<Input
									type="number"
									name="returnWindowDays"
									id="returnWindowDays"
									value={returnPolicy.returnWindowDays === 0 ? "" : returnPolicy.returnWindowDays}
									onChange={handleNumberInputChange}
								/>
							</div>
						</div>

						<div className="w-full">
							<Label htmlFor="refundProcessingTimeDays" className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2">
								Refund Processing Time (Days)
							</Label>
							<div className="mt-2">
								<Input
									type="number"
									name="refundProcessingTimeDays"
									id="refundProcessingTimeDays"
									value={returnPolicy.refundProcessingTimeDays === 0 ? "" : returnPolicy.refundProcessingTimeDays}
									onChange={handleNumberInputChange}
								/>
							</div>
						</div>
					</div>

                    <div className="my-2">
                        <Label className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2" htmlFor="conditionRequirements">Condition Requirements</Label>
                        <div className="mt-2 space-y-2">
                            {Object.entries(returnPolicy.conditionRequirements).map(([key, value]) => {
                                // Exclude complex objects like 'damagedItem' from simple switch mapping here
                                if (typeof value === 'boolean') {
                                    return (
                                        <div key={key} className="flex items-center">
                                            <Switch 
                                                id={key} 
                                                name={key} 
                                                checked={value} 
                                                onCheckedChange={(checked) => handleConditionChange(key, checked)} 
                                            />
                                            <Label htmlFor={key} className="ml-2 block text-sm text-gray-900">
                                                {formatKey(key)}
                                            </Label>
                                        </div>
                                    )
                                }
                                return null;
                            })}
                            {/* Handle Damaged Item as a sub-condition */}
                             <div className="flex items-center space-x-4 pt-2">
                                <label htmlFor="damagedItems">Damaged Item Returns:</label>
                                <Switch 
                                    id="damagedItemAllowed" 
                                    checked={returnPolicy.conditionRequirements.damagedItem.allowed} 
                                   
                                    onCheckedChange={(checked) => setReturnPolicy({
                                        ...returnPolicy,
                                        conditionRequirements: {
                                            ...returnPolicy.conditionRequirements,
                                            damagedItem: {
                                                ...returnPolicy.conditionRequirements.damagedItem,
                                                allowed: checked
                                            }
                                        }
                                    })}
                                />
                                <label htmlFor="damagedItemAllowed" className="ml-2 block text-sm text-gray-900">Allowed</label>
                                
                                {returnPolicy.conditionRequirements.damagedItem.allowed && (
                                    <>
                                        <Switch 
                                            id="damagedItemImagesRequired" 
                                            checked={returnPolicy.conditionRequirements.damagedItem.imagesRequired ?? false} 
                                            onCheckedChange={(checked) => setReturnPolicy({ 
                                                ...returnPolicy, 
                                                conditionRequirements: { 
                                                    ...returnPolicy.conditionRequirements, 
                                                    damagedItem: { ...returnPolicy.conditionRequirements.damagedItem, imagesRequired: checked } 
                                                } 
                                            })} 
                                        />
                                        <label htmlFor="damagedItemImagesRequired" className="ml-2 block text-sm text-gray-900">Images Required</label>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="my-4">
                        <Label className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2" htmlFor="returnShippingResponsibility">Return Shipping Responsibility</Label>
                        <div className="mt-2 space-y-2">
                            {Object.entries(returnPolicy.returnShippingResponsibility).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                    <Switch 
                                        id={`shipping-${key}`} 
                                        name={`shipping-${key}`} 
                                        checked={value} 
                                        onCheckedChange={(checked) => setReturnPolicy({ 
                                            ...returnPolicy, 
                                            returnShippingResponsibility: { ...returnPolicy.returnShippingResponsibility, [key]: checked } 
                                        })} 
                                        
                                    />
                                    <label htmlFor={`shipping-${key}`} className="ml-2 block text-sm text-gray-900">
                                        {formatKey(key)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="my-4">
                        <Label className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2" htmlFor="refundMethods">Refund Methods</Label>
                        <div className="mt-2 space-y-2">
                            {Object.entries(returnPolicy.refundMethods).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                    <Switch 
                                        id={`refund-${key}`} 
                                        name={`refund-${key}`} 
                                        checked={value} 
                                        onCheckedChange={(checked) => setReturnPolicy({ 
                                            ...returnPolicy, 
                                            refundMethods: { ...returnPolicy.refundMethods, [key]: checked } 
                                        })} 
                                    />
                                    <label htmlFor={`refund-${key}`} className="ml-2 block text-sm text-gray-900">
                                        {formatKey(key)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="my-4">
                        <Label className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2" htmlFor="restockingFee">
							Restocking Fee*
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Info size={14} className="cursor-help text-gray-500" />
									</TooltipTrigger>
									<TooltipContent>
										<p className="max-w-xs">Fee charged for processing returns. Percentage is based on the item's purchase price.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Label>
                        <div className="flex gap-4 mb-4">
                            <div className="flex items-center">
								<Input
									type="radio"
									id="fixed"
									name="restockingFeeType"
									value="fixed"
									checked={returnPolicy.restockingFee.type === 'fixed'}
									onChange={handleRestockingFeeTypeChange}
									className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
									
								/>
								<Label htmlFor="fixed" className="ml-2 text-sm cursor-pointer">Fixed Amount</Label>
                            </div>
							<div className="flex items-center">
								<Input
									type="radio"
									id="percentage"
									name="restockingFeeType"
									value="percentage"
									checked={returnPolicy.restockingFee.type === 'percentage'}
									onChange={handleRestockingFeeTypeChange}
									className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
									
								/>
								<Label htmlFor="percentage" className="ml-2 text-sm cursor-pointer">Percentage</Label>
							</div>
                        </div>
						{/* Input for the fee value */}
						<div className="flex items-center">
							<div className="w-20 flex items-center justify-center h-10 text-muted-foreground">
								{returnPolicy.restockingFee.type === 'fixed' ? currencySymbol : '%'}
							</div>
							{returnPolicy.restockingFee.type === 'fixed' ? (
								<MoneyInput
									numericValue={returnPolicy.restockingFee.value}
									onNumericChange={handleRestockingFeeValueChange}
									className="flex-1 rounded-l-none"
								/>
							) : (
								<Input
									type="number"
									value={returnPolicy.restockingFee.value === 0 ? "" : returnPolicy.restockingFee.value}
									onChange={handleRestockingFeePercentageChange}
									max={100}
									min={0}
									className="flex-1 rounded-l-none"
								/>
							)}
						</div>
                    </div>

                    <div className="sm:col-span-6">
                        <Label htmlFor="returnInstructions" className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2">
                            Return Instructions
                        </Label>
                        <div className="mt-2">
                            <Textarea
                                id="returnInstructions"
                                name="returnInstructions"
                                rows={4}
                                value={returnPolicy.returnInstruction}
                                onChange={handleStringInput}
                                className="block w-full py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-600">Provide clear instructions for customers on how to return this specific product.</p>
                    </div>
                </div>
            )}
            
            <div className="my-6 flex justify-end gap-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => console.log("Cancel")}
                >
                    Cancel
                </Button>
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
