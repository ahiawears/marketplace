import React from 'react';

interface StepperProps {
    steps: string[];
    currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="flex items-center justify-between w-full mb-8">
            {steps.map((step, index) => (
                <div key={index} className="relative flex-1 flex flex-col items-center">
                
                {/* Step circle */}
                <div className="relative flex items-center justify-center w-full">
                    <div
                    className={`rounded-full h-10 w-10 flex items-center justify-center z-10
                        ${index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
                    >
                    {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                    <div
                        className={`absolute  top-1/2 transform translate-x-1/2 -translate-y-1/2 h-1 w-full z-0 bg-gray-300`}
                    >
                        <div
                            className={`h-full ${
                            index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        ></div>
                    </div>
                    )}
                </div>

                {/* Step label below the circle */}
                <div className="text-center mt-4 text-sm">
                    {step}
                </div>
                </div>
            ))}
        </div>
    );
};

export default Stepper;
