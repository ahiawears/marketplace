import {
    CareDetailsSchemaType,
    GeneralDetailsSchemaType,
    ReturnPolicySchemaType,
    ShippingDetailsSchemaType,
    VariantDetailsSchemaType,
} from "@/lib/validation-logics/add-product-validation/product-schema";
import {
    CraftmanshipTags,
    MarketingAndExclusivityTags,
    SustainabilityTags,
} from "@/lib/variantTags";

export interface ProductEditorInitialData {
    productId: string;
    generalDetails: GeneralDetailsSchemaType;
    variantDetails: VariantDetailsSchemaType[];
    shippingDetails: ShippingDetailsSchemaType;
    careDetails: CareDetailsSchemaType;
    returnPolicy: ReturnPolicySchemaType;
    savedSteps: {
        general: boolean;
        variants: boolean;
        shipping: boolean;
        care: boolean;
        returnPolicy: boolean;
    };
}

type ProductLookupRow = {
    id: string;
    name: string;
    product_description: string | null;
    category_id: { name: string | null } | null;
    subcategory_id: { name: string | null } | null;
    gender_id: { name: string | null } | null;
    season_id: { name: string | null } | null;
};

type TagRow = { tag_id: { name: string | null } | null };
type VariantRow = {
    id: string;
    draft_variant_id: string | null;
    name: string | null;
    sku: string | null;
    price: number | null;
    product_code: string | null;
    status: "active" | "inactive" | null;
    slug: string | null;
    available_date: string | null;
    fabric_pattern: string | null;
    color_description: string | null;
    images_description: string | null;
};
type VariantColorRow = {
    product_variant_id: string | null;
    color_id: { name: string | null; hex_code: string | null } | null;
};
type VariantMaterialRow = {
    product_variant_id: string | null;
    material_id: { name: string | null } | null;
    percentage: number | null;
};
type VariantTagRow = {
    product_variant_id: string | null;
    tag_id: { name: string | null } | null;
};
type VariantImageRow = {
    product_variant_id: string;
    image_url: string | null;
    is_main: boolean | null;
};
type ProductSizeRow = {
    id: string;
    product_id: string;
    quantity: number | null;
    size_id: { name: string | null } | null;
};
type ProductMeasurementRow = {
    product_size_id: string | null;
    value: string | null;
    measurement_unit: string | null;
    measurement_type_id: { name: string | null } | null;
};
type ShippingRow = {
    id: string;
    weight: number | null;
    height: number | null;
    width: number | null;
    length: number | null;
    dimension_unit: "Inch" | "Centimeter" | null;
};
type ShippingFeeRow = {
    method_type: string | null;
    zone_type: string | null;
    fee: number | null;
    available: boolean | null;
};
type CareRow = {
    washing_instruction: string | null;
    drying_instruction: string | null;
    bleaching_instruction: string | null;
    ironing_instruction: string | null;
    dry_cleaning_instruction: string | null;
    special_cases: string | null;
};
type ProductReturnPolicyRow = {
    use_global_policy: boolean | null;
    policy: {
        returnInstruction?: string;
    } | null;
    return_window_days: number | null;
    refund_processing_time_days: number | null;
    restocking_fee_type: "fixed" | "percentage" | null;
    restocking_fee_value: number | null;
    refund_methods: Record<string, boolean> | null;
    return_shipping_responsibility: Record<string, boolean> | null;
    condition_requirements: {
        unwornAndUnwashed?: boolean;
        originalPackagingAndTagsIntact?: boolean;
        notADiscountedItem?: boolean;
        notCustomMade?: boolean;
        damagedItem?: {
            allowed?: boolean;
            imagesRequired?: boolean;
        };
        finalSaleItemsNotAllowed?: boolean;
        otherConditions?: boolean;
    } | null;
    is_returnable: boolean | null;
};

export async function loadProductEditorData(
    supabase: any,
    brandId: string,
    productId: string
): Promise<ProductEditorInitialData> {
    const { data: productData, error: productError } = await supabase
        .from("products_list")
        .select(`
            id,
            name,
            product_description,
            category_id(name),
            subcategory_id(name),
            gender_id(name),
            season_id(name)
        `)
        .eq("id", productId)
        .eq("brand_id", brandId)
        .single();

    if (productError || !productData) {
        throw new Error(productError?.message || "Product not found");
    }

    const [
        { data: tagData, error: tagError },
        { data: variantData, error: variantError },
        { data: shippingData, error: shippingError },
        { data: careData, error: careError },
        { data: returnPolicyData, error: returnPolicyError },
    ] = await Promise.all([
        supabase.from("product_tags").select("tag_id(name)").eq("product_id", productId),
        supabase
            .from("product_variants")
            .select(`
                id,
                draft_variant_id,
                name,
                sku,
                price,
                product_code,
                status,
                slug,
                available_date,
                fabric_pattern,
                color_description,
                images_description
            `)
            .eq("main_product_id", productId)
            .order("display_order", { ascending: true }),
        supabase
            .from("product_shipping_details")
            .select("id, weight, height, width, length, dimension_unit")
            .eq("product_id", productId)
            .maybeSingle(),
        supabase
            .from("product_care_instructions")
            .select("washing_instruction, drying_instruction, bleaching_instruction, ironing_instruction, dry_cleaning_instruction, special_cases")
            .eq("product_id", productId)
            .maybeSingle(),
        supabase
            .from("product_return_policy")
            .select("use_global_policy, policy, return_window_days, refund_processing_time_days, restocking_fee_type, restocking_fee_value, refund_methods, return_shipping_responsibility, condition_requirements, is_returnable")
            .eq("product_id", productId)
            .eq("is_active", true)
            .order("version", { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    if (tagError) throw new Error(tagError.message);
    if (variantError) throw new Error(variantError.message);
    if (shippingError) throw new Error(shippingError.message);
    if (careError) throw new Error(careError.message);
    if (returnPolicyError) throw new Error(returnPolicyError.message);

    const variants = (variantData || []) as VariantRow[];
    const variantIds = variants.map((variant) => variant.id);

    const [
        { data: colorData, error: colorError },
        { data: materialData, error: materialError },
        { data: variantTagData, error: variantTagError },
        { data: imageData, error: imageError },
        { data: sizeData, error: sizeError },
        { data: shippingFeeData, error: shippingFeeError },
    ] = await Promise.all([
        variantIds.length > 0
            ? supabase.from("product_variant_colors").select("product_variant_id, color_id(name, hex_code)").in("product_variant_id", variantIds)
            : Promise.resolve({ data: [], error: null }),
        variantIds.length > 0
            ? supabase.from("product_variant_materials").select("product_variant_id, material_id(name), percentage").in("product_variant_id", variantIds)
            : Promise.resolve({ data: [], error: null }),
        variantIds.length > 0
            ? supabase.from("product_variant_tags").select("product_variant_id, tag_id(name)").in("product_variant_id", variantIds)
            : Promise.resolve({ data: [], error: null }),
        variantIds.length > 0
            ? supabase.from("product_images").select("product_variant_id, image_url, is_main").in("product_variant_id", variantIds)
            : Promise.resolve({ data: [], error: null }),
        variantIds.length > 0
            ? supabase.from("product_sizes").select("id, product_id, quantity, size_id(name)").in("product_id", variantIds)
            : Promise.resolve({ data: [], error: null }),
        shippingData?.id
            ? supabase.from("product_shipping_fees").select("method_type, zone_type, fee, available").eq("product_shipping_id", shippingData.id)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (colorError) throw new Error(colorError.message);
    if (materialError) throw new Error(materialError.message);
    if (variantTagError) throw new Error(variantTagError.message);
    if (imageError) throw new Error(imageError.message);
    if (sizeError) throw new Error(sizeError.message);
    if (shippingFeeError) throw new Error(shippingFeeError.message);

    const sizes = (sizeData || []) as ProductSizeRow[];
    const sizeIds = sizes.map((size) => size.id);
    const { data: measurementData, error: measurementError } = sizeIds.length > 0
        ? await supabase
            .from("product_measurements")
            .select("product_size_id, value, measurement_unit, measurement_type_id(name)")
            .in("product_size_id", sizeIds)
        : { data: [], error: null };

    if (measurementError) {
        throw new Error(measurementError.message);
    }

    const tags = ((tagData || []) as TagRow[])
        .map((tag) => tag.tag_id?.name || "")
        .filter(Boolean);

    const colorsByVariant = new Map<string, VariantDetailsSchemaType["colors"]>();
    for (const row of (colorData || []) as VariantColorRow[]) {
        if (!row.product_variant_id) continue;
        const current = colorsByVariant.get(row.product_variant_id) || [];
        current.push({
            name: row.color_id?.name || "",
            hexCode: row.color_id?.hex_code || "#000000",
        });
        colorsByVariant.set(row.product_variant_id, current);
    }

    const materialsByVariant = new Map<string, VariantDetailsSchemaType["materialComposition"]>();
    for (const row of (materialData || []) as VariantMaterialRow[]) {
        if (!row.product_variant_id) continue;
        const current = materialsByVariant.get(row.product_variant_id) || [];
        current.push({
            name: row.material_id?.name || "",
            percentage: row.percentage || 0,
        });
        materialsByVariant.set(row.product_variant_id, current);
    }

    const variantTagsByVariant = new Map<string, string[]>();
    for (const row of (variantTagData || []) as VariantTagRow[]) {
        if (!row.product_variant_id || !row.tag_id?.name) continue;
        const current = variantTagsByVariant.get(row.product_variant_id) || [];
        current.push(row.tag_id.name);
        variantTagsByVariant.set(row.product_variant_id, current);
    }

    const imagesByVariant = new Map<string, string[]>();
    for (const row of ((imageData || []) as VariantImageRow[]).sort((a, b) => Number(b.is_main) - Number(a.is_main))) {
        const current = imagesByVariant.get(row.product_variant_id) || [];
        if (row.image_url) current.push(row.image_url);
        imagesByVariant.set(row.product_variant_id, current);
    }

    const measurementsBySize = new Map<string, ProductMeasurementRow[]>();
    for (const row of (measurementData || []) as ProductMeasurementRow[]) {
        if (!row.product_size_id) continue;
        const current = measurementsBySize.get(row.product_size_id) || [];
        current.push(row);
        measurementsBySize.set(row.product_size_id, current);
    }

    const sizeMapByVariant = new Map<string, Record<string, Record<string, number>>>();
    for (const size of sizes) {
        const sizeName = size.size_id?.name;
        if (!sizeName) continue;
        const current = sizeMapByVariant.get(size.product_id) || {};
        const sizeMeasurements: Record<string, number> = {
            quantity: size.quantity || 0,
        };

        for (const measurement of measurementsBySize.get(size.id) || []) {
            const measurementName = measurement.measurement_type_id?.name;
            const numericValue = Number(measurement.value);
            if (measurementName && Number.isFinite(numericValue)) {
                sizeMeasurements[measurementName] = numericValue;
            }
        }

        current[sizeName] = sizeMeasurements;
        sizeMapByVariant.set(size.product_id, current);
    }

    const shippingMethods: ShippingDetailsSchemaType["methods"] = {};
    for (const row of (shippingFeeData || []) as ShippingFeeRow[]) {
        if (!row.method_type || !row.available) continue;

        if (row.method_type === "same_day") {
            shippingMethods.sameDay = {
                available: true,
                fee: row.fee || 0,
            };
            continue;
        }

        const normalizedMethod = row.method_type === "same_day" ? "sameDay" : row.method_type;
        if (normalizedMethod !== "standard" && normalizedMethod !== "express") {
            continue;
        }

        const zoneType = row.zone_type || "domestic";
        shippingMethods[normalizedMethod] = {
            ...(shippingMethods[normalizedMethod] || {}),
            [zoneType]: {
                available: Boolean(row.available),
                fee: row.fee || 0,
            },
        };
    }

    const product = productData as ProductLookupRow;
    const mappedVariants: VariantDetailsSchemaType[] = variants.map((variant) => {
        const tagNames = variantTagsByVariant.get(variant.id) || [];
        const imageList = imagesByVariant.get(variant.id) || [];

        return {
            id: variant.draft_variant_id || variant.id,
            variantName: variant.name || "",
            price: variant.price || 0,
            sku: variant.sku || "",
            productCode: variant.product_code || "",
            images: imageList.length > 0 ? imageList : ["", "", "", ""],
            imagesDescription: variant.images_description || "",
            colors: colorsByVariant.get(variant.id) || [{ name: "", hexCode: "#000000" }],
            colorDescription: variant.color_description || "",
            pattern: variant.fabric_pattern || "",
            materialComposition: materialsByVariant.get(variant.id) || [{ name: "", percentage: 0 }],
            measurementUnit: "Inch",
            measurements: sizeMapByVariant.get(variant.id) || {},
            availableDate: variant.available_date || "",
            slug: variant.slug || "",
            status: variant.status || "active",
            marketingAndExclusivityTags: tagNames.filter((tag) => MarketingAndExclusivityTags.includes(tag)),
            sustainabilityTags: tagNames.filter((tag) => SustainabilityTags.includes(tag)),
            craftmanshipTags: tagNames.filter((tag) => CraftmanshipTags.includes(tag)),
            categoryName: product.category_id?.name || "",
        };
    });

    const activeReturnPolicy = returnPolicyData as ProductReturnPolicyRow | null;

    return {
        productId,
        generalDetails: {
            productName: product.name || "",
            productDescription: product.product_description || "",
            category: product.category_id?.name || "",
            subCategory: product.subcategory_id?.name || "",
            tags,
            gender: (product.gender_id?.name as GeneralDetailsSchemaType["gender"]) || "Unisex",
            season: product.season_id?.name || "",
        },
        variantDetails: mappedVariants.length > 0 ? mappedVariants : [],
        shippingDetails: {
            productId,
            weight: shippingData?.weight || 0,
            dimensions: {
                length: shippingData?.length || 0,
                width: shippingData?.width || 0,
                height: shippingData?.height || 0,
            },
            measurementUnit: shippingData?.dimension_unit || "Inch",
            methods: shippingMethods,
        },
        careDetails: {
            productId,
            washingInstruction: careData?.washing_instruction || null,
            dryingInstruction: careData?.drying_instruction || null,
            bleachingInstruction: careData?.bleaching_instruction || null,
            ironingInstruction: careData?.ironing_instruction || null,
            dryCleaningInstruction: careData?.dry_cleaning_instruction || null,
            specialCases: careData?.special_cases || null,
        },
        returnPolicy: {
            productId,
            isReturnable: activeReturnPolicy?.is_returnable === false ? "non-returnable" : "returnable",
            useProductSpecificReturnPolicy: !(activeReturnPolicy?.use_global_policy ?? true),
            returnWindowDays: activeReturnPolicy?.return_window_days || 7,
            conditionRequirements: {
                unwornAndUnwashed: activeReturnPolicy?.condition_requirements?.unwornAndUnwashed ?? false,
                originalPackagingAndTagsIntact: activeReturnPolicy?.condition_requirements?.originalPackagingAndTagsIntact ?? false,
                notADiscountedItem: activeReturnPolicy?.condition_requirements?.notADiscountedItem ?? false,
                notCustomMade: activeReturnPolicy?.condition_requirements?.notCustomMade ?? false,
                damagedItem: {
                    allowed: activeReturnPolicy?.condition_requirements?.damagedItem?.allowed ?? false,
                    imagesRequired: activeReturnPolicy?.condition_requirements?.damagedItem?.imagesRequired ?? false,
                },
                finalSaleItemsNotAllowed: activeReturnPolicy?.condition_requirements?.finalSaleItemsNotAllowed ?? false,
                otherConditions: activeReturnPolicy?.condition_requirements?.otherConditions ?? false,
            },
            returnShippingResponsibility: {
                brandPays: activeReturnPolicy?.return_shipping_responsibility?.brandPays ?? false,
                customerPays: activeReturnPolicy?.return_shipping_responsibility?.customerPays ?? false,
                dependsOnReason: activeReturnPolicy?.return_shipping_responsibility?.dependsOnReason ?? false,
            },
            refundMethods: {
                fullRefund: activeReturnPolicy?.refund_methods?.fullRefund ?? false,
                storeCredit: activeReturnPolicy?.refund_methods?.storeCredit ?? false,
                exchange: activeReturnPolicy?.refund_methods?.exchange ?? false,
                replace: activeReturnPolicy?.refund_methods?.replace ?? false,
            },
            refundProcessingTimeDays: activeReturnPolicy?.refund_processing_time_days || 1,
            restockingFee: {
                type: activeReturnPolicy?.restocking_fee_type || "percentage",
                value: activeReturnPolicy?.restocking_fee_value || 0,
            },
            returnInstruction: activeReturnPolicy?.policy?.returnInstruction || "",
        },
        savedSteps: {
            general: true,
            variants: mappedVariants.length > 0,
            shipping: Boolean(shippingData),
            care: Boolean(careData),
            returnPolicy: Boolean(activeReturnPolicy),
        },
    };
}
