import { FC, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { MapPin } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import { CountryData } from "@/lib/country-data";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface ReturnAddress {
    contactPerson: string;
    addressLine: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
    email: string;
}

interface ReturnAddressSectionProps {
    address: ReturnAddress;
    errors?: z.ZodFormattedError<ReturnAddress>;
    onStringChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    onPhoneChange: (value: string | undefined) => void;
}

const ReturnAddressSection: FC<ReturnAddressSectionProps> = ({
    address,
    errors,
    onStringChange,
    onSelectChange,
    onPhoneChange,
}) => {
    return (
        <Card className="border-2 rounded-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Return Address
                </CardTitle>
                <CardDescription>Where customers should send returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="returnAddress.contactPerson">Contact Person</Label>
                        <Input
                            id="returnAddress.contactPerson"
                            name="returnAddress.contactPerson"
                            value={address.contactPerson}
                            onChange={onStringChange}
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <Label htmlFor="returnAddress.phoneNumber">
                            Phone Number
                        </Label>

                        <div>
                            <PhoneInput
                                international
                                value={address.phoneNumber}
                                onChange={onPhoneChange}
                                className={cn(
                                    "w-full",
                                    "flex h-12 rounded-none border-2 bg-background px-3 py-2 text-sm file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                                )}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <Label htmlFor="returnAddress.addressLine">Address Line*</Label>
                    <Input
                        id="returnAddress.addressLine"
                        name="returnAddress.addressLine"
                        value={address.addressLine}
                        onChange={onStringChange}
                        placeholder="123 Main Street"
                        className={errors?.addressLine?._errors.length ? "border-red-500" : ""}
                    />
                    {errors?.addressLine?._errors[0] && (
                        <p className="text-red-500 text-xs mt-1">{errors.addressLine._errors[0]}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="returnAddress.city">City*</Label>
                        <Input
                            id="returnAddress.city"
                            name="returnAddress.city"
                            value={address.city}
                            onChange={onStringChange}
                            placeholder="New York"
                            className={errors?.city?._errors.length ? "border-red-500" : ""}
                        />
                        {errors?.city?._errors[0] && (
                            <p className="text-red-500 text-xs mt-1">{errors.city._errors[0]}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="returnAddress.region">State/Region</Label>
                        <Input
                            id="returnAddress.region"
                            name="returnAddress.region"
                            value={address.region}
                            onChange={onStringChange}
                            placeholder="NY"
                        />
                    </div>

                    <div>
                        <Label htmlFor="returnAddress.postalCode">Postal Code</Label>
                        <Input
                            id="returnAddress.postalCode"
                            name="returnAddress.postalCode"
                            value={address.postalCode}
                            onChange={onStringChange}
                            placeholder="10001"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="returnAddress.country">Country*</Label>
                        <Select
                            id="returnAddress.country"
                            name="returnAddress.country"
                            value={address.country}
                            onChange={onSelectChange}
                            className="border-2"
                        >
                            <option value="">Select a country</option>
                            {CountryData.map((country) => (
                                <option key={country.iso2} value={country.iso2}>
                                    {`${country.emoji} ${country.name} (${country.iso2})`}
                                </option>
                            ))}
                        </Select>
                        {errors?.country?._errors[0] && (
                            <p className="text-red-500 text-xs mt-1">{errors.country._errors[0]}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="returnAddress.email">Email</Label>
                        <Input
                            id="returnAddress.email"
                            name="returnAddress.email"
                            type="email"
                            value={address.email}
                            onChange={onStringChange}
                            placeholder="returns@yourcompany.com"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReturnAddressSection;