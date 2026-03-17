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
      })),
    },
  };
}
