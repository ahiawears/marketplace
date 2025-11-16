import z from "zod";

export const ProductReturnPolicySchema = z.object({
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
    restockingFee: z.object({
        type: z.enum(['percentage', 'fixed']),
        value: z.number().min(0, "Restocking fee cannot be negative"),
    }),
    returnInstructions: z.string().optional(),
});

export type ProductReturnPolicyInterface = z.infer<typeof ProductReturnPolicySchema>;

export const validateProductReturnPolicy = (data: ProductReturnPolicyInterface) => {
    return ProductReturnPolicySchema.safeParse(data);
}
