const placeholderBrands = ["Studio North", "Aven Atelier", "House of Sol", "Monarc", "Kite & Vale", "Parallel Form"];

export function BestBrandsPlaceholder({ title = "Best brands" }: { title?: string }) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Marketplace spotlight</p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          This section is ready for the future admin-controlled brand curation layer. For now it acts as a design-safe
          placeholder.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {placeholderBrands.map((brand) => (
          <div key={brand} className="border-2 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Featured brand</p>
            <h3 className="mt-3 text-xl font-semibold text-stone-900">{brand}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Placeholder brand feature card until the admin dashboard controls curated storefront placements.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
