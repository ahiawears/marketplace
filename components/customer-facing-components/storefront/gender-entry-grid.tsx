import Link from "next/link";
import { ArrowRight } from "lucide-react";

const entries = [
  {
    title: "Women",
    href: "/shop/women",
    description:
      "Editorial fashion, fresh drops, statement pieces, and category-led discovery built for the women’s storefront.",
    accent: "from-rose-200 via-orange-100 to-white",
  },
  {
    title: "Men",
    href: "/shop/men",
    description:
      "Clean tailoring, everyday essentials, outerwear, and emerging labels gathered into the men’s storefront.",
    accent: "from-sky-200 via-cyan-100 to-white",
  },
];

export function GenderEntryGrid() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {entries.map((entry) => (
        <Link
          key={entry.title}
          href={entry.href}
          className={`group overflow-hidden border-2 bg-gradient-to-br ${entry.accent} p-8 transition hover:-translate-y-0.5`}
        >
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Start here</p>
              <h2 className="text-4xl font-semibold tracking-tight text-stone-900">{entry.title}</h2>
              <p className="max-w-xl text-sm leading-6 text-stone-700">{entry.description}</p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              Explore {entry.title}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
