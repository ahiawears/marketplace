"use client";

import { Input } from "@/components/ui/input";
import Stepper from "@/components/stepper";
import React, { useState } from 'react';

const AddCouponForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = ['Details', 'Amount', 'Validity', 'Summary'];

    // Define the content for each step
    const stepContent = [
        // Step 1: Coupon Details
        <div key="step1">
            
            <label htmlFor="couponCode" className="block text-sm font-bold text-gray-900">
            Coupon Code:*
            </label>
            <Input
            id="couponCode"
            name="couponCode"
            type="text"
            required
            autoComplete="product-name"
            className="mt-2 mb-4"
            />
            <label htmlFor="couponDescription" className="block text-sm font-bold text-gray-900">
            Description:*
            </label>
            <Input
            id="couponDescription"
            name="couponDescription"
            type="text"
            required
            autoComplete="description"
            className="mt-2"
            />
        </div>,

        // Step 2: Discount Amount
        <div key="step2">
            <h2 className="text-xl font-bold mb-4">Discount Amount</h2>
            <label htmlFor="discountAmount" className="block text-sm font-bold text-gray-900">
            Discount Amount:*
            </label>
            <Input
            id="discountAmount"
            name="discountAmount"
            type="number"
            required
            autoComplete="discount-amount"
            className="mt-2"
            />
        </div>,

        // Step 3: Validity Period
        <div key="step3">
            <h2 className="text-xl font-bold mb-4">Coupon Validity</h2>
            <label htmlFor="validityStart" className="block text-sm font-bold text-gray-900">
            Start Date:*
            </label>
            <Input
            id="validityStart"
            name="validityStart"
            type="date"
            required
            className="mt-2 mb-4"
            />
            <label htmlFor="validityEnd" className="block text-sm font-bold text-gray-900">
            End Date:*
            </label>
            <Input
            id="validityEnd"
            name="validityEnd"
            type="date"
            required
            className="mt-2"
            />
        </div>,

        // Step 4: Summary
        <div key="step4">
            <h2 className="text-xl font-bold mb-4">Coupon Summary</h2>
            <p>Review your coupon details and submit the form.</p>
            {/* Add summary content here */}
        </div>,
    ];

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    return (
        <div>
            <div className="flex flex-col items-center justify-center">
                {/* Stepper Component at the top */}
                <Stepper steps={steps} currentStep={currentStep} />

                {/* Section for step content */}
                <div className="w-full max-w-2xl bg-white p-6 shadow-md rounded-lg">
                    {stepContent[currentStep]}  {/* Display the content for the current step */}
                </div> 

                {/* Navigation buttons */}
                <div className="flex mt-4">
                    <button
                        onClick={handlePrevious}
                        className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
                        disabled={currentStep === 0}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                        disabled={currentStep === steps.length - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCouponForm;
