import Link from "next/link";

interface GenderNavStripProps {
  gender: "men" | "women";
  categories: string[];
}

const editorialLinks = [
  { label: "New in", query: "new in" },
  { label: "Most saved", query: "most saved" },
  { label: "Best selling", query: "best selling" },
];

export function GenderNavStrip({ gender, categories }: GenderNavStripProps) {
  return (
    <section className="border-y-2 bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {editorialLinks.map((item) => (
            <Link
              key={item.label}
              href={`/products?query=${encodeURIComponent(item.query)}&gender=${encodeURIComponent(gender)}`}
              className="border-2 border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?cat=${encodeURIComponent(category)}&gender=${encodeURIComponent(gender)}`}
              className="border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 transition hover:border-stone-900 hover:bg-white hover:text-stone-900"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
