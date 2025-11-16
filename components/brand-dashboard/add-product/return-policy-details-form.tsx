import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { RefundSwitch } from "@/components/ui/refund-switch";
import { Textarea } from "@/components/ui/textarea";
import { useProductFormStore } from "@/hooks/local-store/useProductFormStore";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { toast } from "sonner";
import { validateReturnPolicy } from "@/lib/validation-logics/add-product-validation/product-schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { ProductReturnPolicyInterface } from "@/lib/validation-logics/add-product-validation/product-return-policy-schema";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { submitFormData } from "@/lib/api-helpers";

interface ReturnPolicyProps {
    currencySymbol: string;
}
export interface RestockingFee { 
    type: 'percentage' | 'fixed';
    value: number;
}

const defaultProductReturnPolicy: ProductReturnPolicyInterface ={
    isReturnable: "non-returnable",
    useProductSpecificReturnPolicy: false,
    returnWindowDays: 7,
    conditionRequirements: {
        unwornAndUnwashed: true,
        originalPackagingAndTagsIntact: true,
        notADiscountedItem: true,
        notCustomMade: true,
        damagedItem: {
            allowed: true,
            imagesRequired: true,
        },
        finalSaleItemsNotAllowed: true,
        otherConditions: false,
    },
    returnShippingResponsibility:{
        brandPays: false,
        customerPays: true,
        dependsOnReason: false,
    },
    refundMethods: {
        fullRefund: true,
        storeCredit: false,
        exchange: false,
        replace: false,
    },
    refundProcessingTimeDays: 7,
    restockingFee: {
        type: 'fixed',
        value: 0,
    },
    returnInstructions: "",
}

const ReturnPolicyDetailsForm: FC<ReturnPolicyProps> = ({ currencySymbol }) => {
    const [productReturnPolicy, setProductReturnPolicy] = useState<ProductReturnPolicyInterface>(defaultProductReturnPolicy);
    
    const { productId } = useProductFormStore();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const dataToValidate = {
            ...productReturnPolicy,
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
        setProductReturnPolicy(prev => ({
            ...prev,
            [name]: parseInt(value, 10) || 0,
        }));
    };

    const handleRestockingFeeValueChange = (value: number | undefined) => {
        setProductReturnPolicy(prev => ({
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
        setProductReturnPolicy(prev => ({
            ...prev,
            restockingFee: {
                ...prev.restockingFee!,
                value: isNaN(numericValue) ? 0 : numericValue,
            },
        }));
    };
    
    const handleRestockingFeeTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setProductReturnPolicy(prev => ({
            ...prev,
            restockingFee: { 
                ...prev.restockingFee!, 
                type: e.target.value as 'percentage' | 'fixed',
                value: 0 // Reset value when switching type
            },
        }));
    };


    const handleConditionChange = (key: string, checked: boolean) => {
        setProductReturnPolicy(prev => ({
            ...prev,
            conditionRequirements: {
                ...prev.conditionRequirements,
                [key]: checked
            }
        }))
    }

    const handleStringInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProductReturnPolicy(prev => ({
            ...prev,
            [name]: name === "exclusions" ? value.split(',').map(s => s.trim()) : value,
        }))
    }

    const handleStatusChange = (newStatus: "returnable" | "non-returnable") => {
        setProductReturnPolicy({
            ...productReturnPolicy,
            isReturnable: newStatus,
            // Reset custom policy toggle if making it non-returnable
            useProductSpecificReturnPolicy: newStatus === "non-returnable" ? false : productReturnPolicy.useProductSpecificReturnPolicy
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
		const toastId = toast.loading("Saving return policy...");
		const finalProductReturnPolicy = {
			...productReturnPolicy,
			productId: productId,
		};

		const formData = new FormData();
		formData.append("returnPolicyData", JSON.stringify(finalProductReturnPolicy));

		await submitFormData(
			'/api/products/upload-return-policy',
			formData,
			{
				loadingMessage: "Saving return policy...",
				successMessage: "Return policy saved successfully!",
				errorMessage: "Failed to save return policy.",
			}
		);
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
                        status={productReturnPolicy.isReturnable}
                        onStatusChange={handleStatusChange}
                    />
                </div>

                {/* --- 2. Custom Policy Switch (Aligned with RefundSwitch) --- */}
                <div className="flex flex-col w-full">
					{productReturnPolicy.isReturnable === "returnable" && (
						<>
							<Label 
								htmlFor="useCustomPolicy" 
								className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2"
							>
								Use **Product-Specific** Return Policy
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
								checked={productReturnPolicy.useProductSpecificReturnPolicy}
								onCheckedChange={(checked) => 
									setProductReturnPolicy(prev => ({
										...prev,
										useProductSpecificReturnPolicy: checked,
									}))
								}
							/>
						</>
					)}
				</div>                
            </div>
            
            {/* --- Conditional Product-Specific Policy Form Section (Indented) --- */}
            {productReturnPolicy.isReturnable === "returnable" && productReturnPolicy.useProductSpecificReturnPolicy && (
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
									value={productReturnPolicy.returnWindowDays}
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
									value={productReturnPolicy.refundProcessingTimeDays}
									onChange={handleNumberInputChange}
								/>
							</div>
						</div>
					</div>

                    <div className="my-2">
                        <Label className="flex items-center gap-1 text-sm font-bold text-gray-900 my-2" htmlFor="conditionRequirements">Condition Requirements</Label>
                        <div className="mt-2 space-y-2">
                            {Object.entries(productReturnPolicy.conditionRequirements).map(([key, value]) => {
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
                                    checked={productReturnPolicy.conditionRequirements.damagedItem.allowed} 
                                    onCheckedChange={(checked) => setProductReturnPolicy(prev => ({ 
                                        ...prev, 
                                        conditionRequirements: { 
                                            ...prev.conditionRequirements, 
                                            damagedItem: { ...prev.conditionRequirements.damagedItem, allowed: checked } 
                                        } 
                                    }))} 
                                />
                                <label htmlFor="damagedItemAllowed" className="ml-2 block text-sm text-gray-900">Allowed</label>
                                
                                {productReturnPolicy.conditionRequirements.damagedItem.allowed && (
                                    <>
                                        <Switch 
                                            id="damagedItemImagesRequired" 
                                            checked={productReturnPolicy.conditionRequirements.damagedItem.imagesRequired ?? false} 
                                            onCheckedChange={(checked) => setProductReturnPolicy(prev => ({ 
                                                ...prev, 
                                                conditionRequirements: { 
                                                    ...prev.conditionRequirements, 
                                                    damagedItem: { ...prev.conditionRequirements.damagedItem, imagesRequired: checked } 
                                                } 
                                            }))} 
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
                            {Object.entries(productReturnPolicy.returnShippingResponsibility).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                    <Switch 
                                        id={`shipping-${key}`} 
                                        name={`shipping-${key}`} 
                                        checked={value} 
                                        onCheckedChange={(checked) => setProductReturnPolicy(prev => ({ 
                                            ...prev, 
                                            returnShippingResponsibility: { ...prev.returnShippingResponsibility, [key]: checked } 
                                        }))} 
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
                            {Object.entries(productReturnPolicy.refundMethods).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                    <Switch 
                                        id={`refund-${key}`} 
                                        name={`refund-${key}`} 
                                        checked={value} 
                                        onCheckedChange={(checked) => setProductReturnPolicy(prev => ({ 
                                            ...prev, 
                                            refundMethods: { ...prev.refundMethods, [key]: checked } 
                                        }))} 
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
									checked={productReturnPolicy.restockingFee.type === 'fixed'}
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
									checked={productReturnPolicy.restockingFee.type === 'percentage'}
									onChange={handleRestockingFeeTypeChange}
									className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
									
								/>
								<Label htmlFor="percentage" className="ml-2 text-sm cursor-pointer">Percentage</Label>
							</div>
                        </div>
						{/* Input for the fee value */}
						<div className="flex items-center">
							<div className="w-20 flex items-center justify-center h-10">
								{productReturnPolicy.restockingFee.type === 'fixed' ? '$' : '%'}
							</div>
							{productReturnPolicy.restockingFee.type === 'fixed' ? (
								<MoneyInput
									numericValue={productReturnPolicy.restockingFee.value}
									onNumericChange={handleRestockingFeeValueChange}
									className="flex-1 rounded-l-none"
								/>
							) : (
								<Input
									type="number"
									value={productReturnPolicy.restockingFee.value}
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
                                value={productReturnPolicy.returnInstructions}
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