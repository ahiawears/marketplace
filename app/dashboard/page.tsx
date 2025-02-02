"use client";

import { CardMetricsGrid } from "@/components/brand-dashboard/card-metrics-grid";
import { useEffect } from "react";

const DashboardPage = () => {
	useEffect(() => {

	})
	return (
		<div>
			<div className="flex flex-1 flex-col">
				{/* Brand Metrics */}
				{/* This should have the total sales, orders,  */}
				<CardMetricsGrid />

				{/* Top Selling Products */}
				{/*  */}
			</div>
		</div>
	);
};

export default DashboardPage;
