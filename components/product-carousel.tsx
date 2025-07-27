import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { ProductCard } from "./product-card";

type Props = {
  title?: string;
};

export const ProductCarousel = (props: Props) => {
  return (
    <section className="overflow-hidden py-8">
      <div className="container flex flex-col gap-8">
        <h2 className="font-bold text-3xl">{props.title}</h2>

        <Carousel>
          <CarouselContent>
            
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};
