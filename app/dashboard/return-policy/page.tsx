import { getBrandGlobalReturnPolicy } from "@/actions/return-policy/get-brand-global-return-policy";
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

    const brandReturnPolicy = await getBrandGlobalReturnPolicy(userId);
    let brandReturnPolicyData;

    if (!brandReturnPolicy.success) {
        // Return a notFound or error page if the policy is not found or fails
        // You could also render a message on the page instead
        // return notFound();
        console.log(brandReturnPolicy.message);
    }

    brandReturnPolicyData = brandReturnPolicy.success ? brandReturnPolicy.data : null;

    return (
        <div className="my-4">
            <ReturnPolicyForm 
                userId={userId} 
                data={brandReturnPolicyData ?? null}
            />
        </div>
    )
}

export default ReturnPolicy;