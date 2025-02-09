import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { Input } from "./ui/input";

type Props = {
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
};

export const LookbookCardItem = (props: Props) => {
    return (
        <Card className={(cn(props.className))}>
            <CardHeader className={cn("h-[500px] bg-muted border bg-center bg-cover relative bg-[url('/images/ahiaproto.avif')]", props.headerClassName)}>
                
                <div className="w-full relative min-h-[500px]">
                    <p className="text-6xl text-white m-auto">
                        Name
                    </p>
                    <div className="absolute top-4 right-4">
                        <Button  className="bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition">
                            <Pencil />
                        </Button>
                        <Input
                            type="file"
                            //ref={imageInputRef}
                            style={{ display: 'none' }}
                            //onChange={handleImageChange}
                            accept="image/*"
                        />
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}