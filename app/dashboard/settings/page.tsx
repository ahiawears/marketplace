"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface BrandDetails {
	brandName: string;
	brandEmail: string;
	brandMobileNumber: string;
}

const SettingsPage = () => {
    const [brandDetails, setBrandDetails] = useState<BrandDetails | null>(null);
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
	
		setBrandDetails((prevDetails) => {
			if (!prevDetails) {
				return { brandName: "", brandEmail: "", brandMobileNumber: "", [name]: value } as BrandDetails;
			}
	
			return {
				...prevDetails,
				[name]: value,
			};
		});
	};

	useEffect(() => {
		// Fetch brand details when userId is available
		const fetchBrandDetails = async () => {

			try {
				const response = await fetch(`/api/getBrandById`);
				if (!response.ok) {
					throw new Error("Failed to fetch Brand Details");
				}

				const data = await response.json();
				setBrandDetails({
					brandName: data.data.name,
					brandEmail: data.data.brands?.brand_email, // Ensure this matches backend structure
					brandMobileNumber: "", // Placeholder for now
				});
				console.log("Fetched Brand Details:", data);
			} catch (error) {
				console.error("Error fetching Brand Details:", error);
			}
		};

		fetchBrandDetails();
		console.log(brandDetails);
	}, []);

	return (
		<div>
            <div className="hidden lg:block">
                <div className="p-4"> 
					<BusinessProfileSection 
						brandDetails={brandDetails}
						handleInputChange={handleInputChange}

					/>
                </div>
            </div>
            <div className="lg:hidden sm:block">
					<BusinessProfileSection
						brandDetails={brandDetails}
						handleInputChange={handleInputChange}

					/>
            </div>
        </div>
	)
}


const BusinessProfileSection = ({brandDetails, handleInputChange,}: { brandDetails: BrandDetails | null; handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => {
	return(
		<div>
			<div className="container mx-auto bg-gray-100">
				
				<form className="space-y-6">
					<h2 className="text-xl font-bold pb-4 pt-8">Brand Details</h2>
					<div className="my-4">
						<label 
							htmlFor="brandName"
							className="block text-md/6 font-normal text-gray-900"
						>
							Brand Name:*
						</label>
						<div className="mt-2">
							<Input
								name="brandName"
								type="text"
								required
								value={brandDetails?.brandName || ""}
								disabled
								onChange={handleInputChange}
								className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-md/6"
							/>
						</div>
					</div>

					<div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
						<div className="sm:col-span-3">
							<label 
								htmlFor="brandName"
								className="block text-md/6 font-normal text-gray-900"
							>
								Brand Email:*
							</label>
							<div className="mt-2 mb-2">
								<Input
									name="brandEmail"
									type="email"
									required
									value={brandDetails?.brandEmail || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-md/6"
								/>
							</div>
						</div>

						<div className="sm:col-span-3">
							<label 
								htmlFor="brandMobile"
								className="block text-md/6 font-normal text-gray-900"
							>
								Brand Mobile Number:*
							</label>
							<div className="mt-2 mb-2">
								<Input
									name="brandMobile"
									type="text"//make type for mobile numbers
									required
									className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-md/6"
								>
								</Input>
							</div>
						</div>
					</div>
					<h2 className="text-xl font-bold pb-4 pt-8">Brand Address</h2>
					<h2 className="text-xl font-bold pb-4 pt-8">Brand Social Links</h2>
				</form>

			</div>
		</div>
	);
};

export default SettingsPage;
