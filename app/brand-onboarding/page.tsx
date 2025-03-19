"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";    
import {
	ArrowRight,
	ArrowLeft,
	Rocket,
	Image as ImageIcon,
	Building2,
	PhoneCall,
	Handshake,
	HandCoins,
} from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";
import { AddBrandDetails } from "@/actions/add-brand";
import BrandBasicInformationForm from "@/components/brand-onboarding/brand-information";
import { useAuth } from "@/hooks/useAuth";
import LoadContent from "../load-content/page";
import ModalBackdrop from "@/components/modals/modal-backdrop";
import ErrorModal from "@/components/modals/error-modal";
import { BrandOnboarding } from "@/lib/types";
import BrandContactForm from "@/components/brand-onboarding/brand-contact-form";
import BrandBusinessDetailsForm from "@/components/brand-onboarding/brand-business-details-form";
import BrandPaymentDetailsForm from "@/components/brand-onboarding/brand-payment-details-form";
import { redirect } from "next/navigation";

const BrandOnboardingPage = () => {
	
	const [step, setStep] = useState(1);
	const [isStep1Valid, setIsStep1Valid] = useState(false);
	const [isStep2Valid, setIsStep2Valid] = useState(false);
	const [isStep3Valid, setIsStep3Valid] = useState(false);
	const [isStep4Valid, setIsStep4Valid] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isCreatingSubaccount, setIsCreatingSubaccount] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");


	const [brandOnboardingData, setBrandOnboardingData] = useState<BrandOnboarding>({
		brandInformation: {
			brand_name: "",
			brand_description: "",
			brand_logo: "",
			brand_banner: ""
		},
		contactInformation: {
			business_email: "",
			phone_number: '',
			social_media: {
				website: '',
				facebook: '',
				instagram: '',
				twitter: '',
				tiktok: '',
			},
		},
		businessDetails: {
			country_of_registration: '',
			business_registration_name: '',
			business_registration_number: '',
		},
		paymentInformation: {
			account_bank: '',
			account_number: '',
			business_name: '',
			country: '',
			split_value: 0.05,
			business_mobile: '',
			business_email: '',
			business_contact: '',
			business_contact_mobile: '',
			split_type: "percentage",
			bank_name: '',
			subaccount_id: '',
		},
	});

	const { userId, userSession, loading, error, resetError } = useAuth();

	if (loading) {
        return <LoadContent />
    }

    if (error) {
        setErrorMessage(error.message || "Something went wrong, please try again.");
    }

    if (!userId) {
        redirect("/login-brand");
    }

	const handleNext = async () => {
		if (step < 4) {
			setIsSubmitting(true);
			try {
				setIsSaving(true);
				await saveStepData(step, brandOnboardingData);
				setIsSaving(false);
				setStep(step + 1);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSubmitting(false);
			}
		} else if (step === 4) {
			setIsSubmitting(true);
			try {
				setIsCreatingSubaccount(true);
				const subaccountData = await createSubaccount(userSession?.access_token);
				setIsCreatingSubaccount(false);
				setBrandOnboardingData((prevData) => ({
					...prevData,
					paymentInformation: {
						...prevData.paymentInformation,
						subaccount_id: subaccountData.data.subaccount_id, // Add the subaccount_id
					}
				}));
				setIsSaving(true);
				await saveStepData(step, {
					...brandOnboardingData,
					paymentInformation: {
						...brandOnboardingData.paymentInformation,
						subaccount_id: subaccountData.data.subaccount_id,
					}
				});
				setIsSaving(false);
				setStep(step + 1);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSubmitting(false);
			}
		} else {
			redirect("/dashboard");
		}
	};
	
	const handleError = (error: any) => {
		let stepError;
		if (error instanceof Error) {
			stepError = `Error: ${error.name}, ${error.cause}, ${error.message}`;
		}
		console.error(stepError);
		setErrorMessage(`${stepError}` || "Something went wrong, please try again.");
	};

	const handleBack = () => {
		if (step > 1) setStep(step - 1);
	};

	const handleChildData = (data: Partial<BrandOnboarding>, isValid: boolean) => {
		setBrandOnboardingData((prevData) => ({
			...prevData,
			...data,
		}));

		// Update validation state based on step
		if (step === 1) {
			setIsStep1Valid(isValid);
		} else if (step === 2) {
			setIsStep2Valid(isValid);
		} else if (step === 3) {
			setIsStep3Valid(isValid);
		} else if (step === 4) {
			setIsStep4Valid(isValid);
		}
		// Add other steps validation
	};

	

	const isStepValid = () => {
		switch (step) {
			case 1:
				return isStep1Valid;
			case 2:
				return isStep2Valid;
			case 3:
				return isStep3Valid;
			case 4:
				return isStep4Valid;
			default:
				return true;
		}
	};
	

	const saveStepData = async(step: number, data: BrandOnboarding) => {

		const accessToken = userSession?.access_token;
		const formData = new FormData();
        formData.append("step", String(step));
        formData.append("data", JSON.stringify(data));

		if (data.brandInformation.brand_logo) {
			const logoRes = await fetch(data.brandInformation.brand_logo);
			const logoBlob = await logoRes.blob();
			const logoFile = new File([logoBlob], "brand-logo.png", {type: logoBlob.type});
			formData.append("brand_logo", logoFile);
		}

		if(data.brandInformation.brand_banner) {
			const bannerRes = await fetch(data.brandInformation.brand_banner);
			const bannerBlob = await bannerRes.blob();
			const bannerFile = new File([bannerBlob], "brand-banner.png", {type: bannerBlob.type});
			formData.append("brand_banner", bannerFile);
		}

		const response = await fetch (`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/save-brand-onboarding-data`,
			{
				method: "POST",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
				},
				body: formData,
			}
		)
		if (!response.ok) {
			const errorData = await response.json();
			setErrorMessage(errorData.message || "Failed to save step data");
			throw new Error(errorData.message || "Failed to save step data");
        }
	}

	const createSubaccount = async (accessToken: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/create-brand-subaccount`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					account_bank: brandOnboardingData.paymentInformation.account_bank,
					account_number: brandOnboardingData.paymentInformation.account_number,
					business_name: brandOnboardingData.paymentInformation.business_name,
					country: brandOnboardingData.paymentInformation.country,
					split_value: brandOnboardingData.paymentInformation.split_value,
					business_mobile: brandOnboardingData.paymentInformation.business_mobile,
					business_email: brandOnboardingData.paymentInformation.business_email,
					business_contact: brandOnboardingData.paymentInformation.business_contact,
					business_contact_mobile: brandOnboardingData.paymentInformation.business_contact_mobile,
					split_type: brandOnboardingData.paymentInformation.split_type,
				}),
			})
			if (!response.ok) {
				const errorData = await response.json();
				setErrorMessage(errorData.message || "Failed to create subaccount");
				throw new Error(errorData.message || "Failed to create subaccount");
			}

			const responseData = await response.json();
			console.log("Response data from create subaccount: ", responseData); // Check the response
			return responseData;

		} catch (error) {
			console.error("Error creating subaccount:", error);
			if (error instanceof Error) {
				setErrorMessage(`${error.message} ${error.cause}` || "Something went wrong, please try again.");
			}
			throw error;
		}
	}

	return (
		<>
			{errorMessage && (
                <>
                    <ErrorModal
                        message={errorMessage}
                        onClose={() => {
                            setErrorMessage("");
                        }}
                    />
                </>
            )}
			<Card className="w-full h-fit border-2 p-8 flex flex-col">
				<CardHeader>
					<div className="flex justify-between mb-8">
						{[1, 2, 3, 4, 5].map((index) => (
							<div key={index} className="flex flex-col items-center w-1/3">
								<div
									className={`w-10 h-10 border-2 flex items-center justify-center mb-2 
										${
										step >= index
											? "border-primary bg-primary text-primary-foreground"
											: "border-muted-foreground text-muted-foreground"
										}`}
								>
									{index === 1 && <Building2 className="w-5 h-5" />}
									{index === 2 && <PhoneCall className="w-5 h-5" />}
									{index === 3 && <Handshake className="w-5 h-5" />}
									{index === 4 && <HandCoins className="w-5 h-5" />}
									{index === 5 && <Rocket className="w-5 h-5" />}
								</div> 
								<div
									className={`text-sm ${
									step >= index ? "text-primary" : "text-muted-foreground"
									}`}
								>
									{index === 1 && ""}
									{index === 2 && ""}
									{index === 3 && ""}
									{index === 4 && ""}
									{index === 5 && ""}
								</div>
							</div>
						))}
					</div>
				</CardHeader>

				<CardContent className="flex-1">
					{step === 1 && (
						<BlurFade>
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">
									Your Brand's Identity
								</h2>
								<p className="text-muted-foreground"> 
									Share your brand's name, logo, banner, and description.
								</p>

								<BrandBasicInformationForm data={brandOnboardingData.brandInformation} onDataChange={(data, isValid) => handleChildData({ brandInformation: data }, isValid)}/>
							</div>
						</BlurFade>
					)}

					{step === 2 && (
						<BlurFade>
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">
									How Can We Reach You?
								</h2>
								<p className="text-muted-foreground">
									Share your contact information so we can stay connected.
								</p>
								<BrandContactForm data={brandOnboardingData.contactInformation} onDataChange={(data, isValid) => handleChildData({ contactInformation: data }, isValid)} />
							</div>
						</BlurFade>
					)}

					{step === 3 && (
						<BlurFade>
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">Business Registration Details</h2>
								<p className="text-muted-foreground">
									Provide your business's registration details and country of incorporation.
								</p>
								<BrandBusinessDetailsForm data={brandOnboardingData.businessDetails} onDataChange={(data, isValid) => handleChildData({ businessDetails: data }, isValid)} />

							</div>
						</BlurFade>
					)}

					{step === 4 && (
						<BlurFade>
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">Set Up Your Payment Details</h2>
								<p className="text-muted-foreground">
									Provide your bank account details for seamless transactions.
								</p>
								<BrandPaymentDetailsForm 
									data={{
										...brandOnboardingData.paymentInformation,
										country: brandOnboardingData.businessDetails.country_of_registration,
										business_email: brandOnboardingData.contactInformation.business_email,
										business_mobile: brandOnboardingData.contactInformation.phone_number,
										business_name: brandOnboardingData.businessDetails.business_registration_name,
									}} 
									onDataChange={(data, isValid) => handleChildData({ paymentInformation: data }, isValid)} 
								/>
							</div>
						</BlurFade>
					)}

					{step === 5 && (
						<BlurFade>
							<div className="space-y-4 text-center">
								<div className="py-8">
									<Rocket className="w-16 h-16 mx-auto text-primary mb-4" />
									<h2 className="text-2xl font-bold tracking-tight">
										Welcome Aboard!
									</h2>
									<p className="text-muted-foreground mt-2">
										You've successfully completed the onboarding process. Proceed to your dashboard.

									</p>
								</div>
							</div>
						</BlurFade>
					)}
				</CardContent>

				<CardFooter>
					<div className="flex justify-between pt-4 w-full">
						<Button variant="outline" onClick={handleBack} disabled={step === 1}>
							<ArrowLeft className="w-4 h-4 mr-2" />
								Back
						</Button>
						<Button onClick={handleNext} disabled={!isStepValid() || isSubmitting || isSaving}>
							{isSubmitting ? "Saving..." : step === 5 ? "Go to Dashboard" : "Next"}
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					</div>
				</CardFooter>
			</Card>
		</>
		
	);
}

export default BrandOnboardingPage