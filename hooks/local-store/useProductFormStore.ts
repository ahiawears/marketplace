import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CareDetailsSchemaType, GeneralDetailsSchemaType, ReturnPolicySchemaType, ShippingDetailsSchemaType, VariantDetailsSchemaType } from '@/lib/validation-logics/add-product-validation/product-schema';

const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
	const result = { ...target };
	
	(Object.keys(source) as Array<keyof T>).forEach(key => {
		const sourceValue = source[key];
		
		if (sourceValue === undefined || sourceValue === null) {
			return;
		}
		
		const targetValue = target[key];
		
		if (
			typeof sourceValue === 'object' &&
			typeof targetValue === 'object' &&
			!Array.isArray(sourceValue) &&
			!Array.isArray(targetValue) &&
			!(sourceValue instanceof Date) &&
			!(targetValue instanceof Date)
		) {
			result[key] = {
				...targetValue,
				...sourceValue
			} as T[typeof key];
		} else {
			result[key] = sourceValue as T[typeof key];
		}
	});
	
	return result;
};

const DEFAULT_GENERAL_DETAILS: GeneralDetailsSchemaType = {
    productName: "",
    productDescription: "",
    category: "",
    subCategory: "",
    tags: [],
    gender: "Unisex",
    season: "",
};

const DEFAULT_VARIANT_DETAILS: VariantDetailsSchemaType = {
  	id: '',
	variantName: "",
	price: 0,
	sku: "",
	productCode: "",
	images: [],
	imagesDescription: "",
	colors: [{
		name: "",
		hexCode: ""
	}],
	colorDescription: "",
	pattern: "",
	materialComposition: [{
		name: "",
		percentage: 0
	}],
	measurementUnit: "Inch",
	measurements: {},
	availableDate: "",
	slug: "",
	status: "active",
	marketingAndExclusivityTags: [],
	sustainabilityTags: [],
	craftmanshipTags: [],
	categoryName: "",
}

const DEFAULT_SHIPPING_DETAILS: ShippingDetailsSchemaType = {
	productId: "",
	weight: 0,
	dimensions: {
		length: 0,
		width: 0,
		height: 0,
	},
	measurementUnit: "Inch",
	methods: {}
}

const DEFAULT_CARE_DETAILS: CareDetailsSchemaType = {
	productId: "",
	washingInstruction: null,
	dryingInstruction: null,
	bleachingInstruction: null,
	ironingInstruction: null,
	dryCleaningInstruction: null,
	specialCases: null
}

const DEFAULT_RETURN_POLICY: ReturnPolicySchemaType = {
	productId: "",
	isReturnable: "returnable",
	useProductSpecificReturnPolicy: false,
	returnWindowDays: 7,
	conditionRequirements: {
		unwornAndUnwashed: false,
		originalPackagingAndTagsIntact: false,
		notADiscountedItem: false,
		notCustomMade: false,
		damagedItem: {
			allowed: false,
			imagesRequired: false
		},
		finalSaleItemsNotAllowed: false,
		otherConditions: false
	},
	returnShippingResponsibility: {
		brandPays: false,
		customerPays: false,
		dependsOnReason: false
	},
	refundMethods: {
		fullRefund: false,
		storeCredit: false,
		exchange: false,
		replace: false
	},
	refundProcessingTimeDays: 1,
	restockingFee: {
		type: "percentage",
		value: 0
	}
}

interface ProductFormState {
	// State
	generalDetails: GeneralDetailsSchemaType;
	variantDetails: VariantDetailsSchemaType;
	shippingDetails: ShippingDetailsSchemaType;
	careDetails: CareDetailsSchemaType;
	returnPolicy: ReturnPolicySchemaType;
	productId: string;

	// Setters
	setGeneralDetails: (updates: Partial<GeneralDetailsSchemaType>) => void;
	setVariantDetails: (updates: Partial<VariantDetailsSchemaType>) => void;
	setShippingDetails: (updates: Partial<ShippingDetailsSchemaType>) => void;
	setCareDetails: (updates: Partial<CareDetailsSchemaType>) => void;
	setReturnPolicy: (updates: Partial<ReturnPolicySchemaType>) => void;
	setProductId: (newProductId: string) => void;

	// Reset functions
	resetGeneralDetails: () => void;
	resetVariantDetails: () => void;
	resetShippingDetails: () => void;
	resetCareDetails: () => void;
	resetReturnPolicy: () => void;
	resetAll: () => void;
}
 
export const useProductFormStore = create<ProductFormState>()(
	persist(
		(set) => ({
			generalDetails: DEFAULT_GENERAL_DETAILS,
			variantDetails: DEFAULT_VARIANT_DETAILS,
			shippingDetails: DEFAULT_SHIPPING_DETAILS,
			careDetails: DEFAULT_CARE_DETAILS,
			returnPolicy: DEFAULT_RETURN_POLICY,
			productId: "",


			setGeneralDetails: (updates) =>
				set((state) => ({
					generalDetails: deepMerge({ ...state.generalDetails }, updates),
				})),

			setVariantDetails: (updates) =>
				set((state) => ({
					variantDetails: deepMerge({ ...state.variantDetails }, updates),
				})),

			setShippingDetails: (updates) =>
				set((state) => ({
					shippingDetails: deepMerge({ ...state.shippingDetails }, updates),
				})),

			setCareDetails: (updates) =>
				set((state) => ({
				careDetails: deepMerge({ ...state.careDetails }, updates),
				})),

			setReturnPolicy: (updates) =>
				set((state) => ({
				returnPolicy: deepMerge({ ...state.returnPolicy }, updates),
				})),

			setProductId: (id) => set({ productId: id }),


			resetGeneralDetails: () => set({ generalDetails: DEFAULT_GENERAL_DETAILS }),
			resetVariantDetails: () => set({ variantDetails: DEFAULT_VARIANT_DETAILS }),
			resetShippingDetails: () => set({ shippingDetails: DEFAULT_SHIPPING_DETAILS }),
			resetCareDetails: () => set({ careDetails: DEFAULT_CARE_DETAILS }),
			resetReturnPolicy: () => set({ returnPolicy: DEFAULT_RETURN_POLICY }),

			resetAll: () =>
				set({
					generalDetails: DEFAULT_GENERAL_DETAILS,
					variantDetails: DEFAULT_VARIANT_DETAILS,
					shippingDetails: DEFAULT_SHIPPING_DETAILS,
					careDetails: DEFAULT_CARE_DETAILS,
					returnPolicy: DEFAULT_RETURN_POLICY,
					productId: "",
				}),
			}),
		{
			name: "add-product-form",
			partialize: (state) => ({
				generalDetails: state.generalDetails,
				variantDetails: state.variantDetails,
				shippingDetails: state.shippingDetails,
				careDetails: state.careDetails,
				returnPolicy: state.returnPolicy,
				productId: state.productId,
			}),
		}
	)
);