import { z } from 'zod';

export const returnAddressSchema = z.object({
    contactPerson: z.string(),
    addressLine: z.string().min(1, "Address line is required"),
    city: z.string().min(1, "City is required"),
    region: z.string(),
    postalCode: z.string(),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z.string(),
    email: z.string().email().or(z.literal("")),
});

export const returnContactSchema = z.object({
    name: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
});

export const returnPolicySchema = z.object({
    policyScope: z.enum(['brand', 'product']),
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
    returnReasons: z.object({
        wrongSize: z.boolean(),
        defectiveItem: z.boolean(),
        notAsDescribed: z.boolean(),
        changedMind: z.boolean(),
        wrongItemSent: z.boolean(),
        otherReasons: z.string().optional(),
    }),
    returnMethods: z.object({
        customerShipsBack: z.boolean(),
        brandProvidesReturnLabel: z.boolean(),
        arrangePickup: z.boolean(),
    }),
    refundMethods: z.object({
        fullRefund: z.boolean(),
        storeCredit: z.boolean(),
        exchange: z.boolean(),
        replace: z.boolean(),
    }),
    refundProcessingTimeDays: z.number().min(1, "Processing time must be at least 1 day").max(14, "Processing time cannot exceed 14 days"),
    restockingFee: z.object({
        type: z.enum(['percentage', 'fixed']),
        value: z.number().min(0, "Restocking fee cannot be negative").max(100, "Percentage cannot exceed 100%").or(z.number().min(0, "Restocking fee cannot be negative")),
    }),
    returnAddress: returnAddressSchema,
    returnContact: returnContactSchema,
    returnInstructions: z.string().optional(),
});

export type ReturnPolicyInterface = z.infer<typeof returnPolicySchema>;

export const validateReturnPolicy = (data: ReturnPolicyInterface) => {
    return returnPolicySchema.safeParse(data);
};