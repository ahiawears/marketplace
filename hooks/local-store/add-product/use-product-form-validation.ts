import { useCallback } from "react"
import { CareDetailsSchemaType, CareDetailsValidationSchema, GeneralDetailsSchemaType, GeneralDetailsValidationSchema, ReturnPolicySchemaType, ReturnPolicyValidationSchema, ShippingDetailsSchemaType, ShippingDetailsValidationSchema, VariantDetailsArraySchemaType, VariantDetailsArrayValidationSchema, VariantDetailsSchemaType } from "@/lib/validation-logics/add-product-validation/product-schema"
import { z } from "zod"

type FormStep = 
	| 'generalDetails' 
	| 'variantDetails' 
	| 'shippingDetails' 
	| 'careDetails' 
	| 'returnPolicy';

type FormData = {
	generalDetails: GeneralDetailsSchemaType;
	variantDetails: VariantDetailsArraySchemaType;
	shippingDetails: ShippingDetailsSchemaType;
	careDetails: CareDetailsSchemaType;
	returnPolicy: ReturnPolicySchemaType;
}

// Allow either a normal Zod schema or an effect-wrapped schema; avoid 'any' by using unknown where needed.
type SchemaLike = z.ZodTypeAny | z.ZodEffects<z.ZodTypeAny, unknown, unknown>;

const productValidationSchemas: Record<FormStep, SchemaLike> = {
	generalDetails: GeneralDetailsValidationSchema,
	variantDetails: VariantDetailsArrayValidationSchema,
	shippingDetails: ShippingDetailsValidationSchema,
	careDetails: CareDetailsValidationSchema,
	returnPolicy: ReturnPolicyValidationSchema
}

export const useFormValidation = () => {
	// Validate a specific field in any step
	const validateField = useCallback(<
		TStep extends FormStep,
		TField extends keyof FormData[TStep]
	>(
		step: TStep,
		field: TField,
		value: FormData[TStep][TField]
	) => {
		let schema = productValidationSchemas[step];

		// If the schema is a ZodEffects, get the inner ZodObject to use .pick()
		if (schema instanceof z.ZodEffects) {
			schema = schema.innerType();
		}
		
		try {
			if (schema instanceof z.ZodObject) {
				const fieldSchema = schema.pick({ [field as string]: true });
				fieldSchema.parse({ [field]: value });
				return { isValid: true, error: '' };
			}

			// Fallback for non-object schemas (like arrays of objects for variantDetails)
			// This is a simplified validation and might not be perfect for all cases.
			return { isValid: false, error: 'Unable to validate this field' };
		} catch (error) {
			if (error instanceof z.ZodError) {
				return { 
					isValid: false, 
					error: error.errors[0]?.message || 'Invalid value' 
				};
			}
			return { isValid: false, error: 'Validation failed' };
		}
	}, []);

	// Validate a specific field in an array of objects (e.g., for variantDetails)
	const validateArrayField = useCallback(
		<TField extends keyof VariantDetailsSchemaType>(
			step: 'variantDetails',
			variantIndex: number, 
			field: TField,
			value: VariantDetailsSchemaType[TField]
		) => {
			const schema = productValidationSchemas[step];

			if (schema instanceof z.ZodArray) {
				const itemSchema = schema.element;
				
				try {
					// Validate the specific field using the item schema
					if (itemSchema instanceof z.ZodObject) {
						const fieldSchema = itemSchema.pick({ [field as string]: true });
						fieldSchema.parse({ [field]: value });
					}
					
					// Now also validate that this wouldn't break any array-specific constraints
					// For example, if you have array-level validations like .min(1) etc.
					// We create a minimal valid array to test array-level constraints
					const minimalValidArray = Array.from({ length: Math.max(1, variantIndex + 1) }, () => ({}));
					schema.parse(minimalValidArray);
					
					return { isValid: true, error: '' };
				} catch (error) {
					if (error instanceof z.ZodError) {
						// Check if this is an array-level error or field-level error
						const fieldLevelError = error.errors.find(err => 
							err.path.length > 1 && err.path[1] === field
						);
						
						const arrayLevelError = error.errors.find(err => 
							err.path.length === 0 || err.path.length === 1
						);
						
						return { 
							isValid: false, 
							error: fieldLevelError?.message || arrayLevelError?.message || 'Invalid value' 
						};
					}
					return { isValid: false, error: 'Validation failed' };
				}
			}
			return { isValid: false, error: 'Unable to validate this field' };
		},[]
		);

	// Validate an entire step
	const validateStep = useCallback(<TStep extends FormStep>(
		step: TStep,
		data: FormData[TStep]
	) => {
		const schema = productValidationSchemas[step];
		const result = schema.safeParse(data);
		
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
	}, []);

	// Validate all steps at once
	const validateAllSteps = useCallback((formData: FormData) => {
		const results: Record<FormStep, { isValid: boolean; errors: Record<string, string> }> = {
			generalDetails: { isValid: false, errors: {} },
			variantDetails: { isValid: false, errors: {} },
			shippingDetails: { isValid: false, errors: {} },
			careDetails: { isValid: false, errors: {} },
			returnPolicy: { isValid: false, errors: {} },
		};

		let allValid = true;

		(Object.keys(productValidationSchemas) as FormStep[]).forEach(step => {
			const result = validateStep(step, formData[step]);
			results[step] = result;
			if (!result.isValid) allValid = false;
		});

		return { allValid, results };
	}, [validateStep]);

	return {
		validateField,
		validateArrayField,
		validateStep,
		validateAllSteps,
	};
};
