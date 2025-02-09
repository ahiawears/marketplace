import { LookbookCard } from "./lookbook-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";


type Props = {
    title?: string;
};
  
export const LookbookCarousel = (props : Props) => {
    return (
        <div className="mx-auto py-10 sm:py-10 shadow-2xl">
            <div className="mx-auto px-6">
                <section className="overflow-hidden">
                    <div className="container flex flex-col gap-8">
                        <p className="text-start text-xl font-bold">
                            Lookbooks
                        </p>
                        <Carousel>
                            <CarouselContent>
                                <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[50%]">
                                    <LookbookCard />
                                </CarouselItem>
                                <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[50%]">
                                    <LookbookCard />
                                </CarouselItem>
                                <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[50%]">
                                    <LookbookCard />
                                </CarouselItem>
                                <CarouselItem className="basis-[90%] md:basis-[45%] lg:basis-[50%]">
                                    <LookbookCard />
                                </CarouselItem>
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </section>
            </div>
        </div>
    );
}