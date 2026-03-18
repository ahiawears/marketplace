"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Rocket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PublishProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onPublishSuccess: () => void;
}

export function PublishProductDialog({
  open,
  onOpenChange,
  productId,
  onPublishSuccess,
}: PublishProductDialogProps) {
  const [publishMode, setPublishMode] = useState<"now" | "later">("now");
  const [releaseDate, setReleaseDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minReleaseDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleConfirm = async () => {
    if (publishMode === "later" && !releaseDate) {
      toast.error("Please choose a release date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/products/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          publishMode,
          releaseDate: publishMode === "later" ? releaseDate : null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Failed to update product publish state.");
        return;
      }

      toast.success(
        publishMode === "now"
          ? "Product published successfully."
          : "Product scheduled for release."
      );

      onOpenChange(false);
      onPublishSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product publish state.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Publish Product</DialogTitle>
          <DialogDescription>
            Decide whether this product should go live right away or be scheduled for a later release date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setPublishMode("now")}
            className={`w-full border-2 p-4 text-left transition ${
              publishMode === "now" ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <Rocket className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-stone-900">Publish now</p>
                <p className="mt-1 text-sm text-stone-600">
                  The product goes live immediately. Variant-level available dates can still hide individual variants until later.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPublishMode("later")}
            className={`w-full border-2 p-4 text-left transition ${
              publishMode === "later" ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="w-full">
                <p className="font-semibold text-stone-900">Publish later</p>
                <p className="mt-1 text-sm text-stone-600">
                  Keep the product off the storefront for now and schedule its product-level release date.
                </p>
                {publishMode === "later" ? (
                  <div className="mt-3">
                    <label htmlFor="releaseDate" className="mb-2 block text-sm font-medium text-stone-900">
                      Release date
                    </label>
                    <Input
                      id="releaseDate"
                      type="date"
                      min={minReleaseDate}
                      value={releaseDate}
                      onChange={(event) => setReleaseDate(event.target.value)}
                      className="border-2"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" className="border-2" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : publishMode === "now"
                ? "Publish now"
                : "Schedule release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
