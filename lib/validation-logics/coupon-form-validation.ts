import { CouponFormDetails } from "@/components/brand-dashboard/coupon-client";
export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export const validateField = (name: string, value: any, formData: CouponFormDetails): string | null => {
    switch (name) {
        case 'name':
            if (!value || value.trim().length === 0) return 'Coupon name is required';
            if (value.length > 100) return 'Coupon name must be less than 100 characters';
            return null;
        
        case 'code':
            if (formData.id) return null; 
            if (!value || value.trim().length === 0) return 'Coupon code is required';
            if (value.length < 5) return 'Coupon code must be at least 5 characters';
            if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Coupon code can only contain letters, numbers, hyphens, and underscores';
            return null;
        
        case 'discountValue':
            if (formData.discountType !== 'free_shipping') {
                if (value === undefined || value === null || value === '') return 'Discount value is required';
                if (typeof value === 'string' && isNaN(parseFloat(value))) return 'Discount value must be a number';
                
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                
                if (formData.discountType === 'percentage') {
                    if (numValue <= 0) return 'Percentage discount must be greater than 0';
                    if (numValue > 100) return 'Percentage discount cannot exceed 100%';
                } else if (formData.discountType === 'fixed') {
                    if (numValue <= 0) return 'Fixed discount must be greater than 0';
                }
            }
            return null;
        
        case 'discountType':
            if (!value) return 'Discount type is required';
            return null;
        
        case 'usageLimit':
            if (value !== undefined && value !== null && value !== '') {
                const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                if (isNaN(numValue) || numValue < 1) return 'Usage limit must be at least 1';
            }
            return null;
        
        case 'minOrderAmount':
            if (value !== undefined && value !== null && value !== '') {
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                if (isNaN(numValue) || numValue <= 0) return 'Minimum order amount cannot be negative';
            }
            return null;
        
        case 'startDate':
            if (!value) return 'Start date is required';
        
            // Check if start date is valid
            const startDate = new Date(value);
            if (isNaN(startDate.getTime())) return 'Invalid start date';
            
            // Check if start date is in the future (optional business rule)
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (startDate < now) return 'Start date cannot be in the past';
            return null;
        
        case 'endDate':
            if (!value) return 'End date is required';
            
            const endDate = new Date(value);
            if (isNaN(endDate.getTime())) return 'Invalid end date';
            
            // Check if end date is after start date
            if (formData.startDate) {
                const startDate = new Date(formData.startDate);
                if (endDate <= startDate) return 'End date must be after start date';
            }
            return null;
        
        case 'appliesTo':
            if (!value) return 'Applies to selection is required';
            
            if (value === 'products' && (!formData.includedProductNames || formData.includedProductNames.length === 0)) {
                return 'At least one product must be selected';
            }
            
            if (value === 'categories' && (!formData.includedCategoryNames || formData.includedCategoryNames.length === 0)) {
                return 'At least one category must be selected';
            }
            return null;
            
            case 'includedProductIds':
            if (formData.appliesTo === 'products' && (!value || value.length === 0)) {
                return 'At least one product must be selected';
            }
            return null;
            
            case 'includedCategoryIds':
            if (formData.appliesTo === 'categories' && (!value || value.length === 0)) {
                return 'At least one category must be selected';
            }
            return null;
        
        case 'allowedCountries':
            if (formData.allowedCountries && formData.allowedCountries.length > 0 && (!value || value.length === 0)) {
                return 'At least one country must be selected when limiting by country';
            }
            return null;
        
        case 'eligibleCustomers':
            if (!value) return 'Customer eligibility selection is required';
            return null;
        
        default:
            return null;
    }
};

export const validateForm = (formData: CouponFormDetails, limitCountries: boolean = false): ValidationResult => {
    const errors: ValidationError[] = [];
    
    // Validate all fields
    const fieldsToValidate: (keyof CouponFormDetails)[] = [
        'name', 'code', 'discountType', 'discountValue', 'usageLimit', 
        'minOrderAmount', 'startDate', 'endDate', 'appliesTo', 
        'eligibleCustomers'
    ];
    
    fieldsToValidate.forEach(field => {
        const error = validateField(field, formData[field], formData);
        if (error) {
        errors.push({ field, message: error });
        }
    });
    
    if (formData.appliesTo === 'products') {
        const error = validateField('includedProductIds', formData.includedProductNames, formData);
        if (error) errors.push({ field: 'includedProductIds', message: error });
    }
  
    if (formData.appliesTo === 'categories') {
        const error = validateField('includedCategoryIds', formData.includedCategoryNames, formData);
        if (error) errors.push({ field: 'includedCategoryIds', message: error });
    }
    
    if (limitCountries) {
        const error = validateField('allowedCountries', formData.allowedCountries, formData);
        if (error) errors.push({ field: 'allowedCountries', message: error });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | null => {
    const error = errors.find(e => e.field === fieldName);
    return error ? error.message : null;
};