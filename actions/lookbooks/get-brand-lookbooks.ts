import { createClient } from "@/supabase/server";

export interface BrandLookbookListItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  cover_image_url?: string;
  item_count: number;
}

export async function getBrandLookbooks(brandId: string): Promise<{
  success: boolean;
  data: BrandLookbookListItem[];
  message?: string;
}> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== brandId) {
      return { success: false, data: [], message: "User not authenticated." };
    }

    const { data: lookbooks, error } = await supabase
      .from("brand_lookbooks")
      .select("id, title, is_published, created_at, cover_image_url")
      .eq("brand_id", brandId)
      .neq("status", "archived")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], message: error.message };
    }

    const lookbookIds = (lookbooks || []).map((lookbook) => lookbook.id);
    let pages: { lookbook_id: string }[] = [];

    if (lookbookIds.length > 0) {
      const { data: pagesData, error: pagesError } = await supabase
        .from("brand_lookbook_pages")
        .select("lookbook_id")
        .in("lookbook_id", lookbookIds);

      if (pagesError) {
        return { success: false, data: [], message: pagesError.message };
      }

      pages = pagesData || [];
    }

    const pageCountMap = new Map<string, number>();
    for (const page of pages) {
      pageCountMap.set(page.lookbook_id, (pageCountMap.get(page.lookbook_id) || 0) + 1);
    }

    return {
      success: true,
      data: (lookbooks || []).map((lookbook) => ({
        id: lookbook.id,
        title: lookbook.title,
        is_published: lookbook.is_published,
        created_at: lookbook.created_at,
        cover_image_url: lookbook.cover_image_url || undefined,
        item_count: pageCountMap.get(lookbook.id) || 0,
      })),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Failed to fetch lookbooks.",
    };
  }
}
