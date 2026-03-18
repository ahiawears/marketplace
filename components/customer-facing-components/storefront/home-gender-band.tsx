import Link from "next/link";
import { ArrowRight } from "lucide-react";

const entries = [
  {
    title: "Women",
    href: "/shop/women",
    description: "Curated editorial discovery, new drops, and category-led browsing.",
    accent: "bg-rose-50 border-rose-200",
  },
  {
    title: "Men",
    href: "/shop/men",
    description: "Tailored discovery for essentials, outerwear, and standout brands.",
    accent: "bg-sky-50 border-sky-200",
  },
];

export function HomeGenderBand() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {entries.map((entry) => (
        <Link
          key={entry.title}
          href={entry.href}
          className={`group border-2 p-6 transition hover:-translate-y-0.5 ${entry.accent}`}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Shop by gender</p>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{entry.title}</h2>
              <p className="max-w-md text-sm leading-6 text-stone-700">{entry.description}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-stone-900 transition group-hover:translate-x-1" />
          </div>
        </Link>
      ))}
    </section>
  );
}
