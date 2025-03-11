import { createClient } from "@/supabase/client";
import { useEffect, useState } from "react";

interface AuthData {
    userId: string | null;
    userSession: any | null;
    loading: boolean;
    error: Error | null;
}

export const useAuth = (): AuthData => {
    const [userId, setUserId] = useState<string | null>(null);
    const [userSession, setUserSession] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async() => {
            try {
                const { data: { user }, error: userError } = await createClient().auth.getUser();

                if (userError) {
                    console.error("Error fetching user:", userError);
                    throw new Error(`Error fetching user: ${userError.message}, cause: ${userError.cause}`);
                } else if (!user) {
                    console.log("User not found");
                    setUserId(null); // Set userId to null if no user is found
                    setUserSession(null);
                } else {
                    setUserId(user.id);
                }

                const { data: { session }, error: sessionError } = await createClient().auth.getSession();
                if (sessionError) {
                    console.error("Error fetching session:", sessionError);
                    throw new Error(`Error fetching session: ${sessionError.message}, cause: ${sessionError.cause}`);
                }
                if (!session) {
                     console.log("No session found")
                     setUserSession(null);
                }
                setUserSession(session);
            } catch (err) {
                let errorMessage;
                if (err instanceof Error) {
                    errorMessage = err.message;
                    console.error('Function Error:', errorMessage); // Log the error
                } 
                setError(errorMessage ? new Error(errorMessage) : new Error('An unknown error occurred.'));
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return { userId, userSession, loading, error };
}