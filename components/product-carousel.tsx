import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { ProductCard } from "./product-card";

export const ProductCarousel = () => {
  return (
    <section className="overflow-hidden py-8">
      <div className="container flex flex-col gap-8">
        <h2 className="font-bold text-3xl">Trending 🔥</h2>

        <Carousel>
          <CarouselContent>
            <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[30%]">
              <ProductCard />
            </CarouselItem>
            <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[30%]">
              <ProductCard />
            </CarouselItem>
            <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[30%]">
              <ProductCard />
            </CarouselItem>
            <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[30%]">
              <ProductCard />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};
