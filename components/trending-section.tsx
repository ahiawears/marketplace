import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export const TrendingSection = () => {
  return (
    <section className="container py-8 flex flex-col gap-8">
      <h2 className="font-bold text-3xl">Trending 🔥</h2>

      <Carousel>
        <CarouselContent>
          <CarouselItem className="basis-[90%] md:basis-1/2 lg:basis-1/3">
            <Card className="h-[500px]">
              <CardContent>Product card</CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <Card className="h-[500px]">
              <CardContent>Product card</CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <Card className="h-[500px]">
              <CardContent>Product card</CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
