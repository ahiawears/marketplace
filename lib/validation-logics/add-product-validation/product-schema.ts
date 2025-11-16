import { z } from 'zod';
import { categoriesList } from '@/lib/categoriesList';

// This schema can be used for both frontend and backend validation,
// creating a single source of truth for your data integrity rules.
export const GeneralDetailsValidationSchema = z.object({
    productName: z.string({ required_error: "Product name is required." })
        .trim()
        .min(3, "Product name must be between 3 and 100 characters.")
        .max(100, "Product name must be between 3 and 100 characters."),
    productDescription: z
        .string({ required_error: "Product description is required." })
        .trim()
        .min(20, "Product description must be at least 20 characters.")
        .max(300, "Product description must be 300 characters or less."),
    category: z.string().trim().min(1, "Category is required."),
    subCategory: z.string().trim().min(1, "Subcategory is required."),
    tags: z
        .array(z.string().trim())
        .min(1, "At least one tag is required.")
        .max(5, "You can select up to 5 tags."),
    gender: z.enum(["Male", "Female", "Unisex"], {
        invalid_type_error: "Gender is required.",
    }),
    season: z.string().trim().optional(),
});

export type GeneralDetailsSchemaType = z.infer<typeof GeneralDetailsValidationSchema>;



// Variant Details Schema
// This schema is more complex due to the nested structures and conditional validations.
// It ensures that each variant adheres to the specified rules, including arrays of objects and
// conditional requirements based on category selections.
// It is designed to be used both on the client-side for immediate feedback
// and on the server-side for final validation before processing the data.
const ColorSchema = z.object({
    name: z.string(),
    hexCode: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format."),
});

const MaterialCompositionSchema = z.object({
    name: z.string().min(1, "Material name is required."),
    percentage: z.number().min(0, "Percentage cannot be negative.").max(100, "Percentage cannot exceed 100."),
});

const MeasurementValueSchema = z.object({
    quantity: z.number({ invalid_type_error: "Quantity is required." }).positive("Quantity must be a positive number."),
}).catchall(z.number().positive("Measurement must be a positive number."));

export const VariantDetailsValidationSchema = z.object({
    id: z.string(),
    variantName: z.string().trim().min(1, "Variant name is required."),
    price: z.number({ required_error: "Price is required.", invalid_type_error: "Price is required." }).positive("Price must be a positive number."),
    sku: z.string().trim().min(1, "SKU is required."),
    productCode: z.string().trim().min(1, "Product code is required."),
    images: z.array(z.string())
        .refine(images => images.some(img => img && img.trim() !== ""), {
            message: "At least one product image is required.",
        }),
    imagesDescription: z.string().max(350, "Image description cannot exceed 350 characters.").optional(),
    colors: z.array(ColorSchema).nonempty("At least one variant color is required."),
    colorDescription: z.string().optional(),
    pattern: z.string().optional(),
    materialComposition: z.array(MaterialCompositionSchema)
        .nonempty("At least one material is required.")
        .refine(
            (materials) => materials.reduce((sum, mat) => sum + (mat.percentage || 0), 0) === 100,
            (materials) => ({
                message: `Material composition must add up to 100%. Current total: ${materials.reduce((sum, mat) => sum + (mat.percentage || 0), 0)}%.`
            })
        ),
    measurementUnit: z.enum(["Inch", "Centimeter"]),
    measurements: z.record(z.string(), MeasurementValueSchema),
    availableDate: z.string(),
    slug: z.string(),
    status: z.enum(["active", "inactive"]),
    marketingAndExclusivityTags: z.array(z.string()),
    sustainabilityTags: z.array(z.string()),
    craftmanshipTags: z.array(z.string()),
    categoryName: z.string().optional(),
}).superRefine((data, ctx) => {
    const categoryDetails = categoriesList.find(cat => cat.name === data.categoryName);
    if (categoryDetails && categoryDetails.measurements.length > 0) {
        if (!data.measurements || Object.keys(data.measurements).length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["measurements"],
                message: "At least one size must be selected for this category.",
            });
        }
    }
});

export type VariantDetailsSchemaType = z.infer<typeof VariantDetailsValidationSchema>;







const ProductMethodZoneConfigSchema = z.object({
    fee: z.number({ required_error: "Fee is required.", invalid_type_error: "Fee must be a number." }).positive("Fee must be a positive number."),
    available: z.boolean().optional(),
});


export const ShippingDetailsValidationSchema = z.object({
    productId: z.string().min(1, "Product ID is required."),
    weight: z.number({ required_error: "Weight is required.", invalid_type_error: "Weight must be a number." }).positive("Weight must be a positive number."),
    dimensions: z.object({
        length: z.number({ required_error: "Length is required.", invalid_type_error: "Length must be a number." }).positive("Length must be a positive number."),
        width: z.number({ required_error: "Width is required.", invalid_type_error: "Width must be a number." }).positive("Width must be a positive number."),
        height: z.number({ required_error: "Height is required.", invalid_type_error: "Height must be a number." }).positive("Height must be a positive number."),
    }),
    measurementUnit: z.enum(["Inch", "Centimeter"]),
    methods: z.object({ // This object defines the structure of the shipping methods
        standard: z.record(ProductMethodZoneConfigSchema).optional(),
        express: z.record(ProductMethodZoneConfigSchema).optional(),
        sameDay: ProductMethodZoneConfigSchema.optional(), 
    }).refine( 
        (methods) => methods && (!!methods.standard || !!methods.express || !!methods.sameDay),
        { message: "At least one shipping method must be configured." } 
    ), 
})
export type ShippingDetailsSchemaType = z.infer<typeof ShippingDetailsValidationSchema>;







export const CareDetailsValidationSchema = z.object({
    productId: z.string().min(1, "Product ID is required."),
    washingInstruction: z.string().nullable().optional(),
    dryingInstruction: z.string().nullable().optional(),
    bleachingInstruction: z.string().nullable().optional(),
    ironingInstruction: z.string().nullable().optional(),
    dryCleaningInstruction: z.string().nullable().optional(),
    specialCases: z.string().nullable().optional(),
}).refine(
    (data) =>
        !!data.washingInstruction ||
        !!data.dryingInstruction ||
        !!data.bleachingInstruction ||
        !!data.ironingInstruction ||
        !!data.dryCleaningInstruction ||
        !!data.specialCases,
    {
        message: "At least one care instruction must be selected.",
    }
);

export type CareDetailsSchemaType = z.infer<typeof CareDetailsValidationSchema>;







// Return Policy Schema
const RestockingFeeSchema = z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number().min(0, "Restocking fee cannot be negative."),
});

export const ReturnPolicyValidationSchema = z.object({
    productId: z.string().min(1, "Product ID is required."),
    isReturnable: z.enum(['returnable', 'non-returnable']),
    useProductSpecificReturnPolicy: z.boolean(),
    returnWindowDays: z.number().min(7, "Return window must be at least 7 days").max(30, "Return window cannot exceed 30 days"),
    conditionRequirements: z.object({
        unwornAndUnwashed: z.boolean(),
        originalPackagingAndTagsIntact: z.boolean(),
        notADiscountedItem: z.boolean(),
        notCustomMade: z.boolean(),
        damagedItem: z.object({
            allowed: z.boolean(),
            imagesRequired: z.boolean().optional(),
        }),
        finalSaleItemsNotAllowed: z.boolean(),
        otherConditions: z.boolean(),   
    }),
    returnShippingResponsibility: z.object({
        brandPays: z.boolean(),
        customerPays: z.boolean(),
        dependsOnReason: z.boolean(),
    }),
    refundMethods: z.object({
        fullRefund: z.boolean(),
        storeCredit: z.boolean(),
        exchange: z.boolean(),
        replace: z.boolean(),
    }),
    refundProcessingTimeDays: z.number().min(1, "Processing time must be at least 1 day").max(14, "Processing time cannot exceed 14 days"),
    restockingFee: RestockingFeeSchema, 
});

export type ReturnPolicySchemaType = z.infer<typeof ReturnPolicyValidationSchema>;

export const validateReturnPolicy = (data: ReturnPolicySchemaType) => {
    return ReturnPolicyValidationSchema.safeParse(data);
}