import { useCallback } from "react";
import { useFormValidation } from "./use-product-form-validation";
import { CareDetailsSchemaType, GeneralDetailsSchemaType, ReturnPolicySchemaType, ShippingDetailsSchemaType, VariantDetailsArraySchemaType, VariantDetailsSchemaType, VariantDetailsValidationSchema } from "@/lib/validation-logics/add-product-validation/product-schema";

export const useGeneralDetailsValidation = () => {
    const { validateField, validateStep } = useFormValidation();

    const validateGeneralDetailsField = useCallback(
        <TField extends keyof GeneralDetailsSchemaType>(
            field: TField,
            value: GeneralDetailsSchemaType[TField]
        ) => {
            return validateField('generalDetails', field, value);
        },
        [validateField]
    );

    const validateGeneralDetailsStep = useCallback(
        (data: GeneralDetailsSchemaType) => {
            return validateStep('generalDetails', data);
        },
        [validateStep]
    );

    return {
        validateField: validateGeneralDetailsField,
        validateStep: validateGeneralDetailsStep,
    };
};






export const useVariantDetailsStepValidation = () => {
    const { validateArrayField, validateStep } = useFormValidation();

    // Validate a specific field in a specific variant
    const validateVariantDetailsField = useCallback(
        <TField extends keyof VariantDetailsSchemaType>(
            variantIndex: number,
            field: TField,
            value: VariantDetailsSchemaType[TField]
        ) => {
            return validateArrayField('variantDetails', variantIndex, field, value);
        },
        [validateArrayField]
    );

    // Validate all variants (the entire array)
    const validateVariantDetailsStep = useCallback(
        (data: VariantDetailsArraySchemaType) => {
            return validateStep('variantDetails', data);
        },
        [validateStep]
    );

    // Validate a single variant by index
    const validateSingleVariant = useCallback(
        (variantIndex: number, data: VariantDetailsArraySchemaType) => {
            const variant = data[variantIndex];
            if (!variant) {
                return { isValid: false, errors: { _index: 'Variant not found' } };
            }

            const result = VariantDetailsValidationSchema.safeParse(variant);
            
            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.errors.forEach((error) => {
                    if (error.path[0]) {
                        errors[error.path[0] as string] = error.message;
                    }
                });
                return { isValid: false, errors };
            }
            
            return { isValid: true, errors: {} };
        },[]
    );

    return {
        validateField: validateVariantDetailsField,
        validateStep: validateVariantDetailsStep,
        validateSingleVariant,
    };
};






export const useShippingDetailsValidation = () => {
    const { validateField, validateStep } = useFormValidation();

    const validateShippingDetailsField = useCallback(
        <TField extends keyof ShippingDetailsSchemaType>(
            field: TField,
            value: ShippingDetailsSchemaType[TField]
        ) => {
            return validateField('shippingDetails', field, value);
        },
        [validateField]
    );
    const validateShippingDetailsStep = useCallback(
        (data: ShippingDetailsSchemaType) => {
            return validateStep('shippingDetails', data);
        },
        [validateStep]
    );
    return {
        validateField: validateShippingDetailsField,
        validateStep: validateShippingDetailsStep,
    };
}

export const useCareDetailsValidation = () => {
    const { validateField, validateStep } = useFormValidation();

    const validateCareDetailsField = useCallback(
        <TField extends keyof CareDetailsSchemaType>(
            field: TField,
            value: CareDetailsSchemaType[TField]
        ) => {
            return validateField('careDetails', field, value);
        },
        [validateField]
    );
    const validateCareDetailsStep = useCallback(
        (data: CareDetailsSchemaType) => {
            return validateStep('careDetails', data);
        },
        [validateStep]
    );
    return {
        validateField: validateCareDetailsField,
        validateStep: validateCareDetailsStep,
    }
}

export const useReturnPolicySchema = () => {
    const { validateField, validateStep } = useFormValidation();

    const validateReturnPolicyField = useCallback(
        <TField extends keyof ReturnPolicySchemaType>(
            field: TField,
            value: ReturnPolicySchemaType[TField]
        ) => {
            return validateField('returnPolicy', field, value);
        },
        [validateField]
    );

    const validateReturnPolicyStep = useCallback(
        (data: ReturnPolicySchemaType) => {
            return validateStep('returnPolicy', data);
        },
        [validateStep]
    );
    return {
        validateField: validateReturnPolicyField,
        validateStep: validateReturnPolicyStep,
    };
}