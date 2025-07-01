import validator from "npm:validator";

export interface GeneralDetails {
    productName: string;
    productDescription: string;
    category: string;
    subCategory: string;
    tags: string[];
    currency: string;
    material: string;
    season: string;
    gender: string;
}

export interface GeneralDetailsErrors {
    productName?: string;
    productDescription?: string;
    category?: string;
    currency?: string;
    material?: string;
    subCategory?: string;
    tags?: string;
    gender?: string;
    _isValid: boolean; // Internal flag
}

export const validateGeneralProductDetails = (details: GeneralDetails): GeneralDetailsErrors => {
    const errors: GeneralDetailsErrors = { 
        _isValid: true 
    };

    if (validator.isEmpty(validator.trim(details.productName))) {
        errors.productName = "Product name is required.";
        errors._isValid = false;
    }
    if (validator.isEmpty(validator.trim(details.productDescription))) {
        errors.productDescription = "Product description is required.";
        errors._isValid = false;
    }
    if (validator.isEmpty(validator.trim(details.category))) {
        errors.category = "Category is required.";
        errors._isValid = false;
    }
    if (validator.isEmpty(validator.trim(details.material)))  {
        errors.material = "Material is required.";
        errors._isValid = false;
    }
    if (validator.isEmpty(validator.trim(details.subCategory))) {
        errors.subCategory = "Sub-category is required.";
        errors._isValid = false;
    }
    if (details.tags.some(tag => validator.isEmpty(validator.trim(tag)))) {
        errors.tags = "Tags are required.";
        errors._isValid = false;
    } else if (details.tags.length > 5) {
        errors.tags = "Tags cannot exceed 5.";
        errors._isValid = false;
    }
    if (validator.isEmpty(validator.trim(details.gender))) {
        errors.gender = "Target Gender is required.";
        errors._isValid = false;
    }

    return errors;
};