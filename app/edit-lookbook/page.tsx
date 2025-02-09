"use client";

import { LookbookLayout1 } from "@/components/lookbook-layouts/lookbook-covers/layout1";
import { LookbookLayout2 } from "@/components/lookbook-layouts/lookbook-covers/layout2";
import { LookbookLayout3 } from "@/components/lookbook-layouts/lookbook-covers/layout3";
import { LookbookLayout4 } from "@/components/lookbook-layouts/lookbook-covers/layout4";
import BlurFade from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Building2, ImageIcon, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditLookbook() {
    const [step, setStep] = useState(1);
    const [selectedLayout, setSelectedLayout] = useState(1); // State to track selected layout
    const router = useRouter();

    const handleNext = async () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            try {
                
            } catch (error) {
                
            }
        }
    }
    const handleBack = () => {
		if (step > 1) setStep(step - 1);
	};
    const isStepValid = () => {
		switch (step) {
		case 1:
		case 2:
		default:
			return true;
		}
	};

     // Array of layout components
     const coverlayouts = [
        { id: 1, component: <LookbookLayout1 /> },
        { id: 2, component: <LookbookLayout2 /> },
        { id: 3, component: <LookbookLayout3 /> },
        { id: 4, component: <LookbookLayout4 /> },
    ];

    return (
        <div className="w-full min-h-screen flex flex-col my-5">
            <div className="h-fit w-full">
                {step === 1 && (
                    <BlurFade>
                        <div className="flex sm:flex-col md:flex-row lg:flex-row h-[150px] border-2 mx-2">
                            <div className="h-full md:basis-1/3 lg:basis-1/3 flex lg:items-center md:items-center sm:text-center w-full">
                                <p className="text-left text-md font-mabry-pro font-semibold tracking-tight">
                                    Select Collection Cover: 
                                </p>
                            </div>
                            <div className="flex flex-nowrap gap-4 p-4 overflow-x-auto">
                                {/* Map through cover layouts and render */}
                                {coverlayouts.map((layout) => (
                                    <div
                                        key={layout.id}
                                        className={`flex-shrink-0 cursor-pointer border-2 p-2 ${
                                            selectedLayout === layout.id
                                                ? "border-blue-500"
                                                : "border-gray-300"
                                        }`}
                                        onClick={() => setSelectedLayout(layout.id)}
                                    >
                                        <div className="w-24 h-24 flex items-center justify-center">
                                            {layout.component}
                                        </div>
                                    </div>
                                ))}
                            </div> 
                        </div>
                    </BlurFade>
                )}
            </div>
            <div className="mx-auto max-w-7xl flex-1 flex flex-col p-8">
                {/* render selected layout. Default layout should be LookbookLayout1 */}
                <div className="flex-1 flex items-center justify-center relative">
                    {coverlayouts.find((layout) => layout.id === selectedLayout)?.component}
                </div>
                <div className="flex justify-between pt-4 w-full h-fit">
                    <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                    </Button>
                    <Button onClick={handleNext} disabled={!isStepValid()}>
                        {step === 3 ? "Go to Dashboard" : "Next"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    )
}