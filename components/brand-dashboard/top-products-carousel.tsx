import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel";
import { ProductCard } from "../product-card";
  
type Props = {
    title?: string;
};

export const TopProductsCarousel = (props: Props) => {
    return (
        <div>
            <div className="mx-auto py-10 shadow-2xl">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="container flex flex-col gap-8">
                        <h2 className="font-bold text-3xl">{props.title}</h2>

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
                </div>
            </div>
        </div>
    );
}