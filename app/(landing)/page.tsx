import { ProductCarousel } from "@/components/product-carousel";
import { ProductGrid } from "@/components/product-grid";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <ProductCarousel title="Trending🔥" />
      <ProductGrid title="New Arrivals🎉" />
    </div>
  );
}
