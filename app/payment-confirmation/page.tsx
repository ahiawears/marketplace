"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentConfirmationContent() {
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        async function verifyTransaction() {
            try {
                const responseParam = searchParams.get('response');
                let transactionId = searchParams.get('transactionId');
                let flw_ref: string | null = null;
                let tx_ref: string | null = null;

                if (responseParam) {
                    console.log('Encoded responseParam:', responseParam);

                    let decodedResponse;
                    try {
                        decodedResponse = JSON.parse(decodeURIComponent(responseParam));
                        console.log('Decoded response:', decodedResponse);
                    } catch (error) {
                        console.log('Decoding error:', error);
                        setStatus('invalid');
                        return;
                    }

                    flw_ref = decodedResponse.flwRef;
                    tx_ref = decodedResponse.txRef;
                    transactionId = String(decodedResponse.id ?? "");
                }

                console.log('Flutterwave reference (flw_ref):', flw_ref);
                console.log('Transaction reference (tx_ref):', tx_ref);
                console.log('Transaction reference (tx_ref):', transactionId);

                if (!transactionId) {
                    setStatus('invalid');
                    return;
                }

                const response = await fetch(
                    `/api/verify-transaction?transactionId=${transactionId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const data = await response.json();
                console.log(data);

                if (!response.ok) {
                    throw new Error(data.message || `Server error: ${response.status}`);
                }

                if (data.success) {
                    setOrderNumber(data.orderNumber || '');
                    setStatus('success');
                } else {
                    setStatus('failed');
                    setErrorMessage(data.message || data.error || 'Unknown error');
                }
            } catch (error) {
                console.log('Error in verifyTransaction:', error);
                setStatus('failed');
                setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
            }
        }

        verifyTransaction();
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            {status === 'loading' && <p>Verifying payment...</p>}
            {status === 'success' && (
                <div className="text-green-600">
                    <h1 className="text-2xl font-bold">Payment Successful!</h1>
                    <p>Your transaction has been completed successfully.</p>
                    {orderNumber ? <p>Your order number is {orderNumber}.</p> : null}
                </div>
            )}
            {status === 'failed' && (
                <div className="text-red-600">
                    <h1 className="text-2xl font-bold">Payment Failed</h1>
                    <p>Please try again.</p>
                    {errorMessage && <p>Error: {errorMessage}</p>}
                </div>
            )}
            {status === 'invalid' && (
                <div className="text-yellow-600">
                    <h1 className="text-2xl font-bold">Invalid Transaction Reference</h1>
                    <p>Please check your transaction details.</p>
                </div>
            )}
        </div>
    );
}

export default function PaymentConfirmation() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentConfirmationContent />
        </Suspense>
    );
}
