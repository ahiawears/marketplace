import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export const getUserDetails = async () => {

    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
        throw new Error(`${userError.message}`);    
    }

    if (!user.user) {
        redirect('/log-in')
    }
    let metaData = user.user.user_metadata;
    if (!metaData) {
        redirect('/log-in');
    }
    const metaDataData = {
        firstName: metaData.firstName,
        lastName: metaData.lastName,
        email: metaData.email,
        email_verified: metaData.email_verified,
    }

    return metaDataData;
}