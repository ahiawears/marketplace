"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReturnPolicySummary {
  is_returnable: boolean;
  return_window_days: number | null;
  return_shipping_responsibility: {
    brandPays?: boolean;
    customerPays?: boolean;
    dependsOnReason?: boolean;
  } | null;
}

interface ProductShippingReturnsDialogProps {
  shippingEstimateFormatted: string | null;
  shippingMethodLabels: string[];
  returnPolicySummary: ReturnPolicySummary | null;
}

export default function ProductShippingReturnsDialog({
  shippingEstimateFormatted,
  shippingMethodLabels,
  returnPolicySummary,
}: ProductShippingReturnsDialogProps) {
  const returnResponsibilityCopy = (() => {
    if (!returnPolicySummary) {
      return "Return details will be confirmed at checkout.";
    }

    if (!returnPolicySummary.is_returnable) {
      return "This item is final sale and is not returnable.";
    }

    const responsibility = returnPolicySummary.return_shipping_responsibility;

    if (responsibility?.brandPays) {
      return "The brand covers return shipping.";
    }

    if (responsibility?.customerPays) {
      return "The customer pays return shipping.";
    }

    if (responsibility?.dependsOnReason) {
      return "Return shipping depends on the reason for return.";
    }

    return "Return shipping details will be confirmed during the return review.";
  })();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="rounded-none border-2">
          View Shipping & Returns
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] border-2">
        <DialogHeader>
          <DialogTitle>Shipping & Returns</DialogTitle>
          <DialogDescription>
            Review the delivery options and return expectations for this product before checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm text-stone-700">
          <section className="space-y-2 rounded border border-stone-200 bg-stone-50 p-4">
            <h3 className="font-semibold text-stone-900">Shipping</h3>
            <p>
              {shippingEstimateFormatted
                ? `Estimated shipping from ${shippingEstimateFormatted}. Final shipping is confirmed at checkout.`
                : "Shipping is calculated at checkout based on the selected method and destination."}
            </p>
            {shippingMethodLabels.length > 0 && (
              <p>Available methods: {shippingMethodLabels.join(", ")}</p>
            )}
          </section>

          <section className="space-y-2 rounded border border-stone-200 bg-stone-50 p-4">
            <h3 className="font-semibold text-stone-900">Returns</h3>
            {returnPolicySummary?.is_returnable === false ? (
              <p>This item is final sale and not eligible for returns.</p>
            ) : (
              <>
                <p>
                  {returnPolicySummary?.return_window_days
                    ? `${returnPolicySummary.return_window_days}-day return window.`
                    : "Return window details are available at checkout."}
                </p>
                <p>{returnResponsibilityCopy}</p>
              </>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
