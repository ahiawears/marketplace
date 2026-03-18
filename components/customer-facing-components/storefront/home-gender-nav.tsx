import Link from "next/link";

const links = [
  { label: "Women", href: "/shop/women" },
  { label: "Men", href: "/shop/men" },
];

export function HomeGenderNav() {
  return (
    <section className="border-b-2 border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="min-w-[120px] border-2 bg-white px-5 py-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-stone-900 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
