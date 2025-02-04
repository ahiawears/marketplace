"use client";

import { CardMetricsGrid } from "@/components/brand-dashboard/card-metrics-grid";
import { TopProductsCarousel } from "@/components/brand-dashboard/top-products-carousel";
import { ProductCarousel } from "@/components/product-carousel";
import { useEffect } from "react";

const DashboardPage = () => {
	useEffect(() => {

	})
	return (
		<div>
			<div className="flex flex-1 flex-col">
				{/* Brand Metrics */}
				{/* This should have the total sales, orders,  */}
				<div className="my-5">
					<CardMetricsGrid />
				</div>
				

				{/* Top Selling Products */}
				{/* This should show a card carousel of best products */}
				<div className="my-5">
					<TopProductsCarousel title="Best Selling Products" />
				</div>

				
				
			</div>
		</div>
	);
};

export default DashboardPage;
