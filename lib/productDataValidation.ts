import { categoriesList } from "./categoriesList";
import { DeliveryZoneKey, GeneralProductDetailsType, ProductCareInstruction, ProductShippingDeliveryType, ProductVariantType, ShippingConfigDataProps } from "./types";
import { VariantFormDetails } from "@/components/brand-dashboard/add-product/variants-details-form";

export interface GeneralDetailsErrors {
    productName: string;
    productDescription: string;
    category: string;
    material: string;
    subCategory: string;
    tags: string;
    gender: string;
}

export const validateGeneralProductDetails = (details: GeneralProductDetailsType) : { isValid: boolean; errors: GeneralDetailsErrors } => {
    const errors: GeneralDetailsErrors = {
        productName: "",
        productDescription: "",
        category: "",
        material: "",
        subCategory: "",
        tags: "",
        gender: "",
    };

    let isValid = true;

    if (!details.productName.trim()) {
        errors.productName = "Product name is required.";
        isValid = false;
    }
    if (!details.productDescription.trim()) {
        errors.productDescription = "Product description is required.";
        isValid = false;
    }
    if (!details.category.trim()) {
        errors.category = "Category is required.";
        isValid = false;
    }
    if (!details.material.trim()) {
        errors.material = "Material is required.";
        isValid = false;
    }
    if (!details.subCategory.trim()) {
        errors.subCategory = "Sub-category is required.";
        isValid = false;
    }
    if (details.tags.length === 0) {
        errors.tags = "At least one tag is required.";
        isValid = false;
    } else if (details.tags.length > 5) {
        errors.tags = "You can select up to 5 tags.";
        isValid = false;
    }
    if (!details.gender.trim()) {
        errors.gender = "Target Gender is required.";
        isValid = false;
    }

    return { isValid, errors };
}

export interface VariantFormErrors {
    variantName?: string;
    price?: string;
    sku?: string;
    productCode?: string;
    images?: string;
    imagesDescription?: string;
    colors?: string;
    materialComposition?: string;
    measurements?: string;
}

const isValidHexColor = (hex: string): boolean => {
    if (!hex) return false;
    return /^#[0-9A-F]{6}$/i.test(hex);
};

export const validateVariantFormDetails = (variant: VariantFormDetails, categoryName: string): { isValid: boolean; errors: VariantFormErrors } => {
    const errors: VariantFormErrors = {};
    let isValid = true;

    if (!variant.variantName?.trim()) {
        errors.variantName = "Variant name is required.";
        isValid = false;
    }

    if (variant.price <= 0) {
        errors.price = "Price must be a positive number.";
        isValid = false;
    }

    if (!variant.sku?.trim()) {
        errors.sku = "SKU is required. Generate one if needed.";
        isValid = false;
    }

    if (!variant.productCode?.trim()) {
        errors.productCode = "Product code is required. Generate one if needed.";
        isValid = false;
    }

    if (!variant.images || variant.images.filter(img => img && img.trim() !== "").length === 0) {
        errors.images = "At least one product image is required.";
        isValid = false;
    }

    if (variant.imagesDescription && variant.imagesDescription.length > 350) {
        errors.imagesDescription = "Image description cannot exceed 350 characters.";
        isValid = false;
    }

    if (!variant.colors || variant.colors.length === 0) {
        errors.colors = "At least one variant color is required.";
        isValid = false;
    } else {
        for (const color of variant.colors) {
            if (!isValidHexColor(color.hexCode)) {
                errors.colors = `Invalid hex color format: ${color.hexCode}. Must be #RRGGBB.`;
                isValid = false;
                break;
            }
        }
    }

    if (!variant.materialComposition || variant.materialComposition.length === 0) {
        errors.materialComposition = "At least one material is required.";
        isValid = false;
    } else {
        const totalPercentage = variant.materialComposition.reduce((sum, mat) => sum + (mat.percentage || 0), 0);
        if (totalPercentage !== 100) {
            errors.materialComposition = `Material composition must add up to 100%. Current total: ${totalPercentage}%.`;
            isValid = false;
        }
    }

    const categoryDetails = categoriesList.find(cat => cat.name === categoryName);
    if (categoryDetails && categoryDetails.measurements.length > 0) {
        if (!variant.measurements || Object.keys(variant.measurements).length === 0) {
            errors.measurements = "At least one size must be selected for this category.";
            isValid = false;
        } else {
            for (const sizeKey in variant.measurements) {
                if (Object.prototype.hasOwnProperty.call(variant.measurements, sizeKey)) {
                    const sizeData = variant.measurements[sizeKey];

                    if (sizeData.quantity === undefined || sizeData.quantity === null || isNaN(sizeData.quantity) || sizeData.quantity <= 0) {
                        errors.measurements = `A positive quantity is required for size '${sizeKey}'.`;
                        isValid = false;
                        break;
                    }
                }
            }
        }
    }

    return { isValid, errors };
};












export interface ProductVariantErrors {
    variantName: string;
    sku: string;
    productCode: string;
    images: string;
    main_image_url: string;
    imagesDescription: string;
    colorHexes: string;
    colorDescription: string;
    price: string;
    measurementUnit: string;
    measurements: string;
    availableDate: string;
}

const isValidDateString = (dateStr: string): boolean => {
    if (!dateStr) return true; // Optional field
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
};

export const validateProductVariant = (variant: ProductVariantType, categoryName: string): { isValid: boolean; errors: ProductVariantErrors } => {
    const errors: ProductVariantErrors = {
        variantName: "",
        sku: "",
        productCode: "",
        images: "",
        main_image_url: "",
        imagesDescription: "",
        colorHexes: "",
        colorDescription: "",
        price: "",
        measurementUnit: "",
        measurements: "",
        availableDate: "",
    };

    let isValid = true;

    if (!variant.variantName?.trim()) {
        errors.variantName = "Variant name is required.";
        isValid = false;
    } else if (variant.variantName.length > 50) {
        errors.variantName = "Variant name cannot exceed 50 characters.";
        isValid = false;
    }

    if (!variant.sku?.trim()) {
        errors.sku = "SKU is required.";
        isValid = false;
    }

    if (!variant.productCode?.trim()) {
        errors.productCode = "Product code is required.";
        isValid = false;
    }

    if (!variant.images || variant.images.filter(img => img && img.trim() !== "").length === 0) {
        errors.images = "At least one product image is required.";
        isValid = false;
    } else if (!variant.main_image_url || variant.main_image_url.trim() === "") {
        // This check assumes main_image_url is derived correctly from the first valid image.
        // If images array can be empty strings, this might need adjustment based on ProductImageUploadGrid logic.
        errors.main_image_url = "Main image is required (should be the first uploaded image).";
        isValid = false;
    }
    
    if (variant.imagesDescription && variant.imagesDescription.length > 350) {
        errors.imagesDescription = "Image description cannot exceed 350 characters.";
        isValid = false;
    }

    if (!variant.colorHexes || variant.colorHexes.length === 0) {
        errors.colorHexes = "At least one variant color (hex code) is required.";
        isValid = false;
    } else {
        for (const hex of variant.colorHexes) {
            if (!isValidHexColor(hex)) {
                errors.colorHexes = `Invalid hex color format: ${hex}. Must be #RRGGBB.`;
                isValid = false;
                break;
            }
        }
    }
    
    if (variant.colorDescription.length > 50) {
        errors.colorDescription = "Color pattern description cannot exceed 50 characters.";
        isValid = false;
    }

    if (variant.price === undefined || variant.price === null || isNaN(variant.price) || variant.price <= 0) {
        errors.price = "Price must be a positive number.";
        isValid = false;
    }

    if (!variant.measurementUnit || (variant.measurementUnit !== "Inch" && variant.measurementUnit !== "Centimeter")) {
        errors.measurementUnit = "A valid measurement unit (Inch or Centimeter) is required.";
        isValid = false;
    }

    const categoryDetails = categoriesList.find(cat => cat.name === categoryName);

    if (categoryDetails && categoryDetails.measurements.length > 0) {
        // If measurements are required, at least one size must be selected.
        if (!variant.measurements || Object.keys(variant.measurements).length === 0) {
            errors.measurements = "At least one size must be selected and its measurements provided for this category.";
            isValid = false;
        } else {
            const expectedMeasurementTypes = categoryDetails.measurements;

            for (const sizeKey in variant.measurements) {
                if (Object.prototype.hasOwnProperty.call(variant.measurements, sizeKey)) {
                    const sizeMeasurements = variant.measurements[sizeKey];

                     // Check quantity: must be a positive number.
                    if (sizeMeasurements.quantity === undefined || sizeMeasurements.quantity === null || isNaN(sizeMeasurements.quantity) || sizeMeasurements.quantity <= 0) {
                        errors.measurements = `Quantity for size '${sizeKey}' must be a positive number.`;
                        isValid = false;
                        break;
                    }

                    for (const measurementType of expectedMeasurementTypes) {
                        const measurementValue = sizeMeasurements[measurementType];

                        if (measurementValue === undefined || measurementValue === null || isNaN(measurementValue) || measurementValue <= 0) {
                            errors.measurements = `Measurement '${measurementType}' for size '${sizeKey}' must be a positive number.`;
                            isValid = false;
                            break;
                        }
                    }
                    if (!isValid) break; // Stop checking other sizes if an error is found for the current one
                }
            }
        }   
    }

    
    if (variant.availableDate && !isValidDateString(variant.availableDate)) {
        errors.availableDate = "Available date must be in YYYY-MM-DD format.";
        isValid = false;
    }

    return { isValid, errors };
};


export interface ProductShippingDetailsErrors {
    general: string;
    sameDayFee: string;
    standardShippingFees: string;
    expressShippingFees: string; 
}

export const validateProductShippingDetails = (
    selectedShippingMethods: string[],
    methodFees: ProductShippingDeliveryType["methods"],
    shippingConfig: ShippingConfigDataProps | null
): { isValid: boolean; error: string | null } => {
    if (!shippingConfig) {
        return { isValid: false, error: "Shipping configuration is not loaded." };
    }

    if (selectedShippingMethods.length === 0) {
        return { isValid: false, error: "" };
    }

    for (const methodKeyString of selectedShippingMethods) {
        if (methodKeyString === 'sameDayDelivery') {
            if (!methodFees?.sameDay?.fee || methodFees.sameDay.fee <= 0) {
                return { isValid: false, error: "The fee for Same Day Delivery cannot be zero or empty." };
            }
        } else if (methodKeyString === 'standardShipping' && methodFees?.standard) {
            for (const zoneKeyStr in methodFees.standard) {
                const zoneKey = zoneKeyStr as DeliveryZoneKey;
                const standardConfig = shippingConfig.shippingMethods.standardShipping;
                if (
                    shippingConfig.shippingZones[zoneKey]?.available &&
                    standardConfig?.available &&
                    standardConfig.estimatedDelivery?.[zoneKey]
                ) {
                    if (!methodFees.standard[zoneKey]?.fee || methodFees.standard[zoneKey]!.fee! <= 0) {
                        return { isValid: false, error: `The fee for Standard Shipping in the ${zoneKey.replace(/_/g, ' ')} zone cannot be zero or empty.` };
                    }
                }
            }
        } else if (methodKeyString === 'expressShipping' && methodFees?.express) {
            for (const zoneKeyStr in methodFees.express) {
                const zoneKey = zoneKeyStr as DeliveryZoneKey;
                const expressConfig = shippingConfig.shippingMethods.expressShipping;
                if (
                    shippingConfig.shippingZones[zoneKey]?.available &&
                    expressConfig?.available &&
                    expressConfig.estimatedDelivery?.[zoneKey]
                ) {
                    if (!methodFees.express[zoneKey]?.fee || methodFees.express[zoneKey]!.fee! <= 0) {
                        return { isValid: false, error: `The fee for Express Shipping in the ${zoneKey.replace(/_/g, ' ')} zone cannot be zero or empty.` };
                    }
                }
            }
        }
    }
    return { isValid: true, error: null };
}
