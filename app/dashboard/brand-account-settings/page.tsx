import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { BrandAccountSettings } from "@/components/brand-dashboard/brand-account-settings";

export const metadata: Metadata = {
  title: "Brand Account Settings",
};

export default async function BrandAccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login-brand");
  }

  return (
    <div className="p-4 md:p-6">
      <BrandAccountSettings userId={user.id} />
    </div>
  );
}
