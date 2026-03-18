import { createClient } from "@/supabase/server";

export async function getStorefrontNavigation() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message || "Failed to load storefront categories.");
  }

  return (data || [])
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));
}
