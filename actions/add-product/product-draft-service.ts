import { z } from "zod";
import { createCategory } from "@/actions/add-product/create-category";
import { createGender } from "@/actions/add-product/create-gender";
import { createProduct } from "@/actions/add-product/create-general-details";
import { createSeason } from "@/actions/add-product/create-season";
import { createSubCategory } from "@/actions/add-product/create-subCategory";
import { createTags } from "@/actions/add-product/create-tags";
import { assertBrandOwnsProduct } from "@/actions/add-product/product-write-guards";
import { CountryData, CountryDataType } from "@/lib/country-data";
import {
    CareDetailsValidationSchema,
    GeneralDetailsValidationSchema,
    ShippingDetailsValidationSchema,
    validateReturnPolicy,
    VariantDetailsValidationSchema,
} from "@/lib/validation-logics/add-product-validation/product-schema";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { GetExchangeRates } from "@/hooks/get-exchange-rate";
import { createVariant } from "@/actions/add-product/create-variant";
import { createImages } from "@/actions/add-product/create-images";
import { createVariantColors } from "@/actions/add-product/create-variant-colors";
import { createVariantMaterials } from "@/actions/add-product/create-variant-materials";
import { createVariantTags } from "@/actions/add-product/create-variant-tags";
import { createSizes } from "@/actions/add-product/create-sizes";
import { createProductShippingDetails } from "@/actions/add-product/create-shipping-details";
import { createProductCareInstruction } from "@/actions/add-product/create-care-instruction";
import { createReturnPolicy } from "@/actions/add-product/create-return-policy";
import { resetVariantDetails } from "@/actions/add-product/reset-variant-details";

export class ProductDraftServiceError extends Error {
    status: number;
    errors?: unknown;

    constructor(message: string, status = 400, errors?: unknown) {
        super(message);
        this.name = "ProductDraftServiceError";
        this.status = status;
        this.errors = errors;
    }
}

const slugify = (input: string) => {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const generateUniqueSlug = async (supabase: any, baseSlug: string, currentProductId?: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const { data, error } = await supabase
            .from("products_list")
            .select("id, seo_metadata")
            .filter("seo_metadata->>slug", "eq", slug);

        if (error) {
            console.error("Error checking slug uniqueness:", error);
            return `${baseSlug}-${Date.now()}`;
        }

        const conflictingProduct = (data || []).find((row: { id: string }) => row.id !== currentProductId);
        if (!conflictingProduct) {
            return slug;
        }

        counter++;
        slug = `${baseSlug}-${counter}`;
    }
};

const generateUniqueVariantSlug = async (
    supabase: any,
    baseSlug: string,
    mainProductId: string,
    draftVariantId: string
): Promise<string> => {
    let slug = slugify(baseSlug);
    let counter = 1;

    if (!slug) {
        slug = `variant-${draftVariantId.toLowerCase()}`;
    }

    while (true) {
        const { data, error } = await supabase
            .from("product_variants")
            .select("main_product_id, draft_variant_id")
            .eq("slug", slug)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return slug;
        }

        if (data.main_product_id === mainProductId && data.draft_variant_id === draftVariantId) {
            return slug;
        }

        counter++;
        slug = `${slugify(baseSlug)}-${counter}`;
    }
};

function getCurrencyByIso2(iso2Code: string | undefined, countryData: CountryDataType[]): string | null {
    if (!iso2Code) return null;
    const iso2Lower = iso2Code.toLowerCase();
    const country = countryData.find(
        (countryItem) => countryItem.iso2.toLowerCase() === iso2Lower
    );
    return country ? country.currency : null;
}

function requireParsedData<T>(schemaResult: z.SafeParseReturnType<unknown, T>): T {
    if (!schemaResult.success) {
        throw new ProductDraftServiceError("Validation failed", 400, schemaResult.error.flatten());
    }

    return schemaResult.data;
}

export async function saveGeneralDetailsDraft(
    supabase: any,
    brandId: string,
    generalDetailsInput: unknown,
    currentProductId?: string
) {
    if (currentProductId) {
        await assertBrandOwnsProduct(supabase, brandId, currentProductId);
    }

    const validatedData = requireParsedData(
        GeneralDetailsValidationSchema.safeParse(generalDetailsInput)
    );

    const baseSlug = slugify(validatedData.productName);
    const uniqueSlug = await generateUniqueSlug(supabase, baseSlug, currentProductId);
    const metaTitle = `${validatedData.productName} | ${validatedData.category}`;
    const metaDescription = validatedData.productDescription.substring(0, 160);
    const keywords = Array.from(
        new Set([
            ...(validatedData.tags || []),
            validatedData.category,
            validatedData.subCategory,
            validatedData.gender,
        ])
    );

    const genderId = await createGender(validatedData.gender);
    const seasonId = validatedData.season ? await createSeason(validatedData.season) : null;
    const categoryId = await createCategory(validatedData.category);
    const subCategoryId = await createSubCategory(validatedData.subCategory, categoryId);

    const productUploadId = await createProduct(
        supabase,
        brandId,
        categoryId,
        subCategoryId,
        validatedData.productDescription,
        validatedData.productName,
        genderId,
        seasonId,
        uniqueSlug,
        metaTitle,
        metaDescription,
        keywords,
        currentProductId
    );

    await createTags(validatedData.tags, productUploadId, supabase);

    return {
        productUploadId,
        slug: uniqueSlug,
    };
}

export async function saveVariantDraft(
    supabase: any,
    brandId: string,
    input: {
        productId: string;
        categoryName: string;
        variantDetails: unknown;
        images: File[];
        displayOrder: number;
    }
) {
    await assertBrandOwnsProduct(supabase, brandId, input.productId);

    const incomingVariantDetails =
        input.variantDetails && typeof input.variantDetails === "object"
            ? input.variantDetails as Record<string, unknown>
            : {};

    const incomingImages = Array.isArray(incomingVariantDetails.images)
        ? incomingVariantDetails.images.filter((image): image is string => typeof image === "string" && image.trim() !== "")
        : [];

    const validatedData = requireParsedData(
        VariantDetailsValidationSchema.safeParse({
            ...incomingVariantDetails,
            images: incomingImages,
            categoryName: input.categoryName,
        })
    );

    const brandData = await GetBrandLegalDetails(brandId);
    if (!brandData.success || !brandData.data) {
        throw new ProductDraftServiceError(brandData.message || "Unable to load brand details.", 400);
    }

    const brandCurrency = getCurrencyByIso2(brandData.data.country_of_registration, CountryData);
    if (!brandCurrency) {
        throw new ProductDraftServiceError("Unable to determine brand currency from country.", 400);
    }

    const exchangeRate = brandCurrency === "USD"
        ? 1
        : await GetExchangeRates("USD", brandCurrency);

    if (!exchangeRate) {
        throw new ProductDraftServiceError(`Unable to fetch exchange rate for ${brandCurrency}.`, 400);
    }

    const baseCurrencyPrice = +(validatedData.price / exchangeRate).toFixed(2);
    if (isNaN(baseCurrencyPrice) || baseCurrencyPrice <= 0) {
        throw new ProductDraftServiceError("Calculated base currency price is invalid.", 400);
    }

    const baseVariantSlug = validatedData.slug
        || `${validatedData.variantName || "variant"} ${validatedData.colors[0]?.name || ""} ${validatedData.pattern || ""}`;
    const uniqueVariantSlug = await generateUniqueVariantSlug(
        supabase,
        baseVariantSlug,
        input.productId,
        validatedData.id
    );

    const newVariantId = await createVariant(supabase, input.productId, baseCurrencyPrice, {
        id: validatedData.id,
        variantName: validatedData.variantName,
        sku: validatedData.sku,
        price: validatedData.price,
        productCode: validatedData.productCode,
        slug: uniqueVariantSlug,
        status: validatedData.status,
        availableDate: validatedData.availableDate,
        pattern: validatedData.pattern || "",
        colorDescription: validatedData.colorDescription || "",
        imagesDescription: validatedData.imagesDescription || "",
    }, input.displayOrder);

    const preservedRemoteImages = validatedData.images.filter((image) => image.startsWith("http://") || image.startsWith("https://"));
    await resetVariantDetails(supabase, newVariantId, preservedRemoteImages);

    let nextUploadedImageIndex = 0;

    for (let index = 0; index < validatedData.images.length; index++) {
        const imageSource = validatedData.images[index];

        if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
            const { error: existingImageInsertError } = await supabase
                .from("product_images")
                .insert({
                    product_variant_id: newVariantId,
                    image_url: imageSource,
                    is_main: index === 0,
                });

            if (existingImageInsertError) {
                throw existingImageInsertError;
            }
            continue;
        }

        const nextFile = input.images[nextUploadedImageIndex];
        if (!nextFile) {
            continue;
        }

        await createImages(supabase, newVariantId, nextFile, index);
        nextUploadedImageIndex += 1;
    }

    await createVariantColors(supabase, newVariantId, validatedData.colors);
    await createVariantMaterials(supabase, newVariantId, validatedData.materialComposition);
    await createVariantTags(supabase, newVariantId, {
        marketing: validatedData.marketingAndExclusivityTags,
        sustainability: validatedData.sustainabilityTags,
        craftsmanship: validatedData.craftmanshipTags,
    });
    await createSizes(
        supabase,
        newVariantId,
        { measurements: validatedData.measurements },
        validatedData.measurementUnit
    );

    return {
        variantId: newVariantId,
        slug: uniqueVariantSlug,
    };
}

export async function saveShippingDraft(
    supabase: any,
    brandId: string,
    shippingDetailsInput: unknown
) {
    const validatedData = requireParsedData(
        ShippingDetailsValidationSchema.safeParse(shippingDetailsInput)
    );

    await assertBrandOwnsProduct(supabase, brandId, validatedData.productId);
    const shippingDetailsId = await createProductShippingDetails(supabase, validatedData);

    return {
        shippingDetailsId,
    };
}

export async function saveCareDraft(
    supabase: any,
    brandId: string,
    careDetailsInput: unknown
) {
    const validatedData = requireParsedData(
        CareDetailsValidationSchema.safeParse(careDetailsInput)
    );

    await assertBrandOwnsProduct(supabase, brandId, validatedData.productId);
    const careInstructionId = await createProductCareInstruction(supabase, validatedData);

    return {
        careInstructionId,
    };
}

export async function saveReturnPolicyDraft(
    supabase: any,
    brandId: string,
    returnPolicyInput: unknown
) {
    const validationResult = validateReturnPolicy(returnPolicyInput as any);
    if (!validationResult.success) {
        throw new ProductDraftServiceError("Validation failed", 400, validationResult.error.flatten());
    }

    await assertBrandOwnsProduct(supabase, brandId, validationResult.data.productId);
    const createdPolicy = await createReturnPolicy(supabase, validationResult.data);

    return {
        returnPolicy: createdPolicy,
    };
}

export async function publishProductDraft(
    supabase: any,
    brandId: string,
    input: {
        productId: string;
        publishMode: "now" | "later";
        releaseDate?: string;
        releaseDateIso?: string;
        releaseTimezone?: string;
    }
) {
    await assertBrandOwnsProduct(supabase, brandId, input.productId);

    const updatePayload: {
        is_published: boolean;
        release_date: string | null;
        release_timezone: string | null;
    } = {
        is_published: false,
        release_date: null,
        release_timezone: null,
    };

    if (input.publishMode === "now") {
        updatePayload.is_published = true;
        updatePayload.release_date = new Date().toISOString();
        updatePayload.release_timezone = input.releaseTimezone || "UTC";
    } else {
        if (!input.releaseDate || !input.releaseDateIso) {
            throw new ProductDraftServiceError("Please choose a release date for later publishing.", 400);
        }

        const scheduledRelease = new Date(input.releaseDateIso);
        if (Number.isNaN(scheduledRelease.getTime())) {
            throw new ProductDraftServiceError("The selected release date is invalid.", 400);
        }

        updatePayload.is_published = false;
        updatePayload.release_date = scheduledRelease.toISOString();
        updatePayload.release_timezone = input.releaseTimezone || "UTC";
    }

    const { error } = await supabase
        .from("products_list")
        .update(updatePayload)
        .eq("id", input.productId);

    if (error) {
        throw error;
    }

    return {
        productId: input.productId,
        ...updatePayload,
    };
}
