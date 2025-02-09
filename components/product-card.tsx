import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export const ProductCard = (props: Props) => {
  return (
    <Card className={cn(props.className)}>
      <CardHeader
        className={cn("h-[400px] bg-muted border-b", props.headerClassName)}
      > 
        {/* Image */}
      </CardHeader>
      <CardContent className={cn("pt-4 space-y-2", props.contentClassName)}>
        <CardTitle className="truncate">Product Title</CardTitle>
        <CardDescription>20.00$</CardDescription>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2 underline text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <span>Corteiz</span>
        </div>
      </CardFooter>
    </Card>
  );
};
