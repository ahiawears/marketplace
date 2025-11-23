import { createCategory } from '@/actions/add-product/create-category';
import { createGender } from '@/actions/add-product/create-gender';
import { createProduct } from '@/actions/add-product/create-general-details';
import { createSeason } from '@/actions/add-product/create-season';
import { createSubCategory } from '@/actions/add-product/create-subCategory';
import { createTags } from '@/actions/add-product/create-tags';
import { GeneralDetailsSchemaType, GeneralDetailsValidationSchema } from '@/lib/validation-logics/add-product-validation/product-schema';
import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

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

/**
 * Checks the database for an existing slug and appends a counter if it exists to ensure uniqueness.
 * @param supabase - The Supabase client instance.
 * @param baseSlug - The base slug generated from the product name.
 * @returns A unique slug string.
 */
const generateUniqueSlug = async (supabase: any, baseSlug: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
        const { count, error } = await supabase
            .from('products_list')
            .select('id', { count: 'exact', head: true })
            .eq('seo_metadata->>slug', slug);

        if (error) {
            console.error('Error checking slug uniqueness:', error);
            return `${baseSlug}-${Date.now()}`;
        }

        if (count !== null && count > 0) {
            counter++;
            slug = `${baseSlug}-${counter}`;
        } else {
            isUnique = true;
        }
    }
    return slug;
};

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
        let generalDetails: GeneralDetailsSchemaType;
        try {
            generalDetails = JSON.parse(generalDetailsRaw);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 });
        }

        //Server side validation
        const validationResult = GeneralDetailsValidationSchema.safeParse(generalDetails);
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
        const uniqueSlug = await generateUniqueSlug(supabase, baseSlug);
        const metaTitle = `${validatedData.productName} | ${validatedData.category}`;
        const metaDescription = validatedData.productDescription.substring(0, 160);
        const keywords = Array.from(
            new Set([...(validatedData.tags || []), validatedData.category, validatedData.subCategory, validatedData.gender])
        );

        //insert to database
        const genderId = await createGender(validatedData.gender);
        const seasonId = validatedData.season ? await createSeason(validatedData.season) : null;
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