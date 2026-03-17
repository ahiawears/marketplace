import { createClient } from "@/supabase/server";
import { LookbookEditorDetails } from "@/components/brand-dashboard/lookbook-client";

interface LookbookDetailsResult {
  success: boolean;
  message?: string;
  data: LookbookEditorDetails | null;
}

export async function getLookbookDetails(brandId: string, lookbookId: string): Promise<LookbookDetailsResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== brandId) {
    return { success: false, message: "User not authenticated.", data: null };
  }

  const { data: lookbook, error: lookbookError } = await supabase
    .from("brand_lookbooks")
    .select("id, title, description, is_published")
    .eq("id", lookbookId)
    .eq("brand_id", brandId)
    .maybeSingle();

  if (lookbookError || !lookbook) {
    return { success: false, message: lookbookError?.message || "Lookbook not found.", data: null };
  }

  const { data: pages, error: pagesError } = await supabase
    .from("brand_lookbook_pages")
    .select("id, image_url, storage_path, sort_order")
    .eq("lookbook_id", lookbookId)
    .order("sort_order", { ascending: true });

  if (pagesError) {
    return { success: false, message: pagesError.message, data: null };
  }

  const pageIds = (pages || []).map((page) => page.id);
  const { data: pageTags, error: pageTagsError } = pageIds.length > 0
    ? await supabase
        .from("brand_lookbook_product_tags")
        .select("id, lookbook_page_id, product_id, product_variant_id, label, x_position, y_position, width, height")
        .in("lookbook_page_id", pageIds)
    : { data: [], error: null };

  if (pageTagsError) {
    return { success: false, message: pageTagsError.message, data: null };
  }

  const tagsByPage = new Map<string, {
    id: string;
    productId: string;
    productVariantId?: string;
    label: string;
    x_position: number;
    y_position: number;
    width?: number | null;
    height?: number | null;
  }[]>();

  for (const tag of pageTags || []) {
    const current = tagsByPage.get(tag.lookbook_page_id) || [];
    current.push({
      id: tag.id,
      productId: tag.product_id,
      productVariantId: tag.product_variant_id || undefined,
      label: tag.label || "",
      x_position: typeof tag.x_position === "number" ? tag.x_position : 50,
      y_position: typeof tag.y_position === "number" ? tag.y_position : 50,
      width: tag.width,
      height: tag.height,
    });
    tagsByPage.set(tag.lookbook_page_id, current);
  }

  return {
    success: true,
    data: {
      id: lookbook.id,
      title: lookbook.title,
      description: lookbook.description || "",
      is_published: lookbook.is_published,
      images: (pages || []).map((page) => ({
        id: page.id,
        previewUrl: page.image_url,
        storagePath: page.storage_path,
        sort_order: page.sort_order,
        tags: tagsByPage.get(page.id) || [],
      })),
    },
  };
}
