import { BrandCard } from "@/components/brand-card";
import { CategoryBento } from "@/components/landingcomps/category-bento-section";
import { TopBrandCTA } from "@/components/landingcomps/cta-section";
import { HeroSection } from "@/components/landingcomps/hero-section";
import { ProductCarousel } from "@/components/product-carousel";
import { ProductGrid } from "@/components/product-grid";

export default function Home() {
	return (  
		<div className="flex flex-1 flex-col">
			<HeroSection />

			<div className="my-5">
				<div className="my-5">
					<TopBrandCTA />
				</div>
				<div className="my-5">
					<CategoryBento />
				</div>
			</div>
		{/* <ProductCarousel title="Trending" /> */}
		{/* <ProductGrid title="New Arrivals" /> */}
		</div>
	);
}
