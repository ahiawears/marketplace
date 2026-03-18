"use client";

import { usePathname } from "next/navigation";

import Navbarn from "@/components/navbarn";

export function LandingRouteNav() {
  const pathname = usePathname();

  if (!pathname.startsWith("/shop/")) {
    return null;
  }

  return <Navbarn />;
}
