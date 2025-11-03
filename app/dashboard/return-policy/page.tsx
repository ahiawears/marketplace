import ReturnPolicyForm from "@/components/brand-dashboard/return-policy-form";
import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Return Policy",
};

const ReturnPolicy = async () => {
    const supabase = await createClient();

    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user.user) {
        redirect("/login-brand");
    }  

    const userId = user.user.id;

    return (
        <div className="my-4">
            <ReturnPolicyForm 
                userId={userId} 
            />
        </div>
    )
}

export default ReturnPolicy;