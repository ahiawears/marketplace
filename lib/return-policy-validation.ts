import { z } from 'zod';

// -----------------------------
// Reusable Schemas
// -----------------------------
export const phoneNumberSchema = z.string()
  .regex(/^\+?[\d\s\-()]{10,}$/, "Invalid phone number format")
  .optional();

export const emailSchema = z.string()
  .email("Invalid email address")
  .or(z.literal(""))
  .optional();

// -----------------------------
// Address Schema
// -----------------------------
export const returnAddressSchema = z.object({
  contactPerson: z.string().min(1, "Contact person is required"),
  addressLine: z.string().min(1, "Address line is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region/State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
}).refine((data) => {
  if (data.country === 'US') {
    return /^\d{5}(-\d{4})?$/.test(data.postalCode);
  }
  return true;
}, {
  message: "Invalid postal code format for selected country",
  path: ["postalCode"]
});

// -----------------------------
// Contact Schema
// -----------------------------
export const returnContactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: phoneNumberSchema,
});

// -----------------------------
// Enums
// -----------------------------
export const RESTOCKING_FEE_TYPE = ['percentage', 'fixed', 'none'] as const;
export const SHIPPING_RESPONSIBILITY = ['brand', 'customer', 'depends_on_reason'] as const;
export const RETURN_METHOD = ['customer_ships', 'brand_label', 'pickup'] as const;
export const REFUND_METHOD = ['full_refund', 'store_credit', 'exchange', 'replacement'] as const;
export const RETURN_REASONS = [
  'wrongSize',
  'changedMind',
  'notSatisfied',
  'defectiveItem',
  'notAsDescribed',
  'wrongItemSent',
  'otherReasons'
] as const;

// -----------------------------
// New Schemas You Requested
// -----------------------------
export const evidenceRequirementsSchema = z.object({
  requireImages: z.boolean().default(false),
  minImageCount: z.number().min(1).max(10).default(1).optional(),
  // requireVideo: z.boolean().default(false),
  requirePackagePhoto: z.boolean().default(false),
  requireSerialNumberPhoto: z.boolean().default(false),
});

export const exchangePolicySchema = z.object({
  allowSizeExchange: z.boolean().default(true),
  allowColorExchange: z.boolean().default(true),
  allowDifferentProductExchange: z.boolean().default(false),
  priceDifferenceHandling: z.enum(['charge_difference', 'no_charge', 'store_credit']).default('charge_difference'),
});

export const internationalReturnsSchema = z.object({
  allowed: z.boolean().default(true),
  customerCoversImportFees: z.boolean().default(true),
  differentReturnWindow: z.number().min(1).max(365).optional(),
});

export const returnSubmissionLimitsSchema = z.object({
  maxRequestsPerOrder: z.number().min(1).max(10).default(1),
  maxRequestsPerItem: z.number().min(1).max(5).default(1),
});

// -----------------------------
// Condition Requirements
// -----------------------------
export const damagedItemSchema = z.object({
  allowed: z.boolean(),
  imagesRequired: z.boolean().default(false),
  descriptionRequired: z.boolean().default(false),
}).refine(
  (data) => !data.imagesRequired || data.allowed,
  "Images can only be required if damaged items are allowed"
);

export const conditionRequirementsSchema = z.object({
  unwornAndUnwashed: z.boolean().default(true),
  originalPackaging: z.boolean().default(true),
  tagsIntact: z.boolean().default(true),
  notDiscounted: z.boolean().default(false),
  notCustomMade: z.boolean().default(true),
  damagedItem: damagedItemSchema,
  finalSaleNotAllowed: z.boolean().default(true),
  otherConditions: z.string().optional(),
}).refine(
  (data) => !data.notDiscounted || data.finalSaleNotAllowed,
  "Discounted items should align with final sale policy"
);

// -----------------------------
// Return Reasons
// -----------------------------
export const returnReasonsSchema = z.object({
  customerRelated: z.object({
    wrongSize: z.boolean().default(true),
    changedMind: z.boolean().default(false),
    notSatisfied: z.boolean().default(false),
  }),
  merchantRelated: z.object({
    defectiveItem: z.boolean().default(true),
    notAsDescribed: z.boolean().default(true),
    wrongItemSent: z.boolean().default(true),
  }),
  otherReasons: z.object({
    allowed: z.boolean().default(false),
    description: z.string().optional(),
  }),
}).refine(
  (data) =>
    Object.values(data.customerRelated).some(v => v) ||
    Object.values(data.merchantRelated).some(v => v),
  "At least one return reason must be enabled"
);

// -----------------------------
// Restocking Fee
// -----------------------------
export const restockingFeeSchema = z.discriminatedUnion("type", [
  // Case 1: None - Value must not exist
  z.object({
    type: z.literal('none'),
    value: z.union([z.literal(0), z.undefined()]).optional(),
    appliesTo: z.array(z.enum(RETURN_REASONS)).default([]),
  }),

  // Case 2: Percentage - Value is required and restricted 0-100
  z.object({
    type: z.literal('percentage'),
    value: z.number({ invalid_type_error: "Value is required" })
      .min(0.01, "Percentage must be greater than 0")
      .max(100, "Percentage cannot exceed 100"),
    appliesTo: z.array(z.enum(RETURN_REASONS)).default([]),
  }),

  // Case 3: Fixed - Value is required and must be non-negative
  z.object({
    type: z.literal('fixed'),
    value: z.number({ invalid_type_error: "Value is required" })
      .positive("Fixed fee must be greater than 0"), 
    usdPrice: z.number().positive("USD Price must be greater than 0").optional(),
    appliesTo: z.array(z.enum(RETURN_REASONS)).default([]),
  }),
]);

// -----------------------------
// MAIN RETURN POLICY SCHEMA
// -----------------------------
export const returnPolicySchema = z.object({
  brandId: z.string().min(1, "Brand ID is required"),

  // Timeline
  returnWindowDays: z.number().min(1).max(365).default(30),

  // Conditions
  conditionRequirements: conditionRequirementsSchema,

  // Shipping
  returnShipping: z.object({
    responsibility: z.enum(SHIPPING_RESPONSIBILITY),
    paidByBrandReasons: z.array(z.string()).optional(),
  }),

  returnReasons: returnReasonsSchema,

  // Methods
  returnMethods: z.array(z.enum(RETURN_METHOD)).min(1),
  refundMethods: z.array(z.enum(REFUND_METHOD)).min(1),

  // Refund
  refundProcessingTimeDays: z.number().min(1).max(60).default(14),

  restockingFee: restockingFeeSchema,

  // Contacts
  returnAddress: returnAddressSchema,
  returnContact: returnContactSchema,

  // Additional
  returnInstructions: z.string().max(1000).optional(),
  specialNotes: z.string().max(500).optional(),

  // Metadata
  isActive: z.boolean().default(true),
  version: z.number().int().positive().default(1),

  // Newly Added
  evidenceRequirements: evidenceRequirementsSchema,
  exchangePolicy: exchangePolicySchema,
  internationalReturns: internationalReturnsSchema,
  returnSubmissionLimits: returnSubmissionLimitsSchema,
}).refine(
  (data) => {
    const customerPays = data.returnShipping.responsibility === 'customer';
    const brandLabelAvailable = data.returnMethods.includes('brand_label');
    return (
      !customerPays ||
      !brandLabelAvailable ||
      (data.returnShipping.paidByBrandReasons?.length ?? 0) > 0
    );
  },
  "Brand-paid return reasons must be specified when customer pays shipping but brand label is available"
).refine(
  (data) => {
    if (data.restockingFee.type === 'none') return true;
    
    const enabledReasons = new Set<string>();
    if (data.returnReasons.customerRelated.wrongSize) enabledReasons.add('wrongSize');
    if (data.returnReasons.customerRelated.changedMind) enabledReasons.add('changedMind');
    if (data.returnReasons.customerRelated.notSatisfied) enabledReasons.add('notSatisfied');
    if (data.returnReasons.merchantRelated.defectiveItem) enabledReasons.add('defectiveItem');
    if (data.returnReasons.merchantRelated.notAsDescribed) enabledReasons.add('notAsDescribed');
    if (data.returnReasons.merchantRelated.wrongItemSent) enabledReasons.add('wrongItemSent');
    if (data.returnReasons.otherReasons.allowed) enabledReasons.add('otherReasons');

    return data.restockingFee.appliesTo.every(reason => enabledReasons.has(reason));
  },
  {
    message: "Restocking fee can only apply to enabled return reasons",
    path: ["restockingFee", "appliesTo"]
  }
).refine(
  (data) => {
    if (data.restockingFee.type === 'none') {
      return true;
    }
    return data.restockingFee.appliesTo.length > 0;
  }, {
    message: "Please select at least one reason for the restocking fee to apply to.",
    path: ["restockingFee", "appliesTo"],
  }
);

export type ReturnPolicy = z.infer<typeof returnPolicySchema>;

export const validateReturnPolicy = (data: ReturnPolicy) => {
  return returnPolicySchema.safeParse(data);
}