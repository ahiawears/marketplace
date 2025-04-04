import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";


const PaymentForm = () => {
    const [cardNumber, setCardNumber] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");
    const [cvv, setCvv] = useState("");
    const [amount, setAmount] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        try {
            const response = await fetch("/api/process-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cardNumber,
                    expiryMonth,
                    expiryYear,
                    cvv,
                    amount,
                }),
            });
    
            const data = await response.json();

            if (response.ok) {
                console.log(data.redirect_url);
                // Redirect to payment success page or show confirmation
                if (data.redirect_url) {
                    console.log("The redirect url: ", data.redirect_url)
                    window.location.href = data.redirect_url;
                } else if(data.flw_ref){
                    console.log("Payment processed through OTP!", data.flw_ref);
                } //else if(data.redirect_url>0 && data.flw_ref>0) {
                    //console.log("The redirect url: ", data.redirect_url, "Payment processed through OTP!", data.flw_ref)
                //}
            } else {
                alert(data.error || "Payment failed!");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
                <div className="mb-4">
                    <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                        Card Number
                    </label>
                    <Input
                        type="text"
                        id="cardNumber"
                        className="w-full border-gray-300 rounded px-3 py-2"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
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
                            className="w-full border-gray-300 rounded px-3 py-2"
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value)}
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
                            className="w-full border-gray-300 rounded px-3 py-2"
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value)}
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
                        className="w-full border-gray-300 rounded px-3 py-2"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">
                        Amount
                    </label>
                    <Input
                        type="number"
                        id="amount"
                        className="w-full border-gray-300 rounded px-3 py-2"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="text-white py-2 px-4 rounded">
                    Pay Now
                </Button>
            </form>


        </div>
    );
};

export default PaymentForm;
