import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { GetBrandProfile } from "@/actions/get-brand-details/get-brand-basic-info";
import BrandProfileClient from "@/components/brand-dashboard/brand-profile-client";

export const metadata: Metadata = {
    title: "Brand Profile Management",
}

const BrandProfileManagemennt = async () => {
    const supabase = await createClient();
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user.user) {
        redirect("/login-brand");
    }

    const userId = user?.user?.id;
    const brandProfileData = await GetBrandProfile(userId);

    if (!brandProfileData.success || brandProfileData.data === null) {
        redirect("/login-brand");
    }

    return (
        <BrandProfileClient userId={userId} brandData={brandProfileData.data} />
    );
}

export default BrandProfileManagemennt;
