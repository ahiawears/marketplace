import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CareDetailsSchemaType, GeneralDetailsSchemaType, ReturnPolicySchemaType, ShippingDetailsSchemaType, VariantDetailsArraySchemaType, VariantDetailsSchemaType } from '@/lib/validation-logics/add-product-validation/product-schema';
import { imageStorage } from '../../lib/utils/imageStorage';

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

const generateVariantId = () => `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Single variant default (for adding new variants)
export const DEFAULT_SINGLE_VARIANT: VariantDetailsSchemaType = {
	id: generateVariantId(),
	variantName: "",
	price: 0.00,
	sku: "",
	productCode: "",
	images: ["", "", "", ""],
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
};

export const DEFAULT_VARIANT_DETAILS: VariantDetailsArraySchemaType = [{
  	id: `variant_${Date.now()}_${Math.random()}`,
	variantName: "",
	price: 0.00,
	sku: "",
	productCode: "",
	images: ["", "", "", ""],
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
}];

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
	variantDetails: VariantDetailsArraySchemaType;
	shippingDetails: ShippingDetailsSchemaType;
	careDetails: CareDetailsSchemaType;
	returnPolicy: ReturnPolicySchemaType;
	productId: string;

	// Setters
	setGeneralDetails: (updates: Partial<GeneralDetailsSchemaType>) => void;
	setVariantDetails: (updates: VariantDetailsArraySchemaType) => void;
	setShippingDetails: (updates: Partial<ShippingDetailsSchemaType>) => void;
	setCareDetails: (updates: Partial<CareDetailsSchemaType>) => void;
	setReturnPolicy: (updates: Partial<ReturnPolicySchemaType>) => void;
	setProductId: (newProductId: string) => void;

	//variant details array operations
	addVariant: (variant?: Partial<VariantDetailsSchemaType>) => void;
	updateVariant: (index: number, updates: Partial<VariantDetailsSchemaType>) => void;
	removeVariant: (index: number) => void;
	moveVariant: (fromIndex: number, toIndex: number) => void;

	//Image persistence
	saveImagesToStorage: (variantIndex: number, images: string[]) => Promise<void>;
	loadImagesFromStorage: (variantIndex: number) => Promise<string[]>;
	clearImageStorage: (variantIndex: number) => Promise<void>;
	clearAllImagesStorage: () => Promise<void>;

	// Reset functions
	resetGeneralDetails: () => void;
	resetVariantDetails: () => void;
	resetShippingDetails: () => void;
	resetCareDetails: () => void;
	resetReturnPolicy: () => void;
	resetAll: () => void;
}

const convertToImageIds = async (images: string[], variantIndex: number): Promise<string[]> => {
	return await Promise.all(
		images.map(async (image, imageIndex) => {
			if (!image || image === '') return '';
			
			if (image.startsWith('blob:') || image.startsWith('data:')) {
				try {
				const imageId = `variant-${variantIndex}-image-${imageIndex}-${Date.now()}`;
				
				if (image.startsWith('blob:')) {
					const response = await fetch(image);
					const blob = await response.blob();
					await imageStorage.saveImage(imageId, blob);
				} else if (image.startsWith('data:')) {
					const response = await fetch(image);
					const blob = await response.blob();
					await imageStorage.saveImage(imageId, blob);
				}
				
				return imageId;
				} catch (error) {
				console.error('Error saving image to storage:', error);
				return '';
				}
			}
			
			return image;
		})
	);
};


const loadImagesFromIds = async (images: string[]): Promise<string[]> => {
	return await Promise.all(
		images.map(async (image) => {
			if (!image || image === '') return '';
			
			if (image.startsWith('variant-')) {
				try {
					const loadedImage = await imageStorage.getImage(image);
					return loadedImage || '';
				} catch (error) {
					console.error('Error loading image from storage:', error);
					return '';
				}
			}
			
			return image;
		})
	);
};

 
export const useProductFormStore = create<ProductFormState>()(
	persist(
		(set, get) => ({
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

			setVariantDetails: (updates: VariantDetailsArraySchemaType) =>
				set({ variantDetails: updates }),

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

			// In your Zustand store implementation, make sure the array operations are correct:
			addVariant: (variant = {}) =>
				set((state) => {
					// Ensure variantDetails is always an array
					const currentVariants = Array.isArray(state.variantDetails) ? state.variantDetails : [];
					
					return {
						variantDetails: [
							...currentVariants,
							{
							...DEFAULT_SINGLE_VARIANT,
							...variant,
							id: generateVariantId(),
							}
						]
					}
				}),

			updateVariant: (index, updates) =>
				set((state) => {
					// Ensure variantDetails is always an array
					const currentVariants = Array.isArray(state.variantDetails) ? state.variantDetails : [];
					
					return {
						variantDetails: currentVariants.map((variant, i) =>
							i === index ? deepMerge(variant, updates) : variant
						)
					}
				}),

			removeVariant: (index) =>
				set((state) => {
					// Ensure variantDetails is always an array
					const currentVariants = Array.isArray(state.variantDetails) ? state.variantDetails : [];
					
					return {
						variantDetails: currentVariants.filter((_, i) => i !== index)
					}
				}),

			moveVariant: (fromIndex, toIndex) =>
				set((state) => {
					const variants = [...state.variantDetails];
					const [movedVariant] = variants.splice(fromIndex, 1);
					variants.splice(toIndex, 0, movedVariant);
					return { variantDetails: variants };
				}),


			saveImagesToStorage: async (variantIndex: number, images: string[]) => {
				const imageIds = await convertToImageIds(images, variantIndex);
				
				set((state) => ({
					variantDetails: state.variantDetails.map((variant, index) =>
						index === variantIndex ? { ...variant, images: imageIds } : variant
					)
				}));
			},

			loadImagesFromStorage: async (variantIndex: number) => {
				const state = get();
				const variant = state.variantDetails[variantIndex];
				
				if (!variant) return Array(4).fill('');
				
				const loadedImages = await loadImagesFromIds(variant.images);
				return loadedImages;
			},

			clearImageStorage: async (variantIndex: number) => {
				const state = get();
				const variant = state.variantDetails[variantIndex];
				
				if (variant) {
					await Promise.all(
						variant.images.map(async (image: string) => {
							if (image.startsWith('variant-')) {
								await imageStorage.deleteImage(image);
							}
						})
					);
				}
			},

			clearAllImagesStorage: async () => {
				await imageStorage.clearAllImages();
			},

			resetGeneralDetails: () => set({ generalDetails: DEFAULT_GENERAL_DETAILS }),
			resetVariantDetails: () => set({ variantDetails: DEFAULT_VARIANT_DETAILS }),
			resetShippingDetails: () => set({ shippingDetails: DEFAULT_SHIPPING_DETAILS }),
			resetCareDetails: () => set({ careDetails: DEFAULT_CARE_DETAILS }),
			resetReturnPolicy: () => set({ returnPolicy: DEFAULT_RETURN_POLICY }),

			resetAll: () => {
				const state = get();
				// Clear all images from storage
				state.clearAllImagesStorage().catch(console.error);
				set({
					generalDetails: DEFAULT_GENERAL_DETAILS,
					variantDetails: DEFAULT_VARIANT_DETAILS,
					shippingDetails: DEFAULT_SHIPPING_DETAILS,
					careDetails: DEFAULT_CARE_DETAILS,
					returnPolicy: DEFAULT_RETURN_POLICY,
					productId: "",
				});
			},
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
			version: 1,
			migrate: (persistedState: any, version: number) => {
				if (version === 0) {
					// Handle migration from previous versions if needed
				}
				return persistedState as ProductFormState;
			},
		}
	)
);