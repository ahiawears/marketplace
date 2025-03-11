"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";    
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
	ArrowRight,
	ArrowLeft,
	Rocket,
	Image as ImageIcon,
	Building2,
} from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";
import { AddBrandDetails } from "@/actions/add-brand";
import BrandBasicInformationForm from "@/components/brand-onboarding/brand-information";

export default function BrandOnboardingPage() {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		brandName: "",
		description: "",
		logoUrl: "",
	});
  	const router = useRouter();

	const handleNext = async () => {
		if (step < 3) {
			setStep(step + 1);
		} else {
			try {
				// Convert formData to FormData object
				const form = new FormData();
				form.append("brandName", formData.brandName);
				form.append("description", formData.description);

				// Add logo file
				if (formData.logoUrl) {
					const response = await fetch(formData.logoUrl); // Fetch the image from the URL
					const blob = await response.blob(); // Convert it to a Blob
					const file = new File([blob], "brand-logo.png", { type: blob.type }); // Create a File object
					form.append("logoUrl", file);
				}

				// Call the backend function
				await AddBrandDetails(form);
				alert("Brand added successfully!");
				router.push("/dashboard");
			} catch (error) {
				alert("Error adding brand. Please try again.");
				console.error(error);
			}
		}
	}; 

	const handleBack = () => {
		if (step > 1) setStep(step - 1);
	};

	const isStepValid = () => {
		switch (step) {
		case 1:
			return formData.brandName.length > 0 && formData.description.length > 0;
		case 2:
			return formData.logoUrl.length > 0;
		default:
			return true;
		}
	};

	return (
		<Card className="w-full h-fit border-2 p-8 flex flex-col">
			<CardHeader>
				<div className="flex justify-between mb-8">
					{[1, 2, 3].map((index) => (
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
								{index === 2 && <ImageIcon className="w-5 h-5" />}
								{index === 3 && <Rocket className="w-5 h-5" />}
							</div> 
							<div
								className={`text-sm ${
								step >= index ? "text-primary" : "text-muted-foreground"
								}`}
							>
								{index === 1 && "Brand Info"}
								{index === 2 && "Logo"}
								{index === 3 && "Complete"}
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
								Brand Information
							</h2>
							<p className="text-muted-foreground"> 
								Let&apos;s start with your brand&apos;s basic information.
							</p>

							<BrandBasicInformationForm />
							{/* <div className="space-y-4">
								<div className="space-y-2">
									<label htmlFor="brandName" className="block text-sm font-bold text-gray-900">
										Enter Brand Name:*
									</label>
									<Input
										name="brandName"
										placeholder="Enter your brand name"
										value={formData.brandName}
										onChange={(e) =>
										setFormData({ ...formData, brandName: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="productName" className="block text-sm font-bold text-gray-900">
										Enter Brand Description:*
									</label>
									<Textarea
										name="description"
										placeholder="Describe your brand"
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										className="min-h-[100px]"
									/>
								</div>
							</div> */}
						</div>
					</BlurFade>
				)}

				{step === 2 && (
					<BlurFade>
						<div className="space-y-4">
							<h2 className="text-2xl font-bold tracking-tight">Brand Logo</h2>
							<p className="text-muted-foreground">
								Add your brand&apos;s logo URL to make it recognizable.
							</p>
							<div className="space-y-4">
								<Input
									name="logo"
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) {
											const reader = new FileReader();
											reader.onload = () => {
												setFormData({
													...formData,
													logoUrl: reader.result as string,
												});
											};
											reader.readAsDataURL(file);
										}
									}}
								/>
								{formData.logoUrl && (
									<div className="mt-4 flex justify-center">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={formData.logoUrl}
											alt="Brand Logo Preview"
											className="max-w-[200px] max-h-[200px] object-contain"
											onError={(e) => {
												(e.target as HTMLImageElement).style.display = "none";
											}}
										/>
									</div>
								)}
							</div>
						</div>
					</BlurFade>
				)}

				{step === 3 && (
					<BlurFade>
						<div className="space-y-4 text-center">
							<div className="py-8">
								<Rocket className="w-16 h-16 mx-auto text-primary mb-4" />
								<h2 className="text-2xl font-bold tracking-tight">
									Congratulations! 🎉
								</h2>
								<p className="text-muted-foreground mt-2">
									Your brand {formData.brandName} has been set up successfully.
									You&apos;re ready to go!
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
					<Button onClick={handleNext} disabled={!isStepValid()}>
						{step === 3 ? "Go to Dashboard" : "Next"}
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
				
			</CardFooter>
		</Card>
	);
}
