import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Props = {
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
};

export const LookbookCard = (props: Props) => {
    return (
        <Card className={(cn(props.className))}>
            <CardHeader className={cn("h-[500px] bg-muted border bg-center bg-cover relative bg-[url('/images/ahiaproto.avif')]", props.headerClassName)}>
                <div className="flex items-center m-auto justify-center w-full bg-gray-900 bg-opacity-20">
                    <p className="text-6xl text-white">
                        Brand Name Here
                    </p>
                </div>
            </CardHeader>
        </Card>
    )
}