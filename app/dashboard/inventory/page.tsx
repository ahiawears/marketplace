import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import InventoryClient from "@/components/brand-dashboard/inventory-client";
import { getBrandInventory } from "@/actions/get-brand-inventory";

export const metadata: Metadata = {
  title: "Inventory",
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login-brand");
  }

  const inventory = await getBrandInventory(user.id);

  return (
    <div className="p-4 md:p-6">
      <InventoryClient inventory={inventory} />
    </div>
  );
}
