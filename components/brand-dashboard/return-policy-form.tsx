"use client";

import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoneyInput } from "../ui/money-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import 'react-phone-number-input/style.css'
import ReturnPolicySwitchSection from "./return-policy-switch-section";
import ReturnAddressSection from "./return-address-section";
import { ReturnPolicyInterface, validateReturnPolicy } from "@/lib/return-policy-validation";
import { z } from "zod";
import ConfirmationModal from "../modals/confirmation-modal";
import PhoneInput from "react-phone-number-input";
import { updateBrandReturnPolicy } from "@/actions/edit-brand-details/update-brand-return-policy";
import { toast } from "sonner";

interface ReturnPolicyFormProps {
    userId: string;
    data: ReturnPolicyInterface | null;
}

const defaultPolicy: ReturnPolicyInterface = {
    policyScope: 'brand',
    returnWindowDays: 14,
    conditionRequirements: {
        unwornAndUnwashed: true,
        originalPackagingAndTagsIntact: true,
        notADiscountedItem: false,
        notCustomMade: false,
        damagedItem: {
            allowed: true,
            imagesRequired: true,
        },
        finalSaleItemsNotAllowed: true,
        otherConditions: false,
    },
    returnShippingResponsibility: {
        brandPays: false,
        customerPays: true,
        dependsOnReason: false,
    },
    returnReasons: {
        wrongSize: true,
        defectiveItem: true,
        notAsDescribed: true,
        changedMind: false,
        wrongItemSent: true,
        otherReasons: "",
    },
    returnMethods: {
        customerShipsBack: true,
        brandProvidesReturnLabel: false,
        arrangePickup: false,
    },
    refundMethods: {
        fullRefund: true,
        storeCredit: true,
        exchange: true,
        replace: true,
    },
    refundProcessingTimeDays: 7,
    restockingFee: {
        type: 'fixed',
        value: 0,
    },
    returnAddress: {
        contactPerson: "",
        addressLine: "",
        city: "",
        region: "",
        postalCode: "",
        country: "",
        phoneNumber: "",
        email: "",
    },
    returnContact: {
        name: "",
        email: "",
        phoneNumber: "",
    },
    returnInstructions: "",
};

const ReturnPolicyForm: FC<ReturnPolicyFormProps> = ({ userId, data }) => {
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const [refundPolicy, setRefundPolicy] = useState<ReturnPolicyInterface>(data || defaultPolicy);
    const [errors, setErrors] = useState<z.ZodFormattedError<ReturnPolicyInterface> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRestockingFeeTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRefundPolicy(prev => ({
            ...prev,
            restockingFee: { 
                ...prev.restockingFee!, 
                type: e.target.value as 'percentage' | 'fixed',
                value: 0
            },
        }));
    };

    useEffect(() => {
        setRefundPolicy(data || defaultPolicy);
    }, [data]);

    const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRefundPolicy(prev => ({
            ...prev,
            [name]: parseInt(value, 10) || 0,
        }));
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, key] = name.split('.');
            setRefundPolicy(prev => ({
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [key]: value,
                },
            }));
        }
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
                value: isNaN(numericValue) ? 0 : Math.min(100, Math.max(0, numericValue)), // Clamp between 0-100
            },
        }));
    };

    const handleNestedSwitchChange = (section: keyof ReturnPolicyInterface, key: string, checked: boolean) => {
        setRefundPolicy(prev => {
            const sectionData = prev[section] as any;
            return {
                ...prev,
                [section]: {
                    ...sectionData,
                    [key]: checked,
                },
            };
        });
    };

    const handleDamagedItemChange = (key: 'allowed' | 'imagesRequired', checked: boolean) => {
        setRefundPolicy(prev => ({
            ...prev,
            conditionRequirements: {
                ...prev.conditionRequirements,
                damagedItem: {
                    ...prev.conditionRequirements.damagedItem,
                    [key]: checked,
                }
            }
        }));
    };

    const handleStringInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [section, key] = name.split('.');
            setRefundPolicy(prev => ({
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [key]: value,
                },
            }));
        } else {
            setRefundPolicy(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handlePhoneChange = (value: string | undefined) => {
        setRefundPolicy(prev => ({
            ...prev,
            returnAddress: {
                ...prev.returnAddress,
                phoneNumber: value || "",
            }
        }));
    };

    const handleContactPhoneChange = (value: string | undefined) => {
        setRefundPolicy(prev => ({
            ...prev,
            returnContact: {
                ...prev.returnContact,
                phoneNumber: value || "",
            }
        }));
    };

    const validateForm = (): boolean => {
        const result = validateReturnPolicy(refundPolicy);
        if (!result.success) {
            setErrors(result.error.format());
            return false;
        }
        setErrors(null);
        return true;
    };

    const handleBlur = () => {
        validateForm();
    };

    const findFirstError = (currentErrors: z.ZodFormattedError<ReturnPolicyInterface>) => {
        const errorKeys = Object.keys(currentErrors).filter(key => key !== '_errors');
        for (const key of errorKeys) {
            // Special handling for nested fields like returnAddress.addressLine
            const selector = key.includes('.') ? `[name="${key}"]` : `[name="${key}"], [id^="${key}."]`;
            return document.querySelector(selector);
        }
        return null;
    };

    const handleOpenConfirmation = (e: FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsConfirmationOpen(true);
        }
        else {
            const validationErrors = validateReturnPolicy(refundPolicy);
            toast.error("Please fix the errors before saving.", {
                description: "Review the fields marked in red and try again.",
            });
            // Use a timeout to ensure the state has updated and the DOM reflects the errors
            setTimeout(() => {
                if (!validationErrors.success) {
                    const firstErrorElement = findFirstError(validationErrors.error.format());
                    firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    (firstErrorElement as HTMLElement)?.focus({ preventScroll: true });
                }
            }, 100);
        }
    };

    const handleConfirmSubmit = async () => {
        setIsConfirmationOpen(false);
        if (!validateForm()) {
            toast.error("Please fix the validation errors before submitting.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Saving your return policy...");

        try {
            const result = await updateBrandReturnPolicy(refundPolicy, userId);
            const successMessage = typeof result.message === "string"
                ? result.message
                : "Return policy updated successfully.";
            const errorMessageFromResult = typeof result.message === "string"
                ? result.message
                : "Failed to update return policy.";

            if (result.success) {
                toast.success(successMessage, {
                    id: toastId,
                });
            } else {
                toast.error(errorMessageFromResult, {
                    id: toastId,
                });
            }

        } catch (error) {
            console.error("Error saving policy:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Error: ${errorMessage}`, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <form onSubmit={handleOpenConfirmation} className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                        Return Policy
                    </h2>
                    <p className="text-gray-500">
                        Define your return policy to inform customers about the terms and conditions for returning products.
                    </p>
                </div>

                {/* Core Policy Section */}
                <Card className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Core Policy</CardTitle>
                        <CardDescription>Set the main rules for your returns.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="returnWindowDays" className="flex items-center gap-1">
                                Return Window (days)*
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={14} className="cursor-help text-gray-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Number of days customers have to return items after delivery</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <Input
                                type="number"
                                id="returnWindowDays"
                                name="returnWindowDays"
                                value={refundPolicy.returnWindowDays === 0 ? '' : refundPolicy.returnWindowDays }
                                onChange={handleNumberInputChange}
                                onBlur={handleBlur}
                                placeholder="e.g., 30"
                                min="0"
                                className="mt-2"
                            />
                            {errors?.returnWindowDays?._errors[0] && (
                                <p className="text-red-500 text-xs mt-1">{errors.returnWindowDays._errors[0]}</p>
                            )}
                        </div>

                        <div>
                            <Label className="flex items-center gap-1 mb-4">
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
                                        id="restockingFeeFixed"
                                        name="restockingFeeType"
                                        value="fixed"
                                        checked={refundPolicy.restockingFee?.type === 'fixed'}
                                        onChange={handleRestockingFeeTypeChange}
                                        className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                    />
                                    <Label htmlFor="restockingFeeFixed" className="ml-2 text-sm cursor-pointer">
                                        Fixed Amount
                                    </Label>
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
                                    <Label htmlFor="restockingFeePercentage" className="ml-2 text-sm cursor-pointer">
                                        Percentage (%)
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-20 flex items-center justify-center h-10">
                                    {refundPolicy.restockingFee?.type === 'fixed' ? '$' : '%'}
                                </div>
                                {refundPolicy.restockingFee?.type === 'fixed' ? (
                                    <MoneyInput
                                        name="restockingFeeValue"
                                        onNumericChange={handleRestockingFeeValueChange}
                                        className="flex-1 rounded-l-none"
                                        numericValue={refundPolicy.restockingFee?.value || 0.00}
                                        required
                                        onBlur={handleBlur}
                                        placeholder="0.00"
                                    />
                                ) : (
                                    <Input
                                        name="restockingFeeValue"
                                        type="number"
                                        value={refundPolicy.restockingFee?.value === 0 ? '' : refundPolicy.restockingFee?.value }
                                        onChange={handleRestockingFeePercentageChange}
                                        placeholder="0.00"
                                        onBlur={handleBlur}
                                        className="flex-1 rounded-l-none"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                )}
                            </div>
                            
                            {errors?.restockingFee?.value?._errors[0] && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.restockingFee.value._errors[0]}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Condition Requirements */}
                <ReturnPolicySwitchSection
                    title="Condition Requirements"
                    description="Define what condition items must be in to be eligible for return"
                    section="conditionRequirements"
                    data={refundPolicy.conditionRequirements as any}
                    onCheckedChange={handleNestedSwitchChange as any}
                    options={[
                        { key: "unwornAndUnwashed", label: "Unworn and unwashed", tooltip: "Item must not show any signs of wear or washing" },
                        { key: "originalPackagingAndTagsIntact", label: "Original packaging and tags intact", tooltip: "All original packaging and tags must be present and undamaged" },
                        { key: "notADiscountedItem", label: "Not a discounted/sale item", tooltip: "Items purchased on sale may not be returnable" },
                        { key: "notCustomMade", label: "Not custom made", tooltip: "Custom or personalized items cannot be returned" },
                        { key: "finalSaleItemsNotAllowed", label: "Final sale items not allowed", tooltip: "Final sale items may not be returned" },
                        { key: "otherConditions", label: "Other specific conditions", tooltip: "Additional conditions may apply" },
                    ]}
                />  

                {/* Return shipping responsibility */}
                <ReturnPolicySwitchSection
                    title="Return Shipping Responsibility"
                    description="Who is responsible for return shipping costs"
                    section="returnShippingResponsibility"
                    data={refundPolicy.returnShippingResponsibility}
                    onCheckedChange={handleNestedSwitchChange as any}
                    options={[
                        { key: "brandPays", label: "We pay for return shipping", tooltip: "The brand covers all return shipping costs" },
                        { key: "customerPays", label: "Customer pays for return shipping", tooltip: "The customer is responsible for return shipping costs" },
                        { key: "dependsOnReason", label: "Depends on return reason", tooltip: "Return shipping costs vary based on the reason for return" },
                    ]}
                />

                
                {/* Damaged Items Special Handling */}
                <Card className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Damaged Items Policy</CardTitle>
                        <CardDescription>Special handling for damaged or defective items</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="damagedItem-allowed" className="cursor-pointer">
                                Accept damaged items for return
                            </Label>
                            <Switch
                                id="damagedItem-allowed"
                                checked={refundPolicy.conditionRequirements.damagedItem.allowed}
                                onCheckedChange={(checked) => handleDamagedItemChange('allowed', checked)}
                            />
                        </div>
                        
                        {refundPolicy.conditionRequirements.damagedItem.allowed && (
                            <div className="flex items-center justify-between pl-4 border-l-2">
                                <Label htmlFor="damagedItem-imagesRequired" className="cursor-pointer">
                                    Require images of damage
                                </Label>
                                <Switch
                                    id="damagedItem-imagesRequired"
                                    checked={refundPolicy.conditionRequirements.damagedItem.imagesRequired ?? false}
                                    onCheckedChange={(checked) => handleDamagedItemChange('imagesRequired', checked)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Return Reasons */}
                <ReturnPolicySwitchSection
                    title="Accepted Return Reasons"
                    description="Select which reasons customers can use for returns"
                    section="returnReasons"
                    data={refundPolicy.returnReasons as any}
                    onCheckedChange={handleNestedSwitchChange as any}
                    options={[
                        { key: "wrongSize", label: "Wrong size/fit", tooltip: "Customer ordered wrong size" },
                        { key: "defectiveItem", label: "Defective item", tooltip: "Item has manufacturing defects" },
                        { key: "notAsDescribed", label: "Not as described", tooltip: "Item doesn't match description or photos" },
                        { key: "changedMind", label: "Changed mind", tooltip: "Customer no longer wants the item" },
                        { key: "wrongItemSent", label: "Wrong item sent", tooltip: "Incorrect item was shipped" },
                    ]}
                />

                {/* Other Reasons Text Input */}
                {refundPolicy.returnReasons.otherReasons !== undefined && (
                    <Card className="border-2 rounded-none">
                        <CardHeader>
                            <CardTitle>Other Accepted Reasons</CardTitle>
                            <CardDescription>Specify any additional return reasons</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="returnReasons.otherReasons"
                                value={refundPolicy.returnReasons.otherReasons}
                                onChange={handleStringInputChange}
                                placeholder="List other acceptable return reasons, separated by commas"
                                rows={3}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Return Methods */}
                <ReturnPolicySwitchSection
                    title="Return Methods"
                    description="How customers can return items to you"
                    section="returnMethods"
                    data={refundPolicy.returnMethods}
                    onCheckedChange={handleNestedSwitchChange as any}
                    options={[
                        { key: "customerShipsBack", label: "Customer ships back", tooltip: "Customer arranges and pays for return shipping" },
                        { key: "brandProvidesReturnLabel", label: "We provide return label", tooltip: "We email a prepaid return shipping label" },
                        { key: "arrangePickup", label: "Arrange pickup", tooltip: "We schedule a pickup from customer's location" },
                    ]}
                />

                {/* Refund Types */}
                <ReturnPolicySwitchSection
                    title="Refund Types"
                    description="How customers receive their refund or resolution"
                    section="refundMethods"
                    data={refundPolicy.refundMethods}
                    onCheckedChange={handleNestedSwitchChange as any}
                    options={[
                        { key: "fullRefund", label: "Full refund", tooltip: "Complete refund to original payment method" },
                        { key: "storeCredit", label: "Store credit", tooltip: "Credit for future purchases" },
                        { key: "exchange", label: "Exchange", tooltip: "Swap for a different item" },
                        { key: "replace", label: "Replacement", tooltip: "Send a replacement of the same item" },
                    ]}
                />
                {/* Refund Processing Time */}  
                <Card className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Refund Processing Time</CardTitle>
                        <CardDescription>Time taken to process refunds after receiving returned items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label htmlFor="refundProcessingTimeDays" className="flex items-center gap-1">
                                Processing Time (days)*
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={14} className="cursor-help text-gray-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Number of days to process the refund after receiving the returned item</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <Input
                                type="number"
                                id="refundProcessingTimeDays"
                                name="refundProcessingTimeDays"
                                value={refundPolicy.refundProcessingTimeDays === 0 ? '' : refundPolicy.refundProcessingTimeDays }
                                onChange={handleNumberInputChange}
                                onBlur={handleBlur}
                                placeholder="e.g., 7"
                                min="1"
                                className="mt-2"
                            />
                            {errors?.refundProcessingTimeDays?._errors[0] && (
                                <p className="text-red-500 text-xs mt-1">{errors.refundProcessingTimeDays._errors[0]}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Return Address */}
                <ReturnAddressSection
                    address={refundPolicy.returnAddress}
                    errors={errors?.returnAddress}
                    onStringChange={handleStringInputChange}
                    onSelectChange={handleSelectChange}
                    onPhoneChange={handlePhoneChange}
                    onBlur={handleBlur}
                />

                <Card className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Custom Return Instructions</CardTitle>
                        <CardDescription>
                            Provide additional notes for your customers (e.g. packaging instructions, restocking fee, or items that can’t be returned). This will appear on the product’s Return Policy section.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div>
                            <Label>Return Instructions</Label>
                            <Textarea
                                name="returnInstructions"
                                value={refundPolicy.returnInstructions}
                                onChange={handleStringInputChange}
                                onBlur={handleBlur}
                                placeholder="Add any specific return instructions for your customers here..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Return Contact */}
                <Card className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Return Contact Information</CardTitle>
                        <CardDescription>
                            Contact details for customers to reach out regarding returns.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="returnContact.name">Name*</Label>
                            <Input
                                id="returnContact.name"
                                name="returnContact.name"
                                value={refundPolicy.returnContact.name}
                                onChange={handleStringInputChange}
                                onBlur={handleBlur}
                                placeholder="John Doe"
                            />
                            {errors?.returnContact?.name?._errors[0] && (
                                <p className="text-red-500 text-xs mt-1">{errors.returnContact.name._errors[0]}</p>
                            )}
                        </div>

                        <div>   
                            <Label htmlFor="returnContact.email">Email*</Label>
                            <Input
                                id="returnContact.email"
                                name="returnContact.email"
                                type="email"
                                value={refundPolicy.returnContact.email}
                                onChange={handleStringInputChange}
                                onBlur={handleBlur}
                                placeholder="returns@yourcompany.com"
                            />
                            {errors?.returnContact?.email?._errors[0] && (
                                <p className="text-red-500 text-xs mt-1">{errors.returnContact.email._errors[0]}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="returnContact.phoneNumber">Phone Number</Label>
                            <div className="flex items-center gap-2">
                                <PhoneInput
                                    international
                                    value={refundPolicy.returnContact.phoneNumber}
                                    onChange={handleContactPhoneChange}
                                    className={cn(
                                        "w-full",
                                        "flex h-12 rounded-none border-2 bg-background px-3 py-2 text-sm file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                                    )}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* Policy Summary Preview */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle>Policy Summary Preview</CardTitle>
                        <CardDescription>How your policy will appear to customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-white">
                                    {refundPolicy.returnWindowDays} days
                                </Badge>
                                <span>Return window</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(refundPolicy.returnReasons)
                                    .filter(([key, value]) => value && key !== 'otherReasons')
                                    .map(([key]) => (
                                        <Badge key={key} variant="secondary">
                                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        </Badge>
                                    ))}
                            </div>
                            
                            {refundPolicy.restockingFee.value > 0 && (
                                <div className="text-amber-600">
                                    <strong>Restocking fee:</strong> {refundPolicy.restockingFee.value}
                                    {refundPolicy.restockingFee.type === 'percentage' ? '%' : '$'}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Policy"}
                    </Button>
                </div>
            </form>

            {isConfirmationOpen && (
                <ConfirmationModal
                    title="Confirm Save"
                    description="Are you sure you want to save these return policy settings? To avoid affecting orders in progress, these changes will take effect in 48 hours."
                    onConfirm={handleConfirmSubmit}
                    onCancel={() => setIsConfirmationOpen(false)}
                />
            )}
        </>
        
    )
}

export default ReturnPolicyForm;