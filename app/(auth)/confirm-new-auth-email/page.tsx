'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const ConfirmAuthEmailPage = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        const initialize = async () => {
            try {
                // Process any verification token from the URL
                const token = searchParams.get('token');
                const type = searchParams.get('type');
                const email = searchParams.get('email');

                if (token && type === 'email_change' && email) {
                    const { error } = await supabase.auth.verifyOtp({
                        email,
                        token,
                        type: 'email_change'
                    });

                    if (error) {
                        toast.error('Invalid or expired verification link');
                    } else {
                        toast.success('Email verified successfully!');
                    }
                }

                // Get current user info
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

            } catch (error) {
                console.error('Initialization error:', error);
                toast.error('Failed to process verification');
            } finally {
                setLoading(false);
            }
        };

        initialize();

        // Listen for auth state changes to detect when both confirmations are done
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'USER_UPDATED' && session?.user) {
                    setUser(session.user);
                    if (session.user.new_email === null) {
                        toast.success('Email change completed successfully!');
                    }
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleCheckStatus = async () => {
        setLoading(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            
            if (currentUser?.new_email === null) {
                toast.success('Email change completed!');
            } else {
                toast.info('Still waiting for both confirmations...');
            }
        } catch (error) {
            toast.error('Failed to check status');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDashboard = () => {
        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800">Processing verification...</h2>
                </div>
            </div>
        );
    }

    // Determine status based on user.new_email
    const isComplete = user?.new_email === null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-8">
                
                <div className="text-center space-y-6">
                    {isComplete ? (
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    ) : (
                        <Mail className="h-16 w-16 text-blue-600 mx-auto" />
                    )}
                    
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            {isComplete ? 'Email Change Complete!' : 'Email Change in Progress'}
                        </h1>
                        
                        {isComplete ? (
                            <p className="text-gray-600">
                                Your email has been successfully updated to:
                            </p>
                        ) : (
                            <p className="text-gray-600">
                                We've sent verification links to both email addresses.
                            </p>
                        )}
                    </div>

                    {isComplete ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 font-semibold break-all">{user?.email}</p>
                            <p className="text-sm text-green-700 mt-2">
                                You can now use this email to sign in.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-700">Current email:</p>
                                    <p className="text-sm text-blue-600 break-all">{user?.email}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-700">New email:</p>
                                    <p className="text-sm text-blue-600 break-all">{user?.new_email}</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start space-x-2">
                                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-yellow-800">Action Required:</p>
                                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                            <li>• Check both email inboxes</li>
                                            <li>• Click the verification links in both emails</li>
                                            <li>• The change completes automatically when both are clicked</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-3">
                        {!isComplete && (
                            <Button 
                                onClick={handleCheckStatus} 
                                variant="default" 
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Check Verification Status
                            </Button>
                        )}
                        
                        <Button 
                            onClick={handleGoToDashboard} 
                            variant={isComplete ? "default" : "outline"}
                            className="w-full"
                        >
                            {isComplete ? 'Go to Dashboard' : 'Continue to Dashboard'}
                        </Button>
                    </div>

                    {!isComplete && (
                        <div className="text-xs text-gray-500">
                            <p>You can close this tab and return later to check status.</p>
                        </div>
                    )}
                </div>

                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs font-mono text-gray-600">
                            Status: {isComplete ? 'COMPLETE' : 'PENDING'}<br />
                            Current: {user?.email}<br />
                            New: {user?.new_email || 'null'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmAuthEmailPage;