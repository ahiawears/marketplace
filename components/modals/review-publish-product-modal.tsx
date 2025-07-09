import { ProductUploadData } from "@/lib/types";
import ModalBackdrop from "./modal-backdrop"
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { DatePicker } from "../ui/date-picker";
import { TimeScroller } from "../ui/time-input";
import { SearchableSelect } from "../ui/searchable-select";
import { Separator } from "../ui/separator";

interface ReviewAndPublishModalProps {
    productData: ProductUploadData;
    onClose: () => void;
    onPreview: () => void;
    onPublish: (releaseDetails: { isPublished: boolean; releaseDate?: string; timeZone?: string; }) => void;
}

const ReviewAndPublishModal: React.FC<ReviewAndPublishModalProps> = ({ productData, onClose, onPreview, onPublish }) => {
    const [publishOption, setPublishOption] = useState<'now' | 'schedule'>('now');
    const [releaseDate, setReleaseDate] = useState<string>('');
    const [releaseTime, setReleaseTime] = useState<string>('');
    const [timeZone, setTimeZone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

    const timeZoneOptions = useMemo(() =>
        typeof Intl.supportedValuesOf === 'function'
            ? Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz }))
            : [{ value: timeZone, label: timeZone }], // Fallback for older environments
        [timeZone]
    );

    const handlePublish = () => {
        if (publishOption === 'now') {
            onPublish({ isPublished: true });
        } else {
            if (!releaseDate || !releaseTime) {
                alert("Please select a date and time for the scheduled release.");
                return;
            }
            const scheduledDateTime = `${releaseDate}T${releaseTime}:00`;
            onPublish({
                isPublished: false,
                releaseDate: scheduledDateTime,
                timeZone: timeZone
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">

            <Card className="w-full max-w-md pointer-events-auto">
                <CardHeader>
                    <CardTitle>Publish Product</CardTitle>
                    <CardDescription>
                        Choose when you want this product to be available to customers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                        <Button className="border-2" variant={publishOption === 'now' ? 'default' : 'outline'} onClick={() => setPublishOption('now')}>
                            Publish Now
                        </Button>
                        <Button className="border-2" variant={publishOption === 'schedule' ? 'default' : 'outline'} onClick={() => setPublishOption('schedule')}>
                            Schedule for Later
                        </Button>
                    </div>

                    {publishOption === 'schedule' && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="release-date">Release Date</Label>
                                <DatePicker className="border-2" id="release-date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2 space-y-2">
                                    <Label htmlFor="release-time">Time</Label>
                                    <TimeScroller value={releaseTime} onChange={setReleaseTime} timeFormat="24h" />
                                </div>
                                <div className="w-1/2 space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <SearchableSelect options={timeZoneOptions} getOptionLabel={(option) => option.label} onSelect={(option) => setTimeZone(option.value)} placeholder={timeZone} />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-between p-6">
                    <Button variant="ghost" onClick={onPreview}>Preview</Button>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handlePublish}>
                            {publishOption === 'now' ? 'Publish' : 'Schedule'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default ReviewAndPublishModal;