"use client";

import { CardMetricsGrid } from "@/components/brand-dashboard/card-metrics-grid";
import { TopProductsCarousel } from "@/components/brand-dashboard/top-products-carousel";
import { AreaCharts } from "@/components/charts/area-charts";
import { PieCharts } from "@/components/charts/pie-charts";
import { useAuth } from "@/hooks/useAuth";
import LoadContent from "../load-content/page";
import { useState } from "react";
import { redirect } from "next/navigation";
import ErrorModal from "@/components/modals/error-modal";


const DashboardPage = () => {
	const [errorMessage, setErrorMessage] = useState("");

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
	return (
		<div>
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
			<div className="flex flex-1 flex-col">

				{/* Brand Metrics */}
				{/* This should have the total sales, orders,  */}
				<div className="my-5">
					<CardMetricsGrid />
				</div>

				<div className="my-5">
					<div className="mx-auto py-10 sm:py-10 shadow-2xl border-2">
						<div className=" mx-auto max-w-7xl px-6 lg:px-8">
							<div className="flex flex-col md:flex-row lg:flex-row sm:flex-col md:space-x-4 lg:space-x-4">
								<div className="lg:basis-1/2 md:basis-1/2 sm:basis-full sm:mx-auto lg:mx-auto md:mx-auto">
									<div className="mx-auto py-10 sm:py-10 shadow-2xl">
										<div className=" mx-auto max-w-7xl px-6 lg:px-8">
											<AreaCharts />
										</div>
									</div>
								</div>
								<div className="lg:basis-1/2 md:basis-1/2 sm:basis-full sm:mx-auto lg:mx-auto md:mx-auto">
									<div className="w-full mx-auto py-10 sm:py-10 shadow-2xl">
										<div className=" mx-auto max-w-7xl px-6 lg:px-8">
											<PieCharts />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				

				{/* Top Selling Products */}
				{/* This should show a card carousel of best products */}
				{/* <div className="my-5">
					<TopProductsCarousel title="Best Selling Products" />
				</div> */}
				
			</div>
		</div>
	);
};

export default DashboardPage;
