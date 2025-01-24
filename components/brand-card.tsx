import { cn } from "@/lib/utils";
import { Card, CardHeader } from "./ui/card"
import Image from "next/image";

type BrandCardProps = {
    className?: string;
    headerClassName?: string;
}

export const BrandCard = (props: BrandCardProps) => {
    return (
        <Card className={cn(props.className)}>
            <CardHeader
                className={cn("p-0", props.headerClassName)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <Image
                    width={300}
                    height={500}
                    alt="brand-name"
                    src={"https://placehold.co/300x500.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"}
                    className=" inset-0"
                    priority
                />
                <p className="text-black text-3xl absolute text-center">
                    Message
                </p>
            </CardHeader>
        </Card>
    )

}