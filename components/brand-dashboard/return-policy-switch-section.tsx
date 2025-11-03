import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";
import { Switch } from "../ui/switch";

interface ReturnPolicySwitchSectionProps {
    title: string;
    description: string;
    section: string;
    options: { key: string; label: string; tooltip?: string }[];
    data: Record<string, boolean>;
    onCheckedChange: (section: string, key: string, checked: boolean) => void;
}

const ReturnPolicySwitchSection: FC<ReturnPolicySwitchSectionProps> = ({
    title,
    description,
    section,
    options,
    data,
    onCheckedChange
}) => {
    return (
        <Card className="border-2 rounded-none">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {options.map(({ key, label, tooltip }) => (
                    <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor={`${section}-${key}`} className="cursor-pointer">
                                {label}
                            </Label>
                            {tooltip && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={14} className="cursor-help text-gray-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <Switch
                            id={`${section}-${key}`}
                            checked={data[key]}
                            onCheckedChange={(checked) => onCheckedChange(section, key, checked)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default ReturnPolicySwitchSection;