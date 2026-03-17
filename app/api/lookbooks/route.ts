import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { LookbookEditorDetails, LookbookSaveSummary } from "@/components/brand-dashboard/lookbook-client";

const LOOKBOOK_BUCKET = "lookbook-images";

interface LookbookTagInput {
  id?: string;
  productId?: string;
  productVariantId?: string;
  label?: string;
  x_position?: number;
  y_position?: number;
  width?: number | null;
  height?: number | null;
}

interface LookbookPageInput {
  id?: string;
  previewUrl?: string;
  storagePath?: string;
  sort_order?: number;
  tags?: LookbookTagInput[];
}

interface ExistingLookbookPageRow {
  id: string;
  storage_path: string;
}

type LookbookRequestBody = Omit<LookbookEditorDetails, "images"> & {
  id?: string;
  images?: LookbookPageInput[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "User not authenticated." }, { status: 401 });
    }

    const body = (await req.json()) as LookbookRequestBody;
    const lookbookId = typeof body.id === "string" ? body.id : null;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description : "";
    const isPublished = Boolean(body.is_published);
    const images = Array.isArray(body.images) ? body.images : [];

    if (!title) {
      return NextResponse.json({ success: false, message: "Lookbook title is required." }, { status: 400 });
    }

    if (images.length === 0) {
      return NextResponse.json({ success: false, message: "Add at least one lookbook page before saving." }, { status: 400 });
    }

    const normalizedImages = images.map((image, index) => ({
      id: typeof image.id === "string" ? image.id : null,
      image_url: typeof image.previewUrl === "string" ? image.previewUrl : "",
      storage_path: typeof image.storagePath === "string" ? image.storagePath : "",
      sort_order: typeof image.sort_order === "number" ? image.sort_order : index,
      tags: Array.isArray(image.tags)
        ? image.tags
            .map((tag) => ({
              product_id: typeof tag.productId === "string" ? tag.productId : "",
              product_variant_id:
                typeof tag.productVariantId === "string" && tag.productVariantId.trim() !== ""
                  ? tag.productVariantId
                  : null,
              label: typeof tag.label === "string" ? tag.label : "",
              x_position: typeof tag.x_position === "number" ? Math.max(0, Math.min(100, tag.x_position)) : 50,
              y_position: typeof tag.y_position === "number" ? Math.max(0, Math.min(100, tag.y_position)) : 50,
              width: typeof tag.width === "number" ? tag.width : null,
              height: typeof tag.height === "number" ? tag.height : null,
            }))
            .filter((tag) => tag.product_id)
        : [],
    }));

    if (normalizedImages.some((image) => !image.image_url || !image.storage_path)) {
      return NextResponse.json({ success: false, message: "Every lookbook page must be uploaded before saving." }, { status: 400 });
    }

    const baseSlug = slugify(title);
    const slug = lookbookId ? baseSlug : `${baseSlug}-${Date.now().toString().slice(-6)}`;

    let activeLookbookId = lookbookId;
    let lookbookCreatedAt = new Date().toISOString();
    const coverImageUrl = normalizedImages
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url || null;

    if (lookbookId) {
      const { data: existingLookbook, error: existingLookbookError } = await supabase
        .from("brand_lookbooks")
        .select("id, created_at")
        .eq("id", lookbookId)
        .eq("brand_id", user.id)
        .maybeSingle();

      if (existingLookbookError || !existingLookbook) {
        return NextResponse.json({ success: false, message: existingLookbookError?.message || "Lookbook not found." }, { status: 404 });
      }

      lookbookCreatedAt = existingLookbook.created_at;

      const { data: existingPages, error: existingPagesError } = await supabase
        .from("brand_lookbook_pages")
        .select("id, storage_path")
        .eq("lookbook_id", lookbookId);

      if (existingPagesError) {
        return NextResponse.json({ success: false, message: existingPagesError.message }, { status: 500 });
      }

      const incomingStoragePaths = new Set(normalizedImages.map((image) => image.storage_path));
      const typedExistingPages: ExistingLookbookPageRow[] = existingPages || [];
      const staleStoragePaths = typedExistingPages
        .map((page) => page.storage_path)
        .filter((path) => path && !incomingStoragePaths.has(path));

      if (staleStoragePaths.length > 0) {
        await supabase.storage.from(LOOKBOOK_BUCKET).remove(staleStoragePaths);
      }

      const { error: updateError } = await supabase
        .from("brand_lookbooks")
        .update({
          title,
          slug,
          description,
          status: isPublished ? "published" : "draft",
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
          cover_image_url: coverImageUrl,
        })
        .eq("id", lookbookId)
        .eq("brand_id", user.id);

      if (updateError) {
        return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
      }

      await supabase.from("brand_lookbook_product_tags").delete().in(
        "lookbook_page_id",
        typedExistingPages.map((page) => page.id)
      );
      await supabase.from("brand_lookbook_pages").delete().eq("lookbook_id", lookbookId);
    } else {
      const { data: createdLookbook, error: createError } = await supabase
        .from("brand_lookbooks")
        .insert({
          brand_id: user.id,
          title,
          slug,
          description,
          status: isPublished ? "published" : "draft",
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
          cover_image_url: coverImageUrl,
        })
        .select("id, created_at")
        .single();

      if (createError || !createdLookbook) {
        return NextResponse.json({ success: false, message: createError?.message || "Failed to create lookbook." }, { status: 500 });
      }

      activeLookbookId = createdLookbook.id;
      lookbookCreatedAt = createdLookbook.created_at;
    }

    if (!activeLookbookId) {
      return NextResponse.json({ success: false, message: "Failed to resolve lookbook id." }, { status: 500 });
    }

    const orderedImages = normalizedImages
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);

    const pagesToInsert = orderedImages.map((image, index) => ({
        lookbook_id: activeLookbookId,
        image_url: image.image_url,
        storage_path: image.storage_path,
        sort_order: index,
        is_cover: index === 0,
      }));

    const { data: insertedPages, error: insertPagesError } = await supabase
      .from("brand_lookbook_pages")
      .insert(pagesToInsert)
      .select("id, created_at");

    if (insertPagesError) {
      return NextResponse.json({ success: false, message: insertPagesError.message }, { status: 500 });
    }

    const coverPageId = insertedPages?.[0]?.id || null;
    if (coverPageId) {
      await supabase
        .from("brand_lookbooks")
        .update({ cover_page_id: coverPageId })
        .eq("id", activeLookbookId)
        .eq("brand_id", user.id);
    }

    const tagsToInsert = orderedImages.flatMap((image, index) => {
      const pageId = insertedPages?.[index]?.id;
      if (!pageId) return [];

      return image.tags.map((tag) => ({
        lookbook_page_id: pageId,
        product_id: tag.product_id,
        product_variant_id: tag.product_variant_id,
        label: tag.label,
        x_position: tag.x_position,
        y_position: tag.y_position,
        width: tag.width,
        height: tag.height,
      }));
    });

    if (tagsToInsert.length > 0) {
      const { error: insertTagsError } = await supabase
        .from("brand_lookbook_product_tags")
        .insert(tagsToInsert);

      if (insertTagsError) {
        return NextResponse.json({ success: false, message: insertTagsError.message }, { status: 500 });
      }
    }

    const lookbookSummary: LookbookSaveSummary = {
      id: activeLookbookId,
      title,
      is_published: isPublished,
      created_at: lookbookCreatedAt,
      cover_image_url: coverImageUrl || undefined,
      item_count: orderedImages.length,
    };

    return NextResponse.json({ success: true, id: activeLookbookId, lookbook: lookbookSummary }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/lookbooks:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred while saving the lookbook." }, { status: 500 });
  }
}
