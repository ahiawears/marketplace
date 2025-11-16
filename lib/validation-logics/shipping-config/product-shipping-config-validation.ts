import z from "zod";

export const RawShippingZoneSchema = z.object({
    id: z.string(),
    zone_type: z.enum(["domestic", "regional", "sub_regional", "global"]),
    available: z.boolean(),
});

export const RawZoneExclusionSchema = z.object({
    id: z.string(),
    zone_type: z.enum(["domestic", "regional", "sub_regional", "global"]),
    exclusion_type: z.enum(["country", "city"]),
    value: z.string(),
});

export const RawShippingMethodSchema = z.object({
    id: z.string(),
    method_type: z.enum(["standard", "express", "same_day"]),
    available: z.boolean(),
    cut_off_time: z.string().nullable().optional(),
    time_zone: z.string().nullable().optional(),
});

export const RawShippingMethodDeliverySchema = z.object({
    id: z.string(),
    zone_type: z.enum(["domestic", "regional", "sub_regional", "global"]),
    delivery_from: z.number().nullable().optional(),
    delivery_to: z.number().nullable().optional(),
    fee: z.number().nullable().optional(),
    method_type: z.enum(["standard", "express", "same_day"]),
});

export const RawFreeShippingRuleSchema = z.object({
    id: z.string(),
    available: z.boolean().nullable().optional(),
    threshold: z.number().nullable().optional(),
    method_type: z.enum(["standard", "express"]).nullable().optional(),
});

export const RawSameDayCitySchema = z.object({
    city_name: z.string(),
});

export const RawApiDataSchema = z.object({
    id: z.string(),
    brand_id: z.string(),
    handling_time_from: z.number().nullable().optional(),
    handling_time_to: z.number().nullable().optional(),

    shipping_methods: z.array(RawShippingMethodSchema).nullable().optional(),
    shipping_method_delivery: z.array(RawShippingMethodDeliverySchema).nullable().optional(),
    shipping_zones: z.array(RawShippingZoneSchema).nullable().optional(),
    zone_exclusions: z.array(RawZoneExclusionSchema).nullable().optional(),
    free_shipping_rules: z.array(RawFreeShippingRuleSchema).nullable().optional(),
    same_day_applicable_cities: z.array(RawSameDayCitySchema).nullable().optional(),
});


export interface RawShippingMethod {
    id: string;
    method_type: "same_day" | "standard" | "express";
    available: boolean;
    cut_off_time?: string | null;
    time_zone?: string | null;
}

export interface RawShippingMethodDelivery {
    id: string;
    zone_type: "domestic" | "regional" | "sub_regional" | "global";
    delivery_from: number | null;
    delivery_to: number | null;
    fee: number;
    method_type: "same_day" | "standard" | "express";
}

export interface RawShippingZone {
    id: string;
    zone_type: "domestic" | "regional" | "sub_regional" | "global" | string;
    available: boolean;
}

export interface RawZoneExclusion {
    id: string;
    zone_type: "domestic" | "regional" | "sub_regional" | "global";
    exclusion_type: "country" | "city";
    value: string;
}

export interface RawFreeShippingRule {
    id: string;
    available?: boolean;
    threshold?: number;
    method_type: string;
}

export interface RawSameDayApplicableCity {
    city_name: string;
}

export type RawApiData = {
    id: string;
    brand_id: string;
    handling_time_from?: number;
    handling_time_to?: number;

    shipping_methods?: RawShippingMethod[] | null;
    shipping_method_delivery?: RawShippingMethodDelivery[] | null;
    shipping_zones?: RawShippingZone[] | null;
    zone_exclusions?: RawZoneExclusion[] | null;
    free_shipping_rules?: RawFreeShippingRule[] | null;
    same_day_applicable_cities?: RawSameDayApplicableCity[] | null;
};
