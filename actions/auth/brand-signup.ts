"use server";


type SignupProps = {
    supabase: any,
    email: string, 
    password: string,
    redirectTo?: string,
}

export async function SignUpbrand({ supabase, email, password, redirectTo }: SignupProps) {

    const { data, error } = await supabase.auth.signUp ({
        email: email,
        password: password,
        options: {
            emailRedirectTo: redirectTo,
        },
    });

    if (error) {
        console.error('SignUp Error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: error.message,
                status: error.status || 400,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: error.status || 400,
            }
        );
    }
    // Return a Response object with the success data
    return new Response(
        JSON.stringify({
            success: true,
            data: {
                user: {
                    id: data.user?.id, // Include the user's ID in the response
                    email: data.user?.email,
                },
            },
        }),
        {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        }
    );
}