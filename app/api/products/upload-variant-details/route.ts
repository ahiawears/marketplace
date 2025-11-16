import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { VariantDetailsValidationSchema } from "@/lib/validation-logics/add-product-validation/product-schema";
import { VariantFormDetails } from "@/components/brand-dashboard/add-product/variants-details-form";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { GetExchangeRates } from "@/hooks/get-exchange-rate";
import { createVariant } from "@/actions/add-product/create-variant";
import { createImages } from "@/actions/add-product/create-images";
import { createVariantColors } from "@/actions/add-product/create-variant-colors";
import { createVariantMaterials } from "@/actions/add-product/create-variant-materials";
import { createVariantTags } from "@/actions/add-product/create-variant-tags";
import { createSizes } from "@/actions/add-product/create-sizes";


function getCurrencyByIso2(iso2Code: string | undefined, countryData: CountryDataType[]): string | null {
    if (!iso2Code) return null;
    const iso2Lower = iso2Code.toLowerCase();
    const country = countryData.find(
        (country) => country.iso2.toLowerCase() === iso2Lower
    );
    return country ? country.currency : null;
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
        }

        const formData = await req.formData();
        const variantDetailsRaw = formData.get('variantDetails') as string;
        const productId = formData.get('productId') as string;
        const categoryName = formData.get('categoryName') as string;
        const images = formData.getAll('images') as File[];

        if (!variantDetailsRaw || !productId || !categoryName) {
            return NextResponse.json({ success: false, message: "Missing required form data." }, { status: 400 });
        }

        let variantDetails: VariantFormDetails;
        try {
            variantDetails = JSON.parse(variantDetailsRaw);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid JSON format for variant details." }, { status: 400 });
        }

        // Server-side validation using the shared Zod schema
        const validationResult = VariantDetailsValidationSchema.safeParse({
            ...variantDetails,
            images: images.map(img => img.name),
            categoryName,
        });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { data: validatedData } = validationResult;

        // Fetch brand details to get the country and currency for single source of truth
        const brandData = await GetBrandLegalDetails(user.id);

        if (!brandData.success) {
            return NextResponse.json({
                success: false,
                message: brandData.message,
            })
        }
        let brandCountry;
        if (brandData.success && brandData.data !== null) {
            brandCountry = brandData.data.country_of_registration;
        }
        const brandCurrency = getCurrencyByIso2(brandCountry, CountryData);
        if (!brandCurrency) {
            return NextResponse.json({
                success: false,
                message: "Unable to determine brand currency from country.",
            }, { status: 400 });
        }

        const baseCurrency = 'USD';
        let exchangeRate = 1;
        const baseCurrencyRate = await GetExchangeRates(baseCurrency, brandCurrency);
        if (!baseCurrencyRate) {
            return NextResponse.json({
                success: false,
                message: `Unable to fetch exchange rate for ${brandCurrency}.`,
            }, { status: 400 });
        }   
        if (baseCurrency === brandCurrency) {
            exchangeRate = 1;
        } else {
            exchangeRate = baseCurrencyRate;
        }

        const baseCurrencyPrice = +(validatedData.price / exchangeRate).toFixed(2);
        if (isNaN(baseCurrencyPrice) || baseCurrencyPrice <= 0) {
            return NextResponse.json({
                success: false,
                message: "Calculated base currency price is invalid.",
            }, { status: 400 });
        }

        const dataToCreateVariant = {
            variantName: validatedData.variantName,
            sku: validatedData.sku,
            price: validatedData.price, 
            productCode: validatedData.productCode,
            slug: validatedData.slug,
            status: validatedData.status,   
            availableDate: validatedData.availableDate,
            pattern: validatedData.pattern || '',
            colorDescription: validatedData.colorDescription || '',
            imagesDescription: validatedData.imagesDescription || '',
        }

        const newVariantId = await createVariant(supabase, productId, baseCurrencyPrice, dataToCreateVariant);

        // --- Start Database Operations for Variant Sub-details ---

        // 1. Upload images
        if (images.length > 0) {
            const imageUploadPromises = images.map((image, index) => 
                createImages(supabase, newVariantId, image, index)
            );
            await Promise.all(imageUploadPromises);
        }

        // 2. Create and link colors
        await createVariantColors(supabase, newVariantId, validatedData.colors);

        // 3. Create and link materials
        await createVariantMaterials(supabase, newVariantId, validatedData.materialComposition);

        // 4. Create and link tags
        const tagsByType = {
            marketing: validatedData.marketingAndExclusivityTags,
            sustainability: validatedData.sustainabilityTags,
            craftsmanship: validatedData.craftmanshipTags,
        };
        await createVariantTags(supabase, newVariantId, tagsByType);

        // 5. Create and link sizes and measurements
        await createSizes(supabase, newVariantId, { measurements: validatedData.measurements }, validatedData.measurementUnit);

        return NextResponse.json({ 
            success: true, 
            message: "Variant saved successfully." 
        }, { status: 200 });

    } catch (error) {
        console.error("Error in POST /api/products/upload-variant-details:", error);
        return NextResponse.json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: 500 });
    }
}