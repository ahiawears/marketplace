import { ProductShippingDeliveryType, DeliveryZoneKey } from "../../lib/types.ts";

function roundCurrencyAmount(amount: number) {
    return Number(amount.toFixed(2));
}

type BrandDeliveryRule = {
    id: string;
    method_type: "same_day" | "standard" | "express";
    zone_type: DeliveryZoneKey | "domestic";
    fee: number | null;
    additional_item_fee?: number | null;
};

interface ProductShippingContext {
    brandId: string;
    brandCurrency: string;
    exchangeRate: number;
}

export async function createProductShippingDetails(
    supabase: any,
    productShippingConfig: ProductShippingDeliveryType,
    context: ProductShippingContext
) {
    try {
        const { data: brandShippingConfig } = await supabase
            .from("shipping_configurations")
            .select("id")
            .eq("brand_id", context.brandId)
            .maybeSingle();

        const brandShippingConfigId = (brandShippingConfig as { id?: string } | null)?.id ?? null;

        const { data: brandDeliveryRules } = brandShippingConfigId
            ? await supabase
                .from("shipping_method_delivery")
                .select("id, method_type, zone_type, fee, additional_item_fee")
                .eq("config_id", brandShippingConfigId)
            : { data: [] };

        const brandRuleMap = new Map<string, BrandDeliveryRule>();
        for (const rule of ((brandDeliveryRules || []) as BrandDeliveryRule[])) {
            brandRuleMap.set(`${rule.method_type}:${rule.zone_type}`, rule);
        }

        const { data: productShippingConfigData, error: productShippingConfigError } = await supabase
            .from("product_shipping_details")
            .upsert({
                product_id: productShippingConfig.productId,
                weight: productShippingConfig.weight,
                height: productShippingConfig.dimensions.height,
                width: productShippingConfig.dimensions.width,
                length: productShippingConfig.dimensions.length,
                dimension_unit: productShippingConfig.measurementUnit,
                brand_shipping_config_id: brandShippingConfigId,

            }, {
                onConflict: "product_id",
            })
            .select('id')
            .single();

        if (productShippingConfigError) {
            throw productShippingConfigError;
        }

        if (!productShippingConfigData) {
            throw new Error("Failed to create or retrieve product shipping details ID.");
        }

        const productShippingDetailsId = productShippingConfigData.id;

        const methodFeesToInsert: any[] = [];
        if (productShippingConfig.methods) {

            const sameDayMethod = productShippingConfig.methods.sameDay;
            if (sameDayMethod && sameDayMethod.available && sameDayMethod.fee && sameDayMethod.fee > 0) {
                const sourceRule = brandRuleMap.get("same_day:domestic");
                const inheritedFromBrandConfig = Boolean(
                    sourceRule && Number(sourceRule.fee ?? 0) === Number(sameDayMethod.fee)
                );
                methodFeesToInsert.push({
                    product_shipping_id: productShippingDetailsId,
                    method_type: 'same_day',
                    zone_type: 'domestic', 
                    available: sameDayMethod.available,
                    fee: sameDayMethod.fee,
                    calculation_strategy: 'flat',
                    additional_item_fee: 0,
                    currency_code: context.brandCurrency,
                    base_fee: roundCurrencyAmount(sameDayMethod.fee / context.exchangeRate),
                    inherited_from_brand_config: inheritedFromBrandConfig,
                    source_delivery_rule_id: sourceRule?.id ?? null,
                });
            }
            
            for (const methodKey of ["standard", "express"] as const) {
                const method = productShippingConfig.methods[methodKey];
                if (method) {
                    for (const zoneKey of Object.keys(method) as DeliveryZoneKey[]) {
                        const zoneConfig = method[zoneKey];
                        if (zoneConfig && zoneConfig.available) {
                            const sourceRule = brandRuleMap.get(`${methodKey}:${zoneKey}`);
                            const inheritedFromBrandConfig = Boolean(
                                sourceRule &&
                                Number(sourceRule.fee ?? 0) === Number(zoneConfig.fee ?? 0) &&
                                Number(sourceRule.additional_item_fee ?? 0) === Number(zoneConfig.additionalItemFee ?? 0)
                            );
                            methodFeesToInsert.push({
                                product_shipping_id: productShippingDetailsId,
                                method_type: methodKey,
                                zone_type: zoneKey,
                                available: zoneConfig.available,
                                fee: zoneConfig.fee,
                                calculation_strategy: 'base_incremental',
                                additional_item_fee: Number(zoneConfig.additionalItemFee ?? 0),
                                currency_code: context.brandCurrency,
                                base_fee: roundCurrencyAmount(Number(zoneConfig.fee ?? 0) / context.exchangeRate),
                                inherited_from_brand_config: inheritedFromBrandConfig,
                                source_delivery_rule_id: sourceRule?.id ?? null,
                            });
                        }
                    }
                }
            }
        }
        // 3. Delete old method fees to ensure no stale data remains.
        const { error: deleteError } = await supabase
            .from("product_shipping_fees")
            .delete()
            .eq("product_shipping_id", productShippingDetailsId);

        if (deleteError) throw deleteError;

        // 4. Insert the new, flattened method fees if there are any.
        if (methodFeesToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from("product_shipping_fees")
                .insert(methodFeesToInsert);

            if (insertError) throw insertError;
        }

        const usesBrandShippingConfig =
            methodFeesToInsert.length > 0 &&
            methodFeesToInsert.every((feeRow) => feeRow.inherited_from_brand_config === true);

        const { error: profileUpdateError } = await supabase
            .from("product_shipping_details")
            .update({
                uses_brand_shipping_config: usesBrandShippingConfig,
                uses_brand_shipping_strategy: usesBrandShippingConfig,
                shipping_rule_source: usesBrandShippingConfig ? "brand_default" : "product_override",
                shipping_strategy: "base_incremental",
                shipping_profile_snapshot: {
                    currency_code: context.brandCurrency,
                    exchange_rate_used: context.exchangeRate,
                    rule_count: methodFeesToInsert.length,
                    rules: methodFeesToInsert.map((row) => ({
                        method_type: row.method_type,
                        zone_type: row.zone_type,
                        fee: row.fee,
                        additional_item_fee: row.additional_item_fee,
                        calculation_strategy: row.calculation_strategy,
                        base_fee: row.base_fee,
                        inherited_from_brand_config: row.inherited_from_brand_config,
                    })),
                },
            })
            .eq("id", productShippingDetailsId);

        if (profileUpdateError) throw profileUpdateError;

        console.log("Product shipping details and method fees updated successfully for ID:", productShippingDetailsId);
        return productShippingDetailsId;
    } catch (error) {
        console.error("Error creating/updating product shipping details:", error);
        throw error;
    }
}
