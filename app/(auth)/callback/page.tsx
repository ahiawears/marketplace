// app/auth/callback/page.tsx
import { createClient } from '@/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({ 
    searchParams 
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const redirectTo = searchParams.redirect as string | undefined;
    const anonId = searchParams.anonId as string | undefined;
    const supabase = await createClient();
    
    // Check for user and handle authentication failure first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/log-in?error=authentication_failed');
    }

    try {
        // Upsert user data to prevent conflicts
        const { error: userInsertError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
            }, { onConflict: 'id' }); 

        if (userInsertError) {
            throw userInsertError;
        }

        // Migrate anonymous data if anonId exists
        if (anonId) {        
            // Call the database function to migrate the data
            const { error: migrationError } = await supabase.rpc('migrate_user_data', {
                anon_id: anonId,
                new_user_id: user.id
            });

            if (migrationError) {
                console.error("Migration error:", migrationError);
                throw migrationError;
            }
        }
    } catch (error) {
        return redirect('/log-in?error=auth_callback_failed');
    }
    const redirectUrl = new URL(
        redirectTo === 'checkout' ? '/place-order' : '/',
        new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    );

    // Call redirect after all logic has succeeded
    return redirect(redirectUrl.toString());
}