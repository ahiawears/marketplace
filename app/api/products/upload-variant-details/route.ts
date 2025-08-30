import { VariantFormDetails } from "@/components/brand-dashboard/add-product/variants-details-form";
import { validateVariantFormDetails } from "@/lib/productDataValidation";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { GetBrandLegalDetails } from "@/actions/get-brand-details/get-brand-legal-details";
import { GetExchangeRates } from "@/hooks/get-exchange-rate";
import { CountryData, CountryDataType } from "@/lib/country-data";
import { createVariant } from "@/actions/add-product/create-variant";
import { createVariantColors } from "@/actions/add-product/create-variant-colors";
import { createSizes } from "@/actions/add-product/create-sizes";
import { createVariantMaterials } from "@/actions/add-product/create-variant-materials";
import { createVariantTags } from "@/actions/add-product/create-variant-tags";
import { createImages } from "@/actions/add-product/create-images";

function getCurrencyByIso2(iso2Code: string, countryData: CountryDataType[]): string | null {
    const country = countryData.find(
        (country) => country.iso2.toLowerCase() === iso2Code.toLowerCase()
    );
    return country ? country.currency : null;
}

export async function POST (req: Request) {
    try{
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
        }
        const formData = await req.formData();
        // Safely get all file entries for the 'images' key.
        const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);
        const variantDetailsRaw = formData.get("variantDetails");
        const productId = formData.get("productId");
        const categoryName = formData.get("categoryName");
        if (!variantDetailsRaw || typeof variantDetailsRaw !== 'string') {
            return NextResponse.json({ success: false, message: "Variant details not provided" }, { status: 400 })
        }
        if (!productId || typeof productId !== 'string') {
            return NextResponse.json({ success: false, message: "Product ID not provided" }, { status: 400 });
        }
        if (!categoryName || typeof categoryName !== 'string') {
            return NextResponse.json({ success: false, message: "Category name not provided" }, { status: 400 });
        }

        let variantDetails: VariantFormDetails;
        try {
            variantDetails = JSON.parse(variantDetailsRaw);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid JSON format for variant details" }, { status: 400 });
        }

        // Reconstruct the full object for validation, adding image placeholders
        const fullVariantDetailsForValidation: VariantFormDetails = {
            ...variantDetails,
            images: imageFiles.map(file => file.name), // Use file names as placeholders for validation
        };

        // Server-side validation
        const { isValid, errors } = validateVariantFormDetails(fullVariantDetailsForValidation, categoryName);
        if (!isValid) {
            return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
        }

        // --- Data Processing & DB Insertion ---

        // 1. Calculate base currency price
        const brandData = await GetBrandLegalDetails(user.id);
        if (!brandData) {
            return NextResponse.json({ success: false, message: "Brand not found" }, { status: 404 });
        }
        const brandCountry = brandData.country_of_registration;
        const brandCurrency = getCurrencyByIso2(brandCountry!, CountryData);
        const baseCurrencyRate = await GetExchangeRates("USD", brandCurrency!);

        const baseCurrencyPrice = variantDetails.price / baseCurrencyRate;
        console.log("The base currency price is:", baseCurrencyPrice);
        // 2. Create the main variant record
        const newVariantId = await createVariant(
            supabase,
            productId,
            baseCurrencyPrice,
            fullVariantDetailsForValidation
        );

        if (!newVariantId) {
            throw new Error("Failed to create product variant.");
        }

        // 3. Handle relational data insertions
        await createVariantColors(supabase, newVariantId, fullVariantDetailsForValidation.colors);
        await createVariantMaterials(supabase, newVariantId, fullVariantDetailsForValidation.materialComposition);
        await createVariantTags(supabase, newVariantId, {
            marketing: fullVariantDetailsForValidation.marketingAndExclusivityTags,
            sustainability: fullVariantDetailsForValidation.sustainabilityTags,
            craftsmanship: fullVariantDetailsForValidation.craftmanshipTags,
        });

        if (fullVariantDetailsForValidation.measurements && Object.keys(fullVariantDetailsForValidation.measurements).length > 0) {
            await createSizes(supabase, newVariantId, { measurements: fullVariantDetailsForValidation.measurements }, fullVariantDetailsForValidation.measurementUnit);
        }

        await Promise.all(
            imageFiles.map((file, index) => createImages(supabase, newVariantId, file, index))
        );

        return NextResponse.json({
            success: true,
            message: "Variant saved successfully!",
            variantId: newVariantId
        });
    } catch (error) {
        console.error("Error in POST /api/products/upload-variant-details:", error);
        return NextResponse.json({
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error"
        }, { status: 500})
    }
}