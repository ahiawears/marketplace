import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CouponFormDetails } from "./coupon-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { CouponSwitch } from "../ui/coupon-switch";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";
import { CouponItemSelectorModal } from "../modals/coupon-item-selector-modal";
import { BrandProductListItem } from "@/actions/get-products-list/fetchBrandProducts";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { SearchableSelect } from "../ui/searchable-select";
import { MoneyInput } from "../ui/money-input";
import { getFieldError, validateField, validateForm, ValidationError } from "@/lib/validation-logics/coupon-form-validation";
import { toast } from "sonner";
import { CreateCoupon } from "@/actions/brand-actions/create-coupon";
import { UpdateCoupon } from "@/actions/brand-actions/update-coupon";

interface AddCouponFormProps {
    onBack: () => void;
    currency: string;
    initialFormData: CouponFormDetails;
    products: BrandProductListItem[];
}


// Helper component for consistent switch fields
const SwitchField = ({ label, description, status, onStatusChange }: { label: string, description: string, status: "active" | "inactive", onStatusChange: (status: "active" | "inactive") => void }) => (
    <div className="flex items-center justify-between border-2 p-3 shadow-sm">
        <div>
            <Label className="font-medium">{label}</Label>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <CouponSwitch status={status} onStatusChange={onStatusChange} />
    </div>
);

const AddCouponForm = ({ onBack, currency, initialFormData, products }: AddCouponFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<CouponFormDetails>(initialFormData);
    const isEditMode = !!formData.id;
    const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
    const [selectorMode, setSelectorMode] = useState<'products' | 'categories' | null>(null);
    const [limitCountries, setLimitCountries] = useState(false);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    useEffect(() => {
        if (initialFormData.allowedCountries && initialFormData.allowedCountries.length > 0) {
            setLimitCountries(true);
        }
    }, [initialFormData.allowedCountries]);

    useEffect(() => {
        // Clear included products/categories if appliesTo changesnpm
        if (formData.appliesTo === 'categories') {
            formData.includedProductNames = [];
        } else if (formData.appliesTo === 'products') {
            formData.includedCategoryNames = [];
        } else {
            formData.includedCategoryNames = [];
            formData.includedProductNames = [];
        }
    }, [formData.appliesTo]);

    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate the field that was just blurred
        const error = validateField(name, formData[name as keyof CouponFormDetails], formData);
        
        if (error) {
        setErrors(prev => {
            const existingErrorIndex = prev.findIndex(e => e.field === name);
            if (existingErrorIndex >= 0) {
            // Update existing error
            const newErrors = [...prev];
            newErrors[existingErrorIndex] = { field: name, message: error };
            return newErrors;
            } else {
            // Add new error
            return [...prev, { field: name, message: error }];
            }
        });
        } else {
        // Remove error if it exists
        setErrors(prev => prev.filter(e => e.field !== name));
        }
    };

    const getError = (fieldName: string): string | null => {
        return getFieldError(errors, fieldName);
    };

    const isFieldTouched = (fieldName: string): boolean => {
        return touched[fieldName] || false;
    };

    const brandCategories = products.map(a => a.category);
    //Get unique categories(make duplicates one)
    const categories = [...new Set(brandCategories)];

    const brandProducts = products.map(b => b.name);

    type CouponFormChangeEvent =
    | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    | { target: { name: string; value: string | number } };

    const handleCouponFormChange = (e: CouponFormChangeEvent) => {
        const { name, value } = e.target;
        
        const numericFields = ["minOrderAmount", "discountValue", "usageLimit"];
        setFormData(prevData => ({
        ...prevData,
        [name]: numericFields.includes(name)
            ? value === "" ? undefined : typeof value === "number" ? value : parseFloat(value)
            : value,
        }));
        
        if (touched[name]) {
            const error = validateField(name, value, {...formData, [name]: value});
            
            if (error) {
                setErrors(prev => {
                const existingErrorIndex = prev.findIndex(e => e.field === name);
                if (existingErrorIndex >= 0) {
                    // Update existing error
                    const newErrors = [...prev];
                    newErrors[existingErrorIndex] = { field: name, message: error };
                    return newErrors;
                } else {
                    // Add new error
                    return [...prev, { field: name, message: error }];
                }
                });
            } else {
                // Remove error if it exists
                setErrors(prev => prev.filter(e => e.field !== name));
            }
        }
    };

    const handleStatusChange = (name: keyof CouponFormDetails, status: "active" | "inactive") => {
        setFormData(prevData => ({
            ...prevData,
            [name]: status,
        }));
    };

    const handleOpenSelector = ( mode: 'products' | 'categories') => {
        setSelectorMode(mode);
        setIsSelectorModalOpen(true);
    }

    const handleSaveSelection = (selectedItems: string[]) => {
        if (selectorMode === 'products') {
            setFormData(prev => ({ ...prev, includedProductNames: selectedItems }));
        } else if (selectorMode === 'categories') {
            setFormData(prev => ({ ...prev, includedCategoryNames: selectedItems }));
        }
    }

    const handleLimitCountriesToggle = (status: "active" | "inactive") => {
        const isActive = status === 'active';
        setLimitCountries(isActive);
        if (!isActive) {
            setFormData(prev => ({ ...prev, allowedCountries: [] }));
        }
    };

    const handleAddCountry = (country: CountryDataType) => {
        if (!formData.allowedCountries?.includes(country.name)) {
            setFormData(prev => ({
                ...prev,
                allowedCountries: [...(prev.allowedCountries || []), country.name]
            }));
        }
    };

    const handleRemoveCountry = (countryToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            allowedCountries: prev.allowedCountries?.filter(c => c !== countryToRemove)
        }));
    };

    const handleDateChange = (date: string, name: keyof CouponFormDetails) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: date,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Mark all fields as touched to show all errors
        const allTouched: Record<string, boolean> = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);
        
        // Validate the entire form
        const validationResult = validateForm(formData, limitCountries);
        setErrors(validationResult.errors);
        
        if (!validationResult.isValid) {
            // Scroll to the first error
            const firstErrorField = validationResult.errors[0].field;
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                (element as HTMLElement).focus();
                (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        setIsSubmitting(true);
        const toastId = toast.loading("Saving coupon...")
        try {
            let result;
            if (isEditMode) {
                console.log('Form is valid, updating:', formData);
                result = await UpdateCoupon(formData);
            } else {
                console.log('Form is valid, creating:', formData);
                result = await CreateCoupon(formData);
            }

            if (result.success) {
                toast.success(result.message || `Coupon ${isEditMode ? 'updated' : 'created'} successfully!`, { id: toastId });
            } else {
                throw new Error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} coupon.`);
            }
            onBack();
        } catch (error) {
            console.error('Submission error:', error);
            let errorMessage;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = String(error);
            }
            toast.error(`Failed to submit the form: ${errorMessage}`, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {selectorMode && (
                <CouponItemSelectorModal 
                    isOpen={isSelectorModalOpen}
                    onClose={() => setIsSelectorModalOpen(false)}
                    title={`Select ${selectorMode}`}
                    items={selectorMode === 'products' ? brandProducts : categories}
                    selectedIds={
                        selectorMode === 'products'
                            ? formData.includedProductNames || []
                            : formData.includedCategoryNames || []
                    }
                    onSave={handleSaveSelection}
                />
            )}
            <Card className="mx-auto p-4 sm:p-6 lg:p-8 border-2 shadow-lg rounded-none animate-in fade-in-50">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Coupon' : 'Create a New Coupon'}
                        </CardTitle>
                        <CardDescription className="text-md text-gray-600">
                            {isEditMode ? 'Update the details for your coupon.' : 'Fill out the details below to generate a new discount coupon for your store.'}
                        </CardDescription>
                    </div>
                    <Button
                        onClick={onBack}
                        className="flex-shrink-0"
                    >
                        Back
                    </Button>
                </CardHeader>

                <CardContent className="py-4">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Coupon Name:*</Label>
                                    <p className="text-xs text-gray-500">A public name for the coupon (e.g., "Summer Sale").</p>
                                    <Input
                                        name="name"
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onBlur={handleBlur}
                                        onChange={handleCouponFormChange}
                                        placeholder="e.g., Summer Sale 20%"
                                        className="border-2"
                                    />
                                    
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="code">Coupon Code:*</Label>
                                    <p className="text-xs text-gray-500">The code customers will enter at checkout.</p>
                                    <Input
                                        name="code"
                                        id="code"
                                        type="text"
                                        value={formData.code}
                                        onBlur={handleBlur}
                                        onChange={handleCouponFormChange}
                                        placeholder="e.g., SUMMER20"
                                        disabled={isEditMode}
                                        className="border-2"
                                    />
                                    
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label htmlFor="description">Coupon Description:</Label>
                                    <p className="text-xs text-gray-500">An optional internal description for your reference.</p>
                                    <Textarea
                                        name="description"
                                        id="description"
                                        value={formData.description || ''}
                                        onChange={handleCouponFormChange}
                                        placeholder="e.g., Coupon for the summer campaign targeting new customers."
                                        className="border-2"
                                    />
                                </div>
                                {getError('name') && (
                                    <p className="text-red-500 text-xs mt-1">{getError('name')}</p>
                                )}
                                {getError('code') && (
                                    <p className="text-red-500 text-xs mt-1">{getError('code')}</p>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Discount Type and Value */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                                Discount
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor="discountType">Discount Type:*</Label>
                                    <p className="text-xs text-gray-500">Choose the type of discount this coupon provides.</p>
                                    <Select
                                        id="discountType"
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleCouponFormChange}
                                        className="border-2 bg-transparent"
                                        required
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount</option>
                                        <option value="free_shipping">Free Shipping</option>
                                    </Select>   
                                </div>
                                {formData.discountType === "percentage" && (
                                    <div className="space-y-1">
                                        <Label htmlFor="discountValue">Discount Value:*</Label>
                                        <p className="text-xs text-gray-500">Enter the numeric value for the discount.</p>
                                        <Input
                                            name="discountValue"
                                            id="discountValue"
                                            type="number"
                                            value={formData.discountValue || ''}
                                            onBlur={handleBlur}
                                            onChange={handleCouponFormChange}
                                            className="border-2"
                                            placeholder={formData.discountType === "percentage" ? "e.g. 10 (for 10%)" : `e.g. 50 (in ${currency})`}
                                        />
                                        
                                    </div>
                                )}
                                { formData.discountType === "fixed" && (
                                    <div className="space-y-1">
                                        <Label htmlFor="discountValue">Discount Value:*</Label>
                                        <p className="text-xs text-gray-500">Enter the numeric value for the discount.</p>
                                        <div className="flex items-center">
                                            <Input
                                                name="currencySymbol"
                                                type="text"
                                                value={currency}
                                                readOnly
                                                required
                                                className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
                                                disabled
                                            />
                                            <MoneyInput
                                                name="discountValue"
                                                id="discountValue"
                                                numericValue={formData.discountValue || 0.00}
                                                onNumericChange={(value) => handleCouponFormChange({ target: { name: "discountValue", value: value } })}
                                                placeholder={`e.g. 50 (in ${currency})`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.discountType !== "free_shipping" && (
                                    <>
                                        {getError('discountValue') && (
                                            <p className="text-red-500 text-xs mt-1">{getError('discountValue')}</p>
                                        )}
                                    </>
                                )}
                                
                            
                            </div>
                        </div>

                        {/* Section 3: Restrictions and Limits */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                                Restrictions and Limits
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor="minOrderAmount">Minimum Order Amount:</Label>
                                    <p className="text-xs text-gray-500">The minimum purchase amount for the coupon to be valid.</p>
                                    
                                    <div className="flex items-center">
                                        <Input 
                                            name="currencySymbol"
                                            type="text"
                                            value={currency}
                                            readOnly
                                            required
                                            className="text-center block border-none p-2 text-gray-900 bg-transparent w-1/5"
                                            disabled
                                        />
                                        <MoneyInput
                                            numericValue={formData.minOrderAmount || 0.00}
                                            onNumericChange={(value) => {
                                                handleCouponFormChange({
                                                    target: {
                                                        name: "minOrderAmount",
                                                        value: value
                                                    }
                                                })
                                            }}
                                            onBlur={handleBlur}
                                            name="minOrderAmount"
                                            id="minOrderAmount"
                                            placeholder={`e.g. 100 (in ${currency})`}
                                        />
                                        
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="usageLimit">Total Usage Limit:</Label>
                                    <p className="text-xs text-gray-500">The maximum number of times this coupon can be used in total.</p>
                                    <Input
                                        name="usageLimit"
                                        id="usageLimit"
                                        type="number"
                                        onBlur={handleBlur}
                                        value={formData.usageLimit === 0 ? '' : formData.usageLimit}
                                        onChange={handleCouponFormChange}
                                        className="border-2"
                                        placeholder="e.g. 100"
                                    />
                                    
                                </div>
                                
                                <div className="md:col-span-2">
                                    <SwitchField
                                        label="One Use Per Customer"
                                        description="If enabled, each customer can only use this coupon once."
                                        status={formData.singleUsePerCustomer}
                                        onStatusChange={(status) => handleStatusChange("singleUsePerCustomer", status)}
                                    />
                                </div>
                                
                            </div>
                            {getError('usageLimit') && (
                                <p className="text-red-500 text-xs mt-1">{getError('usageLimit')}</p>
                            )}
                            {getError('minOrderAmount') && (
                                <p className="text-red-500 text-xs mt-1">{getError('minOrderAmount')}</p>
                            )}
                        </div>

                        {/* Section 4: Validity and status */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                                Validity and Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor="startDate">Start Date:*</Label>
                                    <p className="text-xs text-gray-500">The date when the coupon becomes active.</p>
                                    
                                    <DatePicker 
                                        id="startDate"
                                        value={formData.startDate}
                                        onChange={(date) => {
                                        handleDateChange(date.toString(), "startDate");
                                            const error = validateField('startDate', date.toString(), formData);
                                            if (error) {
                                                setErrors(prev => [...prev.filter(e => e.field !== 'startDate'), { field: 'startDate', message: error }]);
                                            } else {
                                                setErrors(prev => prev.filter(e => e.field !== 'startDate'));
                                            }
                                        }}
                                    />
                                    {getError('startDate') && (
                                        <p className="text-red-500 text-xs mt-1">{getError('startDate')}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="endDate">End Date:*</Label>
                                    <p className="text-xs text-gray-500">The date when the coupon expires.</p>
                                    
                                    <DatePicker
                                        id="endDate"
                                        value={formData.endDate}
                                        onChange={(date) => {
                                            handleDateChange(date.toString(), "endDate");
                                            const error = validateField('endDate', date.toString(), formData);
                                            if (error) {
                                                setErrors(prev => [...prev.filter(e => e.field !== 'endDate'), { field: 'endDate', message: error }]);
                                            } else {
                                                setErrors(prev => prev.filter(e => e.field !== 'endDate'));
                                            }
                                        }}
                                    />
                                    {getError('endDate') && (
                                        <p className="text-red-500 text-xs mt-1">{getError('endDate')}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SwitchField
                                        label="Coupon Status"
                                        description="Inactive coupons cannot be used by customers."
                                        status={formData.isActive}
                                        onStatusChange={(status) => handleStatusChange("isActive", status)}
                                    />
                                    <SwitchField
                                        label="Auto-Apply"
                                        description="If enabled, this coupon will be applied automatically in the cart if its conditions are met."
                                        status={formData.autoApply}
                                        onStatusChange={(status) => handleStatusChange("autoApply", status)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Eligibility */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                                Eligibility
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor="appliesTo">Applies To:*</Label>
                                    <p className="text-xs text-gray-500">Specify what this coupon can be applied to.</p>
                                    <Select
                                        name="appliesTo"
                                        id="appliesTo"
                                        value={formData.appliesTo}
                                        onChange={handleCouponFormChange}
                                        className="border-2 bg-transparent"
                                        required
                                    >
                                        <option value="entire_store">Entire Store</option>
                                        <option value="products">Specific Products</option>
                                        <option value="categories">Specific Categories</option>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="eligibleCustomers">Eligible Customers:*</Label>
                                    <p className="text-xs text-gray-500">Limit who can use this coupon.</p>
                                    <Select
                                        name="eligibleCustomers"
                                        id="eligibleCustomers"
                                        value={formData.eligibleCustomers}
                                        onChange={handleCouponFormChange}
                                        className="border-2 bg-transparent"
                                        required
                                    >
                                        <option value="all_customers">All Customers</option>
                                        <option value="new_customers">New Customers</option>
                                        <option value="returning_customers">Returning Customers</option>
                                    </Select>
                                </div>
                                {formData.appliesTo === 'products' && (
                                    <div className="space-y-2 mt-4 md:col-span-2">
                                        <Label>Selected Products</Label>
                                        <p className="text-xs text-gray-500">This coupon will only apply to the products you select.</p>
                                        <div className="border-2 p-3 rounded-md flex justify-between items-center">
                                            <span>{formData.includedProductNames?.length || 0} products selected</span>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => handleOpenSelector('products')}
                                                className="border-2"
                                            >
                                                Select Products
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {formData.appliesTo === 'categories' && (
                                    <div className="space-y-2 mt-4 md:col-span-2">
                                        <Label>Selected Categories</Label>
                                        <p className="text-xs text-gray-500">This coupon will only apply to products within the categories you select.</p>
                                        <div className="border-2 p-3 rounded-md flex justify-between items-center">
                                            <span>{formData.includedCategoryNames?.length || 0} categories selected</span>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => handleOpenSelector('categories')}
                                                className="border-2"
                                            >
                                                Select Categories
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <SwitchField
                                        label="Include Sale Items"
                                        description="If enabled, this coupon can be applied to items that are already on sale."
                                        status={formData.includeSaleItems}
                                        onStatusChange={(status) => handleStatusChange("includeSaleItems", status)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Geographic Restrictions */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b-2 pb-2">
                                Geographic Restrictions
                            </h3>
                            <div className="space-y-4">
                                <SwitchField
                                    label="Limit to Specific Countries"
                                    description="If enabled, this coupon will only be valid for customers in selected countries."
                                    status={limitCountries ? "active" : "inactive"}
                                    onStatusChange={handleLimitCountriesToggle}
                                />

                                {limitCountries && (
                                    <div className="space-y-2 p-3 border-2">
                                        <Label>Eligible Countries</Label>
                                        <p className="text-xs text-gray-500">Select the countries where this coupon can be used. If no countries are selected, it will not be usable anywhere.</p>
                                        <SearchableSelect<CountryDataType>
                                            options={CountryData}
                                            onSelect={handleAddCountry}
                                            getOptionLabel={(option) => `${option.emoji} ${option.name}`}
                                            placeholder="Search and select a country..."
                                        />
                                        {formData.allowedCountries && formData.allowedCountries.length > 0 && (
                                            <div className="mt-2">
                                                <Label className="block text-sm font-medium text-gray-700 mb-1">Selected Countries:</Label>
                                                <div className="flex flex-wrap gap-4">
                                                    {formData.allowedCountries.map(countryName => (
                                                        <span
                                                            key={countryName}
                                                            className="flex items-center bg-black text-white px-3 py-1 text-sm font-medium ring-2 ring-offset-2 ring-black"
                                                        >
                                                            {countryName}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCountry(countryName)}
                                                                className="ml-2  hover:text-gray-300 focus:outline-none"
                                                                aria-label={`Remove ${countryName}`}
                                                            >
                                                                &times;
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto text-white"
                            >
                                {isSubmitting ? "Saving..." : (isEditMode ? "Update Coupon" : "Save Coupon")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
        
    );
};

export default AddCouponForm;