import { createClient } from "@/supabase/server";

export async function UpdatePassword(formData: FormData){
    const supabase = await createClient();

    const data = {
        currentPassword: formData.get("currentPassword") as string,
        newPassword: formData.get("newPassword") as string,
    };

    const { error } = await supabase.auth.updateUser({password: 'newPassword'});
    
}