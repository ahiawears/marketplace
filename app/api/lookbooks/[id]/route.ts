import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getLookbookDetails } from "@/actions/lookbooks/get-lookbook-details";

const LOOKBOOK_BUCKET = "lookbook-images";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ success: false, message: "User not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getLookbookDetails(user.id, id);
  return NextResponse.json(result, { status: result.success ? 200 : 404 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ success: false, message: "User not authenticated." }, { status: 401 });
    }

    const { id } = await params;
    const { data: lookbook, error: lookbookError } = await supabase
      .from("brand_lookbooks")
      .select("id")
      .eq("id", id)
      .eq("brand_id", user.id)
      .maybeSingle();

    if (lookbookError || !lookbook) {
      return NextResponse.json({ success: false, message: lookbookError?.message || "Lookbook not found." }, { status: 404 });
    }

    const { data: pages } = await supabase
      .from("brand_lookbook_pages")
      .select("id, storage_path")
      .eq("lookbook_id", id);

    const pageIds = (pages || []).map((page) => page.id);
    const storagePaths = (pages || []).map((page) => page.storage_path).filter(Boolean);

    if (pageIds.length > 0) {
      await supabase.from("brand_lookbook_product_tags").delete().in("lookbook_page_id", pageIds);
    }

    await supabase.from("brand_lookbook_pages").delete().eq("lookbook_id", id);
    await supabase.from("brand_lookbooks").delete().eq("id", id).eq("brand_id", user.id);

    if (storagePaths.length > 0) {
      await supabase.storage.from(LOOKBOOK_BUCKET).remove(storagePaths);
    }

    return NextResponse.json({ success: true, message: "Lookbook deleted successfully." });
  } catch (error) {
    console.error("Error deleting lookbook:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred while deleting the lookbook." }, { status: 500 });
  }
}
