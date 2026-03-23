import Image from "next/image";

interface CheckoutItem {
  id: string;
  product_name: string;
  main_image_url: string;
  variant_color: {
    name: string;
    hex: string;
  } | null;
  size_name: string;
  quantity: number;
  formatted_price?: string;
  currency_code?: string;
  price: number;
}

interface CheckoutItemListProps {
  items: CheckoutItem[];
}

export default function CheckoutItemList({ items }: CheckoutItemListProps) {
  return (
    <div className="border-2 bg-white">
      <div className="border-b-2 px-5 py-4">
        <h2 className="text-lg font-semibold">Order Items</h2>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 px-5 py-4">
            <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden border-2 bg-stone-100">
              <Image
                src={item.main_image_url}
                alt={item.product_name}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={true}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row">
              <div className="min-w-0">
                <p className="text-base font-semibold text-stone-900">{item.product_name}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-600">
                  {item.variant_color ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 border border-stone-300"
                        style={{ backgroundColor: item.variant_color.hex }}
                      />
                      {item.variant_color.name}
                    </span>
                  ) : null}
                  <span>Size: {item.size_name}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm uppercase tracking-[0.18em] text-stone-500">Unit price</p>
                <p className="mt-1 text-base font-semibold text-stone-900">
                  {item.formatted_price || `${item.currency_code || "USD"} ${item.price.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
