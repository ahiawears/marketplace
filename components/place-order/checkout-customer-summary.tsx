interface CheckoutAddress {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  county: string;
  region: string;
  country: string;
  post_code: string;
  country_code: string;
  mobile: string;
  is_default: boolean;
}

interface CheckoutPaymentMethod {
  id: string;
  expiry_month: number;
  expiry_year: number;
  card_brand: string;
  last_four: string;
  is_default: boolean;
  card_holder: string;
}

interface CheckoutCustomerSummaryProps {
  address: CheckoutAddress | null;
  paymentMethod: CheckoutPaymentMethod | null;
  email: string;
}

export default function CheckoutCustomerSummary({
  address,
  paymentMethod,
  email,
}: CheckoutCustomerSummaryProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="border-2 bg-white">
        <div className="border-b-2 px-5 py-4">
          <h2 className="text-lg font-semibold">Shipping Details</h2>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm text-stone-700">
          {address ? (
            <>
              <p className="font-semibold text-stone-900">
                {address.first_name} {address.last_name}
              </p>
              <p>{address.address}</p>
              <p>
                {address.city}, {address.county}
              </p>
              <p>{address.region}</p>
              <p>
                {address.country} {address.post_code}
              </p>
              <p>
                {address.country_code} {address.mobile}
              </p>
              <p>{email}</p>
            </>
          ) : (
            <p>No shipping address found. Add one in My Account before checkout.</p>
          )}
        </div>
      </section>

      <section className="border-2 bg-white">
        <div className="border-b-2 px-5 py-4">
          <h2 className="text-lg font-semibold">Payment Method</h2>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm text-stone-700">
          {paymentMethod ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Saved default method on file
              </p>
              <p className="font-semibold uppercase tracking-[0.18em] text-stone-900">
                {paymentMethod.card_brand}
              </p>
              <p>Ending in {paymentMethod.last_four}</p>
              <p>
                Expires {String(paymentMethod.expiry_month).padStart(2, "0")}/
                {paymentMethod.expiry_year}
              </p>
              <p>{paymentMethod.card_holder}</p>
              <p className="pt-2 text-xs leading-5 text-stone-500">
                You can manage saved cards in My Account. This checkout still asks for card authorization below.
              </p>
            </>
          ) : (
            <p>
              No saved payment method found. You can still enter a card below for this checkout.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
