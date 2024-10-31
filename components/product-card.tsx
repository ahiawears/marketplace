import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const ProductCard = () => {
  return (
    <Card>
      <CardHeader className="h-[400px] bg-muted">{/* Image */}</CardHeader>
      <CardContent className="pt-4 space-y-2">
        <CardTitle className="truncate">Product Title</CardTitle>
        <CardDescription>20.00$</CardDescription>
      </CardContent>
    </Card>
  );
};
