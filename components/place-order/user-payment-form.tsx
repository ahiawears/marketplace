"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import OtpModal from "../modals/otp-modal";
import PinModal from "../modals/pin-modal";

interface PaymentFormProps {
    amount: number;
    formattedAmount: string;
    currencyCode: string;
    customerEmail: string;
    disabled?: boolean;
}

const PaymentForm = ({ amount, formattedAmount, currencyCode, customerEmail, disabled = false }: PaymentFormProps) => {
    const [cardholderName, setCardholderName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");
    const [cvv, setCvv] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pendingFlwRef, setPendingFlwRef] = useState("");
    const [pendingTransactionId, setPendingTransactionId] = useState<string | number | null>(null);
    const [pendingTxRef, setPendingTxRef] = useState("");

    const submitCharge = async (
        authorization?: { mode?: string; pin?: string },
        txRef?: string
    ) => {
        const normalizedCardNumber = cardNumber.replace(/\D/g, "");
        const normalizedExpiryMonth = expiryMonth.replace(/\D/g, "");
        const normalizedExpiryYear = expiryYear.replace(/\D/g, "");
        const normalizedCvv = cvv.replace(/\D/g, "");

        const response = await fetch("/api/process-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cardNumber: normalizedCardNumber,
                expiryMonth: normalizedExpiryMonth,
                expiryYear: normalizedExpiryYear,
                cvv: normalizedCvv,
                amount,
                currency: currencyCode,
                email: customerEmail,
                fullname: cardholderName.trim(),
                txRef,
                authorization,
            }),
        });

        return response.json();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setStatusMessage("");

        if (disabled) {
            setErrorMessage("Add a shipping address before paying.");
            return;
        }

        if (!cardholderName.trim()) {
            setErrorMessage("Enter the cardholder name.");
            return;
        }

        const normalizedCardNumber = cardNumber.replace(/\D/g, "");
        const normalizedExpiryMonth = expiryMonth.replace(/\D/g, "");
        const normalizedExpiryYear = expiryYear.replace(/\D/g, "");
        const normalizedCvv = cvv.replace(/\D/g, "");

        if (!/^\d{12,19}$/.test(normalizedCardNumber)) {
            setErrorMessage("Enter a valid card number.");
            return;
        }

        if (!/^\d{2}$/.test(normalizedExpiryMonth) || Number(normalizedExpiryMonth) < 1 || Number(normalizedExpiryMonth) > 12) {
            setErrorMessage("Enter a valid expiry month.");
            return;
        }

        if (!/^\d{2}$/.test(normalizedExpiryYear)) {
            setErrorMessage("Enter a valid expiry year.");
            return;
        }

        if (!/^\d{3,4}$/.test(normalizedCvv)) {
            setErrorMessage("Enter a valid CVV.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await submitCharge();

            if (data.status === "authorization_required" && data.authorizationMode === "pin") {
                setPendingTxRef(data.tx_ref || "");
                setPendingTransactionId(data.transactionId || null);
                setShowPinModal(true);
            } else if (data.status === "pending" && data.flw_ref) {
                setPendingFlwRef(data.flw_ref);
                setPendingTxRef(data.tx_ref || "");
                setPendingTransactionId(data.transactionId || null);
                setShowOtpModal(true);
            } else if (data.redirect_url) {
                setStatusMessage("Redirecting to complete payment...");
                window.location.href = data.redirect_url;
            } else if (data.status === "success") {
                setStatusMessage("Payment request submitted.");
            } else {
                setErrorMessage(data.error || data.message || "Payment failed.");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePinSubmit = async (pin: string) => {
        setShowPinModal(false);
        setIsSubmitting(true);
        setErrorMessage("");
        setStatusMessage("");

        try {
            const data = await submitCharge({ mode: "pin", pin }, pendingTxRef || undefined);

            if (data.status === "pending" && data.flw_ref) {
                setPendingFlwRef(data.flw_ref);
                setPendingTxRef(data.tx_ref || pendingTxRef);
                setPendingTransactionId(data.transactionId || null);
                setShowOtpModal(true);
                return;
            }

            if (data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            setErrorMessage(data.error || data.message || "Payment authorization failed.");
        } catch (error) {
            console.error(error);
            setErrorMessage("Unable to continue payment authorization.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (otp: string) => {
        setShowOtpModal(false);
        setIsSubmitting(true);
        setErrorMessage("");
        setStatusMessage("");

        try {
            const response = await fetch("/api/validate-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    flw_ref: pendingFlwRef,
                    otp,
                    transactionId: pendingTransactionId,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === "success" && data.transactionId) {
                window.location.href = `/payment-confirmation?transactionId=${encodeURIComponent(String(data.transactionId))}`;
                return;
            }

            setErrorMessage(data.message || "OTP validation failed.");
        } catch (error) {
            console.error(error);
            setErrorMessage("Unable to validate OTP.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {showPinModal && (
                <PinModal
                    onClose={() => setShowPinModal(false)}
                    onSubmit={handlePinSubmit}
                />
            )}
            {showOtpModal && (
                <OtpModal
                    onClose={() => setShowOtpModal(false)}
                    onSubmit={handleOtpSubmit}
                />
            )}
            <div className="rounded border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                Enter your card details to complete this checkout in {currencyCode}. Your card will be charged the locked amount shown below.
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <label htmlFor="cardholderName" className="block text-sm font-medium mb-1">
                        Cardholder Name
                    </label>
                    <Input
                        type="text"
                        id="cardholderName"
                        className="w-full px-3 py-2"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="Name on card"
                        disabled={disabled || isSubmitting}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                        Card Number
                    </label>
                    <Input
                        type="text"
                        id="cardNumber"
                        className="w-full px-3 py-2"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
                        placeholder="4242424242424242"
                        disabled={disabled || isSubmitting}
                        required
                    />
                </div>
                <div className="mb-4 flex gap-2">
                    <div>
                        <label htmlFor="expiryMonth" className="block text-sm font-medium mb-1">
                            Expiry Month
                        </label>
                        <Input
                            type="text"
                            id="expiryMonth"
                            className="w-full px-3 py-2"
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            placeholder="MM"
                            disabled={disabled || isSubmitting}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="expiryYear" className="block text-sm font-medium mb-1">
                            Expiry Year
                        </label>
                        <Input
                            type="text"
                            id="expiryYear"
                            className="w-full px-3 py-2"
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            placeholder="YY"
                            disabled={disabled || isSubmitting}
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                        CVV
                    </label>
                        <Input
                            type="text"
                            id="cvv"
                            className="w-full px-3 py-2"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="CVV"
                            disabled={disabled || isSubmitting}
                            required
                        />
                </div>
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">
                        Amount to be charged
                    </label>
                    <Input
                        type="text"
                        id="amount"
                        className="w-full px-3 py-2"
                        value={formattedAmount}
                        disabled
                    />
                </div>
                {errorMessage && (
                    <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}
                {statusMessage && (
                    <div className="rounded border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                        {statusMessage}
                    </div>
                )}
                <Button type="submit" className="w-full text-white py-2 px-4 rounded" disabled={disabled || isSubmitting}>
                    {isSubmitting ? "Processing..." : "Pay Now"}
                </Button>
            </form>
        </div>
    );
};

export default PaymentForm;
