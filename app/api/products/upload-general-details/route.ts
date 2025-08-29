import { createCategory } from '@/actions/add-product/create-category';
import { createGender } from '@/actions/add-product/create-gender';
import { createProduct } from '@/actions/add-product/create-general-details';
import { createSeason } from '@/actions/add-product/create-season';
import { createSubCategory } from '@/actions/add-product/create-subCategory';
import { createTags } from '@/actions/add-product/create-tags';
import { MultiVariantGeneralDetailsInterface } from '@/components/brand-dashboard/add-product/general-details-form';
import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ValidateGeneralDetailsSchema = z.object({

    productName: z.string().trim().min(3, "Name too short").max(100, "Max 100 chars"),
    productDescription: z
        .string()
        .trim()
        .min(20, "Write at least 20 characters")
        .max(300, "Max 300 chars"),
    category: z.string().trim().min(1, "Category is required"),
    subCategory: z.string().trim().min(1, "Subcategory is required"),
    tags: z
        .array(z.string().trim())
        .min(1, "Pick at least 1 tag")
        .max(5, "You can select up to 5 tags"),
    gender: z.enum(["Male", "Female", "Unisex"], {
        required_error: "Gender is required",
    }),
    season: z.string().trim().min(1, "Season is required"),
})

const slugify = (input: string) => {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");    
}

export async function POST (req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
        }
        const formData = await req.formData();
        const generalDetailsRaw = formData.get('generalDetails') as string;

        if (!generalDetailsRaw) {
            return NextResponse.json({ success: false, message: "Missing generalDetails data" }, { status: 400 });
        }
        let generalDetails: MultiVariantGeneralDetailsInterface;
        try {
            generalDetails = JSON.parse(generalDetailsRaw);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 });
        }

        //Server side validation
        const validationResult = ValidateGeneralDetailsSchema.safeParse(generalDetails);
        if (!validationResult.success) {
            // If validation failed, return a 400 error with details
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        //Successful validation
        const validatedData = validationResult.data;

        // Generate SEO data
        const baseSlug = slugify(validatedData.productName);
        const uniqueSlug = `${baseSlug}-${Date.now()}`;
        const metaTitle = `${validatedData.productName} | ${validatedData.category}`;
        const metaDescription = validatedData.productDescription.substring(0, 160);
        const keywords = Array.from(
            new Set([...(validatedData.tags || []), validatedData.category, validatedData.subCategory, validatedData.gender])
        );

        //insert to database
        const genderId = await createGender(validatedData.gender);
        const seasonId = await createSeason(validatedData.season);
        const categoryId = await createCategory(validatedData.category);
        const subCategoryId = await createSubCategory(validatedData.subCategory, categoryId);

        //insert the main product record
        const productUploadId = await createProduct(
            categoryId,
            subCategoryId,
            generalDetails.productDescription,
            generalDetails.productName,
            genderId,
            seasonId,
            uniqueSlug,
            metaTitle,
            metaDescription,
            keywords
        )

        await createTags(validatedData.tags, productUploadId);

        return NextResponse.json({
            success: true,
            message: "Product created successfully",
            productUploadId,
            slug: uniqueSlug
        });
    } catch (error) {
        console.error("Error in POST /api/products/general:", error);
        return NextResponse.json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: 500 });
    }
}