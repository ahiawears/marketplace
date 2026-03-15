"use client";

import { ChangeEvent, FC, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { AlertCircle, Info } from "lucide-react";
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
import { ReturnPolicy, returnReasonsSchema, validateReturnPolicy, RETURN_REASONS } from "@/lib/return-policy-validation";
import { z, ZodFormattedError } from "zod";
import ConfirmationModal from "../modals/confirmation-modal";
import PhoneInput from "react-phone-number-input";
import { updateBrandReturnPolicy } from "@/actions/edit-brand-details/update-brand-return-policy";
import { toast } from "sonner";
import { Select } from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type FixedRestockingFee = Extract<ReturnPolicy['restockingFee'], { type: 'fixed' }>;

interface ReturnPolicyFormProps {
    userId: string;
    currencyCode: string;
    todayExchangeRate: number;
    data: ReturnPolicy | null;
}

const defaultPolicy: ReturnPolicy = {
    brandId: "",
    returnWindowDays: 30,
    conditionRequirements: {
        unwornAndUnwashed: true,
        originalPackaging: true,
        tagsIntact: true,
        notDiscounted: false,
        notCustomMade: true,
        damagedItem: {
            allowed: true,
            imagesRequired: true,
            descriptionRequired: false,
        },
        finalSaleNotAllowed: true,
        otherConditions: "",
    },
    returnShipping: {
        responsibility: 'customer',
        paidByBrandReasons: [],
    },
    returnReasons: {
        customerRelated: {
            wrongSize: true,
            changedMind: false,
            notSatisfied: false,
        },
        merchantRelated: {
            defectiveItem: true,
            notAsDescribed: true,
            wrongItemSent: true,
        },
        otherReasons: {
            allowed: false,
            description: "",
        },
    },
    returnMethods: ['customer_ships'],
    refundMethods: ['full_refund', 'store_credit'],
    refundProcessingTimeDays: 14,
    restockingFee: {
        type: 'none',
        value: 0,
        appliesTo: [],
    },
    returnAddress: {
        contactPerson: "",
        addressLine: "",
        addressLine2: "",
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
    specialNotes: "",
    isActive: true,
    version: 1,
    evidenceRequirements: {
        requireImages: false, 
        minImageCount: undefined,
        requirePackagePhoto: false,
        requireSerialNumberPhoto: false,
    },
    exchangePolicy: {
        allowSizeExchange: true,
        allowColorExchange: false,
        allowDifferentProductExchange: false,
        priceDifferenceHandling: "store_credit",
    },
    internationalReturns: {
        allowed: true,
        customerCoversImportFees: true,
        differentReturnWindow: 30,
    },
    returnSubmissionLimits: {
        maxRequestsPerOrder: 3,
        maxRequestsPerItem: 2,
    }
}

const serializePolicySnapshot = (policy: ReturnPolicy) => JSON.stringify(policy);

const ReturnPolicyForm: FC<ReturnPolicyFormProps> = ({ userId, currencyCode, todayExchangeRate, data }) => {
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);
    const router = useRouter();

    const [returnPolicy, setReturnPolicy] = useState<ReturnPolicy>(data || defaultPolicy);
    const [errors, setErrors] = useState<ZodFormattedError<ReturnPolicy> | null>(null);
    const [submissionIssues, setSubmissionIssues] = useState<string[]>([]);
    const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string[]>>({});
    const [savedSnapshot, setSavedSnapshot] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const basePolicy = data || defaultPolicy;

        const hydratedPolicy = {
            ...basePolicy,
            brandId: userId, 
        };

        setReturnPolicy(hydratedPolicy);
        setSavedSnapshot(serializePolicySnapshot(hydratedPolicy));
    }, [data, userId]);

    const isDirty = useMemo(
        () => serializePolicySnapshot(returnPolicy) !== savedSnapshot,
        [returnPolicy, savedSnapshot]
    );

    // Effect to clean up return methods when shipping responsibility changes
    useEffect(() => {
        const responsibility = returnPolicy.returnShipping.responsibility;
        const currentMethods = returnPolicy.returnMethods;
        let newMethods = [...currentMethods];

        if (responsibility === 'brand') {
            // If brand pays, 'customer_ships' is invalid.
            newMethods = newMethods.filter(method => method !== 'customer_ships');
            setReturnPolicy(prev => ({
                ...prev,
                returnShipping: {
                    ...prev.returnShipping, paidByBrandReasons: []
                }
            }));
        } else if (responsibility === 'customer') {
            // If customer pays, only 'customer_ships' is valid.
            newMethods = newMethods.filter(method => method === 'customer_ships');
        }

        if (newMethods.length !== currentMethods.length) {
            setReturnPolicy(prev => ({
                ...prev,
                returnMethods: newMethods,
            }));
        }
    }, [returnPolicy.returnShipping.responsibility]);

    const usdPrice = useMemo(() => {
        if (!todayExchangeRate || currencyCode === "USD" || !returnPolicy.restockingFee.value) return null;
        return (returnPolicy.restockingFee.value / todayExchangeRate).toFixed(2);
    }, [returnPolicy.restockingFee.value, todayExchangeRate, currencyCode]);

    const handleRestockingFeeTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const type = e.target.value as 'percentage' | 'fixed';
        setReturnPolicy(prev => ({
            ...prev,
            restockingFee: type === 'fixed' ? {
                type: 'fixed',
                value: 0,
                usdPrice: 0,
                appliesTo: prev.restockingFee.appliesTo
            } : {
                type: 'percentage',
                value: 0,
                appliesTo: prev.restockingFee.appliesTo
            },
        }));
    };

    const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numeric = parseInt(value, 10);
        if (name.includes(".")) {
            const [section, key] = name.split(".");
            const typedSection = section as keyof ReturnPolicy;
            setReturnPolicy((prev) => ({
                ...prev,
                [typedSection]: {
                    ...(prev[typedSection] as Record<string, unknown>),
                    [key as string]: isNaN(numeric) ? 0 : numeric,
                },
            }));
        } else {
            setReturnPolicy((prev) => ({
                ...prev,
                [name]: isNaN(numeric) ? 0 : numeric,
            }));
        }
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, key] = name.split('.');
            const typedSection = section as keyof ReturnPolicy;
            setReturnPolicy(prev => ({
                ...prev,
                [typedSection]: {
                    ...(typeof prev[typedSection] === "object" && prev[typedSection] !== null ? prev[typedSection] : {}),
                    [key as string]: value,
                },
            }));
        }
    };


    const handleRestockingFeeValueChange = (value: number | undefined) => {
        setReturnPolicy(prev => {
            // If type is 'none', we shouldn't be setting a value at all
            if (prev.restockingFee.type === 'none') {
                return prev;
            }

            const newValue = value ?? 0;

            if (prev.restockingFee.type === 'fixed') {
                let usdPrice: number | undefined;
                if (currencyCode === 'USD') {
                    usdPrice = newValue;
                } else if (todayExchangeRate) {
                    usdPrice = parseFloat((newValue / todayExchangeRate).toFixed(2));
                }
                return {
                    ...prev,
                    restockingFee: {
                        ...prev.restockingFee,
                        value: newValue,
                        usdPrice
                    }
                };
            }

            return {
                ...prev,
                restockingFee: {
                    ...prev.restockingFee,
                    value: newValue,
                },
            };
        });
    };

    const handleRestockingFeePercentageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const numericValue = parseFloat(e.target.value);
        const safeValue = isNaN(numericValue) ? 0 : Math.min(100, Math.max(0, numericValue));

        setReturnPolicy(prev => {
            // Safety check: Only update if the type allows a value
            if (prev.restockingFee.type !== 'percentage') {
                return prev;
            }

            return {
                ...prev,
                restockingFee: {
                    ...prev.restockingFee,
                    value: safeValue,
                },
            };
        });
    };

    const handleNestedSwitchChange = (section: keyof ReturnPolicy, key: string, checked: boolean) => {
        setReturnPolicy(prev => {
            const sectionData = prev[section] as Record<string, string>;
            return {
                ...prev,
                [section]: {
                    ...sectionData,
                    [key as string]: checked,
                },
            };
        });
    };

    const handleDamagedItemChange = (key: 'allowed' | 'imagesRequired' | 'descriptionRequired', checked: boolean) => {
        setReturnPolicy(prev => {
            const newConditionRequirements = { ...prev.conditionRequirements };
            const newDamagedItem = { ...newConditionRequirements.damagedItem, [key]: checked };
            
            // If allowing damaged items is turned off, reset its sub-options
            if (key === 'allowed' && !checked) {
                newDamagedItem.imagesRequired = false;
                newDamagedItem.descriptionRequired = false;
            }

            newConditionRequirements.damagedItem = newDamagedItem;

            return { ...prev, conditionRequirements: newConditionRequirements };
        });
    };

    const handleStringInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [section, key] = name.split(".");
            const typedSection = section as keyof ReturnPolicy;
            setReturnPolicy((prev) => {
                const keys = name.split('.');
                const newState = { ...prev };
                let currentLevel: any = newState;

                for (let i = 0; i < keys.length - 1; i++) {
                    currentLevel[keys[i]] = { ...currentLevel[keys[i]] };
                    currentLevel = currentLevel[keys[i]];
                }
                currentLevel[keys[keys.length - 1]] = value;
                return newState;
            });
        } else {
            setReturnPolicy((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handlePhoneChange = (value: string | undefined) => {
        setReturnPolicy(prev => ({
            ...prev,
            returnAddress: {
                ...prev.returnAddress,
                phoneNumber: value || "",
            }
        }));
    };

    const handleContactPhoneChange = (value: string | undefined) => {
        setReturnPolicy(prev => ({
            ...prev,
            returnContact: {
                ...prev.returnContact,
                phoneNumber: value || "",
            }
        }));
    };

    // Evidence handlers
    const handleEvidenceChange = (key: keyof ReturnPolicy["evidenceRequirements"], value: boolean | number | undefined) => {
        setReturnPolicy((prev) => ({
            ...prev,
            evidenceRequirements: {
                ...prev.evidenceRequirements,
                [key]: value,
                // If requireImages is set to false, reset minImageCount to undefined
                ...(key === "requireImages" && value === false && { minImageCount: undefined }),
            },
        }));
    };

    // Exchange handlers
    const handleExchangeChange = (key: keyof typeof returnPolicy["exchangePolicy"], value: boolean | string) => {
        setReturnPolicy((prev) => ({
            ...prev,
            exchangePolicy: {
                ...prev.exchangePolicy,
                [key]: value,
            },
        }));
    };

    // International handlers
    const handleInternationalChange = (key: keyof typeof returnPolicy["internationalReturns"], value: boolean | number) => {
        setReturnPolicy((prev) => ({
            ...prev,
            internationalReturns: {
                ...prev.internationalReturns,
                [key]: value,
            },
        }));
    };

    // Submission limits
    const handleSubmissionLimitsChange = (key: keyof typeof returnPolicy["returnSubmissionLimits"], value: number) => {
        setReturnPolicy((prev) => ({
            ...prev,
            returnSubmissionLimits: {
                ...prev.returnSubmissionLimits,
                [key]: value,
            },
        }));
    };

    const validateForm = (): boolean => {        
        const result = validateReturnPolicy(returnPolicy);
        if (!result.success) {
            setErrors(result.error.format());
            setServerFieldErrors({});
            return false;
        }
        setErrors(null);
        setServerFieldErrors({});
        return true;
    };

    const formatServerIssues = (result: {
        message?: string;
        errors?: Array<{ path?: (string | number)[]; message?: string }>;
    }) => {
        const fieldErrors: Record<string, string[]> = {};

        if (!Array.isArray(result.errors)) {
            return fieldErrors;
        }

        result.errors.forEach((error) => {
            if (!error?.message) {
                return;
            }

            const path = Array.isArray(error.path) && error.path.length > 0
                ? error.path.join(".")
                : "_form";

            fieldErrors[path] = [...(fieldErrors[path] || []), error.message];
        });

        return fieldErrors;
    };

    const collectServerIssues = (result: {
        message?: string;
        errors?: Array<{ path?: (string | number)[]; message?: string }>;
    }) => {
        const issues = new Set<string>();

        if (Array.isArray(result.errors)) {
            result.errors.forEach((error) => {
                if (error?.message) {
                    issues.add(error.message);
                }
            });
        }

        if (issues.size === 0 && result.message) {
            issues.add(result.message);
        }

        return Array.from(issues);
    };

    const getServerFieldError = (...paths: string[]) => {
        for (const path of paths) {
            const message = serverFieldErrors[path]?.[0];
            if (message) {
                return message;
            }
        }
        return undefined;
    };

    const flattenFormattedErrorPaths = (
        currentErrors: z.ZodFormattedError<ReturnPolicy>,
        prefix = ""
    ): string[] => {
        const paths: string[] = [];

        Object.entries(currentErrors).forEach(([key, value]) => {
            if (key === "_errors" || !value || typeof value !== "object") {
                return;
            }

            const nextPath = prefix ? `${prefix}.${key}` : key;
            const typedValue = value as { _errors?: string[] };

            if (typedValue._errors && typedValue._errors.length > 0) {
                paths.push(nextPath);
            }

            paths.push(...flattenFormattedErrorPaths(value as z.ZodFormattedError<ReturnPolicy>, nextPath));
        });

        return paths;
    };

    const getSectionIdForPath = (path: string) => {
        if (path.startsWith("returnWindowDays")) return "core-policy-section";
        if (path.startsWith("conditionRequirements")) return "conditions-section";
        if (path.startsWith("evidenceRequirements")) return "evidence-section";
        if (path.startsWith("returnShipping") || path.startsWith("returnMethods") || path === "_form") return "shipping-methods-section";
        if (path.startsWith("returnReasons")) return "return-reasons-section";
        if (path.startsWith("refundMethods")) return "refund-methods-section";
        if (path.startsWith("restockingFee")) return "restocking-fee-section";
        if (path.startsWith("exchangePolicy")) return "exchange-policy-section";
        if (path.startsWith("internationalReturns")) return "international-returns-section";
        if (path.startsWith("returnSubmissionLimits")) return "submission-limits-section";
        if (path.startsWith("returnAddress")) return "return-address-section";
        if (path.startsWith("returnContact")) return "return-contact-section";
        return null;
    };

    const scrollToErrorLocation = (paths: string[]) => {
        for (const path of paths) {
            const exactField = document.querySelector(
                `[name="${path}"], #${CSS.escape(path)}`
            ) as HTMLElement | null;

            if (exactField) {
                exactField.scrollIntoView({ behavior: "smooth", block: "center" });
                exactField.focus?.({ preventScroll: true });
                return;
            }

            const sectionId = getSectionIdForPath(path);
            if (sectionId) {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.scrollIntoView({ behavior: "smooth", block: "center" });
                    return;
                }
            }
        }
    };

    const scrollToRenderedError = () => {
        const firstError = formRef.current?.querySelector("p.text-red-500") as HTMLElement | null;
        if (!firstError) {
            return;
        }

        const nearestSection = firstError.closest('[id$="-section"]') as HTMLElement | null;
        const target = nearestSection || firstError;

        target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleBlur = (): void => {
        validateForm();
    };

    // Helper to render return reasons badges in preview (simple mapping)
    const flattenReasonsForPreview = () => {
        const reasons: string[] = [];
        const rr = returnPolicy.returnReasons;
        if (rr.customerRelated.wrongSize) reasons.push("wrong size");
        if (rr.customerRelated.changedMind) reasons.push("changed mind");
        if (rr.customerRelated.notSatisfied) reasons.push("not satisfied");
        if (rr.merchantRelated.defectiveItem) reasons.push("defective");
        if (rr.merchantRelated.notAsDescribed) reasons.push("not as described");
        if (rr.merchantRelated.wrongItemSent) reasons.push("wrong item sent");
        if (rr.otherReasons.allowed && rr.otherReasons.description) reasons.push("other: " + rr.otherReasons.description);
        return reasons;
    };


    const handleOpenConfirmation = (e: FormEvent) => {
        e.preventDefault();
        
        console.log("Validating form before submission...: ");
        
        const result = validateReturnPolicy(returnPolicy);
        
        if (result.success) {
            setErrors(null);
            setSubmissionIssues([]);
            setServerFieldErrors({});
            console.log("Ready to submit:", returnPolicy);
            setIsConfirmationOpen(true);
        } else {
            const validationErrors = result.error.format();
            setErrors(validationErrors);
            setSubmissionIssues([]);
            setServerFieldErrors({});
            console.log("errors", validationErrors);
            toast.error("Please fix the errors before saving.", {
                description: "Review the fields marked in red and try again.",
            });
            setTimeout(() => {
                scrollToErrorLocation(flattenFormattedErrorPaths(validationErrors));
                scrollToRenderedError();
            }, 300);
        }
    };

    const handleConfirmSubmit = async () => {
        setIsConfirmationOpen(false);
        if (!validateForm()) {
            setSubmissionIssues([]);
            toast.error("Please fix the validation errors before submitting.");
            return;
        }
        console.log("Submitting return policy:", returnPolicy);

        setIsSubmitting(true);
        const toastId = toast.loading("Saving your return policy...");

        try {
            const result = await updateBrandReturnPolicy(returnPolicy, userId);
            const successMessage = typeof result.message === "string"
                ? result.message
                : "Return policy updated successfully.";
            const errorMessageFromResult = typeof result.message === "string"
                ? result.message
                : "Failed to update return policy.";

            if (result.success) {
                setSubmissionIssues([]);
                setServerFieldErrors({});
                setSavedSnapshot(serializePolicySnapshot(returnPolicy));
                toast.success(successMessage, {
                    id: toastId,
                });
                router.refresh();
            } else {
                const formattedIssues = collectServerIssues(result);
                const mappedFieldErrors = formatServerIssues(result);
                setSubmissionIssues(formattedIssues);
                setServerFieldErrors(mappedFieldErrors);
                toast.error(errorMessageFromResult, {
                    id: toastId,
                    description: formattedIssues[0] && formattedIssues[0] !== errorMessageFromResult
                        ? formattedIssues[0]
                        : undefined,
                });
                const serverErrorPaths = Object.keys(mappedFieldErrors);
                if (serverErrorPaths.length > 0) {
                    setTimeout(() => {
                        scrollToErrorLocation(serverErrorPaths);
                        scrollToRenderedError();
                    }, 100);
                } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }

        } catch (error) {
            console.error("Error saving policy:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setSubmissionIssues([errorMessage]);
            setServerFieldErrors({});
            toast.error(`Error: ${errorMessage}`, { id: toastId });
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleRestockingAppliesToChange = (_section: string, key: string, checked: boolean) => {
        setReturnPolicy(prev => {
            const current = prev.restockingFee.appliesTo;
            const reasonKey = key as typeof RETURN_REASONS[number];
            const next = checked 
                ? [...current, reasonKey]
                : current.filter(k => k !== reasonKey);
            
            return {
                ...prev,
                restockingFee: {
                    ...prev.restockingFee,
                    appliesTo: next
                }
            };
        });
    };

    return (
        <>
            <p>Todays exchange rate is {todayExchangeRate.toFixed(2)}</p>
            <form ref={formRef} onSubmit={handleOpenConfirmation} className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                        Return Policy
                    </h2>
                    <p className="text-gray-500">
                        Define your return policy to inform customers about the terms and conditions for returning products.
                    </p>
                </div>

                {submissionIssues.length > 0 && (
                    <Alert variant="destructive" className="border-2 rounded-none">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Could not save return policy</AlertTitle>
                        <AlertDescription>
                            <div className="space-y-1">
                                {submissionIssues.map((issue) => (
                                    <p key={issue}>{issue}</p>
                                ))}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Core Policy Section */}
                <Card id="core-policy-section" className="border-2 rounded-none">
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
                                id="returnWindowDays"
                                name="returnWindowDays"
                                type="number"
                                value={returnPolicy.returnWindowDays === 0 ? '' : returnPolicy.returnWindowDays }
                                onChange={handleNumberInputChange}
                                onBlur={validateForm}
                                min={1}
                                max={365}
                                className="mt-2"
                            />
                            {(errors?.returnWindowDays?._errors[0] || getServerFieldError("returnWindowDays")) && (
                                <p className="text-red-500 text-xs mt-1">{errors?.returnWindowDays?._errors[0] || getServerFieldError("returnWindowDays")}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Condition Requirements */}
                <Card id="conditions-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Conditions</CardTitle>
                        <CardDescription>Item condition requirements for returns.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ReturnPolicySwitchSection
                            title="Condition Requirements"
                            description="Select required conditions for eligible returns"
                            section="conditionRequirements"
                            data={returnPolicy.conditionRequirements as unknown as Record<string, boolean>}
                            onCheckedChange={(section: string, key: string, checked: boolean) => handleNestedSwitchChange("conditionRequirements", key, checked)}
                            options={[
                                { key: "unwornAndUnwashed", label: "Unworn and unwashed", tooltip: "Item must not show signs of wear or washing" },
                                { key: "originalPackaging", label: "Original packaging", tooltip: "Must include original packaging" },
                                { key: "tagsIntact", label: "Tags intact", tooltip: "Tags must remain attached" },
                                { key: "notDiscounted", label: "Not discounted item", tooltip: "Discounted items may have different rules" },
                                { key: "notCustomMade", label: "Not custom made", tooltip: "Custom items usually not returnable" },
                                { key: "finalSaleNotAllowed", label: "Final sale items not allowed", tooltip: "Final sale items cannot be returned" },
                            ]}
                        />

                        <div className="mt-4">
                            <Label className="mb-2">Damaged items handling</Label>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span>Accept damaged items</span>
                                    <Switch
                                        checked={returnPolicy.conditionRequirements.damagedItem.allowed}
                                        onCheckedChange={(checked) => handleDamagedItemChange("allowed", checked)}
                                    />
                                </div>

                                {returnPolicy.conditionRequirements.damagedItem.allowed && (
                                    <>
                                        <div className="flex items-center justify-between pl-4 border-l-2">
                                            <span>Require images of damage</span>
                                            <Switch
                                                checked={returnPolicy.conditionRequirements.damagedItem.imagesRequired ?? false}
                                                onCheckedChange={(checked) => handleDamagedItemChange("imagesRequired", checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pl-4 border-l-2">
                                            <span>Require description of damage</span>
                                            <Switch
                                                checked={returnPolicy.conditionRequirements.damagedItem.descriptionRequired ?? false}
                                                onCheckedChange={(checked) => handleDamagedItemChange("descriptionRequired", checked)}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* EVIDENCE REQUIREMENTS */}
                <Card id="evidence-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Evidence Requirements</CardTitle>
                        <CardDescription>What proof customers must submit for returns (photos, serials, etc.).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                                <Label>Require images</Label>
                                <Switch checked={returnPolicy.evidenceRequirements.requireImages} onCheckedChange={(checked) => handleEvidenceChange("requireImages", checked)} />
                            </div>

                            <div>
                                <Label>Min image count</Label>
                                <Input
                                    name="evidenceRequirements.minImageCount"
                                    type="number"
                                    value={returnPolicy.evidenceRequirements.minImageCount ?? ""}
                                    min={1}
                                    max={10}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleEvidenceChange("minImageCount", value === "" ? undefined : parseInt(value, 10));
                                    }}
                                    disabled={!returnPolicy.evidenceRequirements.requireImages} 
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Require package photo</Label>
                                <Switch 
                                    checked={returnPolicy.evidenceRequirements.requirePackagePhoto} 
                                    onCheckedChange={(checked) => handleEvidenceChange("requirePackagePhoto", checked)} 
                                    disabled={!returnPolicy.evidenceRequirements.requireImages}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Require serial number photo</Label>
                                <Switch 
                                    checked={returnPolicy.evidenceRequirements.requireSerialNumberPhoto} 
                                    onCheckedChange={(checked) => handleEvidenceChange("requireSerialNumberPhoto", checked)}
                                    disabled={!returnPolicy.evidenceRequirements.requireImages}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SHIPPING & METHODS */}
                <Card id="shipping-methods-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Shipping & Return Methods</CardTitle>
                        <CardDescription>Who pays for return shipping and how returns are performed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="mb-2 font-bold flex items-center gap-1">
                                Return shipping responsibility:
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} className="cursor-help text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Who is responsible for return shipping costs</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="returnShipping.responsibility"
                                        value="brand" // This is a valid value for the type
                                        checked={returnPolicy.returnShipping.responsibility === "brand"}
                                        onChange={(e) => setReturnPolicy((prev) => ({ ...prev, returnShipping: { ...prev.returnShipping, responsibility: e.target.value as ReturnPolicy['returnShipping']['responsibility'] } }))}
                                        className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                    />
                                    <span className="ml-1">Brand pays</span>
                                </label>
 
                                <label className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="returnShipping.responsibility"
                                        value="customer"
                                        checked={returnPolicy.returnShipping.responsibility === "customer"}
                                        onChange={(e) => setReturnPolicy((prev) => ({ ...prev, returnShipping: { ...prev.returnShipping, responsibility: e.target.value as ReturnPolicy['returnShipping']['responsibility'] } }))}
                                        className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
 
                                    />
                                    <span className="ml-1">Customer pays</span>
                                </label>
 
                                <label className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="returnShipping.responsibility"
                                        value="depends_on_reason"
                                        checked={returnPolicy.returnShipping.responsibility === "depends_on_reason"}
                                        onChange={(e) => setReturnPolicy((prev) => ({ ...prev, returnShipping: { ...prev.returnShipping, responsibility: e.target.value as ReturnPolicy['returnShipping']['responsibility'] } }))}
                                        className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                    />
                                    <span className="ml-1">Depends on reason</span>
                                </label>
                            </div>
                        </div>

                        <ReturnPolicySwitchSection
                            title="Return Methods"
                            description="How returns can be completed"
                            section="returnMethods"
                            // data={returnPolicy.returnMethods as unknown as Record<string, boolean>}
                            data={{
                                customerShipsBack: returnPolicy.returnMethods.includes("customer_ships"),
                                brandProvidesReturnLabel: returnPolicy.returnMethods.includes("brand_label"),
                                arrangePickup: returnPolicy.returnMethods.includes("pickup"),
                            }}
                            onCheckedChange={(_section: string, key: string, checked: boolean) => {
                                setReturnPolicy((prev) => {
                                    const mapping: Record<string, ReturnPolicy['returnMethods'][number]> = {
                                        customerShipsBack: "customer_ships",
                                        brandProvidesReturnLabel: "brand_label",
                                        arrangePickup: "pickup",
                                    };
                                    const valueToToggle = mapping[key];
                                    if (!valueToToggle) return prev;

                                    const newReturnMethods = checked ? [...prev.returnMethods, valueToToggle] : prev.returnMethods.filter((m) => m !== valueToToggle);
                                    return { ...prev, returnMethods: newReturnMethods };
                                });
                            }}
                            options={[
                                { 
                                    key: "customerShipsBack", 
                                    label: "Customer ships back", 
                                    tooltip: "Customer arranges and pays for return shipping. Disabled if 'Brand pays' is selected.",
                                    disabled: returnPolicy.returnShipping.responsibility === 'brand'
                                },
                                { 
                                    key: "brandProvidesReturnLabel", 
                                    label: "We provide a return label", 
                                    tooltip: "Brand emails a prepaid label. Disabled if 'Customer pays' is selected.",
                                    disabled: returnPolicy.returnShipping.responsibility === 'customer'
                                },
                                { 
                                    key: "arrangePickup", label: "Arrange pickup", tooltip: "We schedule a pickup. Disabled if 'Customer pays' is selected.",
                                    disabled: returnPolicy.returnShipping.responsibility === 'customer' },
                            ]}
                        />
                        {((errors?._errors && errors._errors.length > 0) || getServerFieldError("_form", "returnMethods", "returnShipping.responsibility", "returnShipping.paidByBrandReasons")) && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors?._errors?.[0] || getServerFieldError("_form", "returnMethods", "returnShipping.responsibility", "returnShipping.paidByBrandReasons")}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* RETURN REASONS */}
                <Card id="return-reasons-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Accepted Return Reasons</CardTitle>
                        <CardDescription>Select allowed reasons for returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReturnPolicySwitchSection
                            title="Customer related reasons"
                            description="Which customer reasons are allowed"
                            section="returnReasons.customerRelated"
                            data={returnPolicy.returnReasons.customerRelated as unknown as Record<string, boolean>}
                            onCheckedChange={(_section: string, key: string, checked: boolean) => {
                                setReturnPolicy(prev => ({
                                    ...prev,
                                    returnReasons: {
                                        ...prev.returnReasons,
                                        customerRelated: { ...prev.returnReasons.customerRelated, [key]: checked }
                                    }
                                }))
                            }}
                            options={[
                                { key: "wrongSize", label: "Wrong size/fit", tooltip: "Selected size doesn't fit" },
                                { key: "changedMind", label: "Changed mind", tooltip: "Customer no longer wants item" },
                                { key: "notSatisfied", label: "Not satisfied", tooltip: "Item doesn't meet expectations" },
                            ]}
                        />

                        <ReturnPolicySwitchSection
                            title="Merchant related reasons"
                            description="Which merchant reasons are allowed"
                            section="returnReasons.merchantRelated"
                            data={returnPolicy.returnReasons.merchantRelated as unknown as Record<string, boolean>}
                            onCheckedChange={(_section: string, key: string, checked: boolean) => {
                                setReturnPolicy(prev => ({
                                    ...prev,
                                    returnReasons: {
                                        ...prev.returnReasons,
                                        merchantRelated: { ...prev.returnReasons.merchantRelated, [key]: checked }
                                    }
                                }))
                            }}
                            options={[
                                { key: "defectiveItem", label: "Defective item", tooltip: "Manufacturing or quality defect" },
                                { key: "notAsDescribed", label: "Not as described", tooltip: "Item differs from description" },
                                { key: "wrongItemSent", label: "Wrong item sent", tooltip: "Incorrect SKU delivered" },
                            ]}
                        />

                        <div className="mt-4">
                            <Label>Other reasons (optional)</Label>
                            <Textarea
                                name="returnReasons.otherReasons.description"
                                value={returnPolicy.returnReasons.otherReasons.description}
                                onChange={handleStringInputChange}
                                placeholder="Describe other allowed reasons"
                                rows={2}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <Label className="flex items-center gap-1">
                                    Allow other reasons
                                </Label>
                                <Switch
                                    checked={returnPolicy.returnReasons.otherReasons.allowed}
                                    onCheckedChange={(checked) => setReturnPolicy((prev) => ({
                                        ...prev,
                                        returnReasons: {
                                            ...prev.returnReasons,
                                            otherReasons: {
                                                ...prev.returnReasons.otherReasons,
                                                allowed: checked,
                                            },
                                        },
                                    }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* REFUNDS & RESTOCKING */}
                <Card id="refund-methods-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Refunds & Restocking</CardTitle>
                        <CardDescription>Refund methods, processing time, and restocking fees.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ReturnPolicySwitchSection
                            title="Refund Methods"
                            description="How customers can be refunded"
                            section="refundMethods" // This prop is not strictly necessary with the new handler but kept for consistency
                            data={{
                                fullRefund: returnPolicy.refundMethods.includes("full_refund"),
                                storeCredit: returnPolicy.refundMethods.includes("store_credit"),
                                exchange: returnPolicy.refundMethods.includes("exchange"),
                                replacement: returnPolicy.refundMethods.includes("replacement"),
                            }}
                            onCheckedChange={(_section: string, key: string, checked: boolean) => {
                                setReturnPolicy((prev) => {
                                    const mapping: Record<string, ReturnPolicy['refundMethods'][number]> = {
                                        fullRefund: "full_refund",
                                        storeCredit: "store_credit",
                                        exchange: "exchange",
                                        replacement: "replacement",
                                    };
                                    const valueToToggle = mapping[key];
                                    if (!valueToToggle) return prev;

                                    const newRefundMethods = checked ? [...prev.refundMethods, valueToToggle] : prev.refundMethods.filter((m) => m !== valueToToggle);
                                    return { ...prev, refundMethods: newRefundMethods };
                                });
                            }}
                            options={[
                                { key: "fullRefund", label: "Full refund", tooltip: "Refund to original payment method" },
                                { key: "storeCredit", label: "Store credit", tooltip: "Credit usable later" },
                                { key: "exchange", label: "Exchange", tooltip: "Swap for another item" },
                                { key: "replacement", label: "Replacement", tooltip: "Replace same item" },
                            ]}
                        />

                        <div>
                            <Label className="mb-2 font-bold flex items-center gap-1">
                                Refund processing time (days):
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} className="cursor-help text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Time taken to process refunds after receiving returned items</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                name="refundProcessingTimeDays"
                                type="number"
                                value={returnPolicy.refundProcessingTimeDays === 0 ? '' : returnPolicy.refundProcessingTimeDays}
                                onChange={handleNumberInputChange}
                                min={1}
                                max={60}
                            />
                        </div>

                        <div>
                            <Label className="mb-2 font-bold flex items-center gap-1">
                                Restocking fee:
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} className="cursor-help text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Fee charged to customer when returning an item</p>
                                    </TooltipContent>
                                </Tooltip>    
                            </Label>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="restockingFeeType"
                                        value="fixed"
                                        checked={returnPolicy.restockingFee.type === "fixed"}
                                        onChange={handleRestockingFeeTypeChange}
                                        className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                    />
                                    <span className="ml-1">Fixed</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="restockingFeeType"
                                        value="percentage"
                                        checked={returnPolicy.restockingFee.type === "percentage"}
                                        onChange={handleRestockingFeeTypeChange}
                                        className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                    />
                                    <span className="ml-1">Percentage</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        name="restockingFeeType"
                                        value="none"
                                        checked={returnPolicy.restockingFee.type === "none"}
                                        onChange={() => setReturnPolicy((prev) => ({ ...prev, restockingFee: { type: "none", value: 0, appliesTo: prev.restockingFee.appliesTo } }))}
                                        className={cn("h-4 w-4 border-2 cursor-pointer", "peer appearance-none", "checked:bg-black checked:border-transparent")}
                                    />
                                    <span className="ml-1">None</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-20 text-center">
                                    {returnPolicy.restockingFee.type === "fixed"
                                        ? currencyCode
                                        : returnPolicy.restockingFee.type === "percentage"
                                        ? "%"
                                        : ""}
                                </div>                                
                                {returnPolicy.restockingFee.type === "fixed" ? (
                                    <div className="w-full block">
                                        <div className="mb-2">
                                            <MoneyInput
                                                numericValue={returnPolicy.restockingFee.value === undefined ? 0 : returnPolicy.restockingFee.value}
                                                onNumericChange={handleRestockingFeeValueChange}
                                                name="restockingFeeValue"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {usdPrice && (
                                            <span className="text-gray-500 space-y-3">(~ USD {usdPrice})</span>
                                        )}
                                    </div>
                                    
                                ) : returnPolicy.restockingFee.type === "percentage" ? (
                                    <Input
                                        name="restockingFeeValue"
                                        type="number"
                                        value={returnPolicy.restockingFee.value === 0 ? '' : returnPolicy.restockingFee.value}
                                        onChange={handleRestockingFeePercentageChange}
                                        min={0}
                                        max={100}
                                        step={0.01}
                                    />
                                ) : (
                                    <span className="text-gray-500"></span>
                                )}           
                            </div>
                        </div>
                        
                        {errors?.restockingFee && (
                            <>
                                {(errors.restockingFee.type?._errors[0] || getServerFieldError("restockingFee.type")) && (
                                    <p className="text-red-500 text-sm mt-2">{errors.restockingFee.type?._errors[0] || getServerFieldError("restockingFee.type")}</p>
                                )}
                                {(errors.restockingFee.value?._errors[0] || getServerFieldError("restockingFee.value")) && (
                                    <p className="text-red-500 text-sm mt-2">{errors.restockingFee.value?._errors[0] || getServerFieldError("restockingFee.value")}</p>
                                )}
                                {(((errors.restockingFee as ZodFormattedError<FixedRestockingFee>).usdPrice?._errors[0]) || getServerFieldError("restockingFee.usdPrice")) && (
                                    <p className="text-red-500 text-sm mt-2">{(errors.restockingFee as ZodFormattedError<FixedRestockingFee>).usdPrice?._errors[0] || getServerFieldError("restockingFee.usdPrice")}</p>
                                )}
                                {(errors.restockingFee.appliesTo?._errors[0] || getServerFieldError("restockingFee.appliesTo")) && (
                                    <p className="text-red-500 text-sm mt-2">{errors.restockingFee.appliesTo?._errors[0] || getServerFieldError("restockingFee.appliesTo")}</p>
                                )}
                                {(errors.restockingFee._errors?.[0]) && (
                                    <p className="text-red-500 text-sm mt-2">{errors.restockingFee._errors[0]}</p>
                                )}
                            </>
                        )}

                        {(returnPolicy.restockingFee.type as string) !== "none" && (
                            <div className="text-sm text-gray-600">
                                <Label className="mb-2 font-bold flex items-center gap-1 text-black">
                                    Restocking fee applies to:
                                </Label>
                                <div className="flex flex-col space-y-2 justify-between md:flex-row md:space-y-0 md:space-x-4">
                                    <div className="flex items-center justify-between">
                                        <ReturnPolicySwitchSection
                                            title="Customer Reasons"
                                            description="Apply fee for these reasons"
                                            section="restockingFee"
                                            data={returnPolicy.restockingFee.appliesTo.reduce((acc, r) => ({ ...acc, [r]: true }), {})}
                                            onCheckedChange={handleRestockingAppliesToChange}
                                            options={[
                                                { 
                                                    key: "wrongSize", 
                                                    label: "Wrong size/fit", 
                                                    tooltip: "Selected size doesn't fit",
                                                    disabled: !returnPolicy.returnReasons.customerRelated.wrongSize 
                                                },
                                                { 
                                                    key: "changedMind", 
                                                    label: "Changed mind", 
                                                    tooltip: "Customer no longer wants item",
                                                    disabled: !returnPolicy.returnReasons.customerRelated.changedMind 
                                                },
                                                { 
                                                    key: "notSatisfied", 
                                                    label: "Not satisfied", 
                                                    tooltip: "Item doesn't meet expectations",
                                                    disabled: !returnPolicy.returnReasons.customerRelated.notSatisfied 
                                                },
                                            ]}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <ReturnPolicySwitchSection
                                            title="Merchant & Other Reasons"
                                            description="Apply fee for these reasons"
                                            section="restockingFee"
                                            data={returnPolicy.restockingFee.appliesTo.reduce((acc, r) => ({ ...acc, [r]: true }), {})}
                                            onCheckedChange={handleRestockingAppliesToChange}
                                            options={[
                                                { 
                                                    key: "defectiveItem", 
                                                    label: "Defective item", 
                                                    tooltip: "Manufacturing or quality defect",
                                                    disabled: !returnPolicy.returnReasons.merchantRelated.defectiveItem
                                                },
                                                { 
                                                    key: "notAsDescribed", 
                                                    label: "Not as described", 
                                                    tooltip: "Item differs from description",
                                                    disabled: !returnPolicy.returnReasons.merchantRelated.notAsDescribed
                                                },
                                                { 
                                                    key: "wrongItemSent", 
                                                    label: "Wrong item sent", 
                                                    tooltip: "Incorrect SKU delivered",
                                                    disabled: !returnPolicy.returnReasons.merchantRelated.wrongItemSent
                                                },
                                                {
                                                    key: "otherReasons",
                                                    label: "Other reasons",
                                                    tooltip: "Other allowed reasons",
                                                    disabled: !returnPolicy.returnReasons.otherReasons.allowed
                                                }
                                            ]}
                                        />
                                    </div>
                                
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* EXCHANGE POLICY */}
                {returnPolicy.refundMethods.includes("exchange") && (
                    <Card id="exchange-policy-section" className="border-2 rounded-none">
                        <CardHeader>
                            <CardTitle>Exchange Policy</CardTitle>
                            <CardDescription>Rules for exchanges (size, color, price differences).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <Label>Allow size exchanges</Label>
                                    <Switch checked={returnPolicy.exchangePolicy.allowSizeExchange} onCheckedChange={(ch) => handleExchangeChange("allowSizeExchange", ch)} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>Allow color exchanges</Label>
                                    <Switch checked={returnPolicy.exchangePolicy.allowColorExchange} onCheckedChange={(ch) => handleExchangeChange("allowColorExchange", ch)} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>Allow different product exchange</Label>
                                    <Switch checked={returnPolicy.exchangePolicy.allowDifferentProductExchange} onCheckedChange={(ch) => handleExchangeChange("allowDifferentProductExchange", ch)} />
                                </div>

                                <div>
                                    <Label>Price difference handling</Label>
                                    <Select
                                        name="exchangePolicy.priceDifferenceHandling"
                                        value={returnPolicy.exchangePolicy.priceDifferenceHandling}
                                        onChange={(e) => handleExchangeChange("priceDifferenceHandling", e.target.value)}
                                        className="w-full mt-2 p-2 border-2"
                                        >
                                        <option value="charge_difference">Charge difference (customer pays more)</option>
                                        <option value="no_charge">No charge (brand absorbs difference)</option>
                                        <option value="store_credit">Store credit for difference</option>
                                    </Select>
                                </div>
                            </div>
                            {(errors?.refundMethods?._errors[0] || getServerFieldError("refundMethods", "exchangePolicy.priceDifferenceHandling")) && (
                                <p className="text-red-500 text-sm -mt-2">{errors?.refundMethods?._errors[0] || getServerFieldError("refundMethods", "exchangePolicy.priceDifferenceHandling")}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* INTERNATIONAL RETURNS */}
                <Card id="international-returns-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>International Returns</CardTitle>
                        <CardDescription>Settings for cross-border return behavior.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Allow international returns</span>
                            <Switch checked={returnPolicy.internationalReturns.allowed} onCheckedChange={(ch) => handleInternationalChange("allowed", ch)} />
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Customer covers import fees</span>
                            <Switch checked={returnPolicy.internationalReturns.customerCoversImportFees} onCheckedChange={(ch) => handleInternationalChange("customerCoversImportFees", ch)} />
                        </div>

                        <div>
                            <Label>Different return window for international (days)</Label>
                            <Input
                                name="internationalReturns.differentReturnWindow"
                                type="number"
                                value={returnPolicy.internationalReturns.differentReturnWindow || ""}
                                onChange={(e) => handleInternationalChange("differentReturnWindow", parseInt(e.target.value, 10))}
                                placeholder="Leave empty to use default window"
                                min={1}
                                max={365}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* SUBMISSION LIMITS */}
                <Card id="submission-limits-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Submission Limits</CardTitle>
                        <CardDescription>Control how many return/exchange requests customers can open.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Max requests per order</Label>
                                <Input
                                name="returnSubmissionLimits.maxRequestsPerOrder"
                                type="number"
                                value={returnPolicy.returnSubmissionLimits.maxRequestsPerOrder}
                                onChange={(e) => handleSubmissionLimitsChange("maxRequestsPerOrder", parseInt(e.target.value || "1", 10))}
                                min={1}
                                max={10}
                                />
                            </div>

                            <div>
                                <Label>Max requests per item</Label>
                                <Input
                                    name="returnSubmissionLimits.maxRequestsPerItem"
                                    type="number"
                                    value={returnPolicy.returnSubmissionLimits.maxRequestsPerItem}
                                    onChange={(e) => handleSubmissionLimitsChange("maxRequestsPerItem", parseInt(e.target.value || "1", 10))}
                                    min={1}
                                    max={5}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RETURN ADDRESS */}
                <div id="return-address-section">
                    <ReturnAddressSection
                        address={returnPolicy.returnAddress}
                        errors={errors?.returnAddress}
                        serverErrors={{
                            contactPerson: getServerFieldError("returnAddress.contactPerson"),
                            addressLine: getServerFieldError("returnAddress.addressLine"),
                            addressLine2: getServerFieldError("returnAddress.addressLine2"),
                            city: getServerFieldError("returnAddress.city"),
                            region: getServerFieldError("returnAddress.region"),
                            postalCode: getServerFieldError("returnAddress.postalCode"),
                            country: getServerFieldError("returnAddress.country"),
                            phoneNumber: getServerFieldError("returnAddress.phoneNumber"),
                            email: getServerFieldError("returnAddress.email"),
                        }}
                        onStringChange={handleStringInputChange}
                        onSelectChange={handleSelectChange}
                        onPhoneChange={handlePhoneChange}
                        onBlur={handleBlur}
                    />
                </div>

                {/* RETURN CONTACT */}
                <Card id="return-contact-section" className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Return Contact</CardTitle>
                        <CardDescription>Contact customers should use for returns.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                id="returnContact.name"
                                name="returnContact.name"
                                value={returnPolicy.returnContact.name}
                                onChange={handleStringInputChange}
                                onBlur={validateForm}
                            />
                            {(errors?.returnContact?.name?._errors[0] || getServerFieldError("returnContact.name")) && <p className="text-red-500 text-xs mt-1">{errors?.returnContact?.name?._errors[0] || getServerFieldError("returnContact.name")}</p>}
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                id="returnContact.email"
                                name="returnContact.email"
                                value={returnPolicy.returnContact.email}
                                onChange={handleStringInputChange}
                                onBlur={validateForm}
                            />
                            {(errors?.returnContact?.email?._errors[0] || getServerFieldError("returnContact.email")) && <p className="text-red-500 text-xs mt-1">{errors?.returnContact?.email?._errors[0] || getServerFieldError("returnContact.email")}</p>}
                        </div>

                        <div>
                            <Label>Phone</Label>
                            <PhoneInput
                                international
                                value={returnPolicy.returnContact.phoneNumber}
                                onChange={handleContactPhoneChange}
                                className={cn("w-full", "flex h-12 rounded-none border-2 bg-background px-3 py-2 text-sm")}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* INSTRUCTIONS & NOTES */}
                <Card className="border-2 rounded-none">
                    <CardHeader>
                        <CardTitle>Custom Instructions & Notes</CardTitle>
                        <CardDescription>Optional instructions shown to customers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label>Return Instructions</Label>
                            <Textarea name="returnInstructions" value={returnPolicy.returnInstructions || ""} onChange={handleStringInputChange} rows={4} />
                        </div>

                        <div className="mt-4">
                            <Label>Special Notes</Label>
                            <Textarea name="specialNotes" value={returnPolicy.specialNotes || ""} onChange={handleStringInputChange} rows={3} />
                        </div>
                    </CardContent>
                </Card>

                {/* PREVIEW */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle>Policy Summary Preview</CardTitle>
                        <CardDescription>Quick snapshot of key settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-white">{returnPolicy.returnWindowDays} days</Badge>
                                <span>Return window</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {flattenReasonsForPreview().map((r) => (
                                    <Badge key={r} variant="secondary">{r}</Badge>
                                ))}
                            </div>

                            {(returnPolicy.restockingFee?.value ?? 0) > 0 && (
                                <div className="text-amber-600">
                                    <strong>Restocking fee:</strong> {returnPolicy.restockingFee?.value ?? 0}
                                    {returnPolicy.restockingFee?.type === "percentage" ? "%" : currencyCode}
                                </div>
                            )}

                            <div>
                                <strong>Exchange policy:</strong> {returnPolicy.exchangePolicy.allowSizeExchange ? "Size exchanges allowed" : "Size exchanges not allowed"} • Price handling: {returnPolicy.exchangePolicy.priceDifferenceHandling.replace("_", " ")}
                            </div>

                            <div>
                                <strong>Submission limits:</strong> {returnPolicy.returnSubmissionLimits.maxRequestsPerOrder} request(s) per order, {returnPolicy.returnSubmissionLimits.maxRequestsPerItem} per item
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? "Saving..." : "Save Policy"}
                    </Button>
                </div>
            </form>

            {isConfirmationOpen && (
                <ConfirmationModal
                    title="Confirm Save"
                    description="Are you sure you want to save these return policy settings? These changes will become active immediately for future return requests."
                    onConfirm={handleConfirmSubmit}
                    onCancel={() => setIsConfirmationOpen(false)}
                />
            )}
        </>
        
    )
}

export default ReturnPolicyForm;
