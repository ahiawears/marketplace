"use server";

import { createClient } from "@/supabase/server";

export async function addUserAddress(formData: FormData) {
    const supabase = await createClient();

    const userData = {
        countryName: formData.get("countryName") as string,
        countryCode: formData.get("countryCode") as string,
        mobile: formData.get("mobile") as string, 
        postCode: formData.get("postCode") as string,
        county: formData.get("county") as string,
        city: formData.get("city") as string,
        address: formData.get("address") as string,

    }

    console.log(userData);
}