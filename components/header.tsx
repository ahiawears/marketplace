"use client";

import { Filter, Heart, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./ui/logo";
import { 
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Link from "next/link";
import {
  UserActionsDropdownDesktop,
  UserActionsDropdownMobile,
} from "./user-actions-dropdown";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "./ui/search-input";


export const Header = ({ user }: { user: any }) => {
  const [searchQuery, setSearchQuery] = useState("");  
  const router = useRouter();

  const handleSearch = () => {
    
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const goToFavorited = () => {
    router.push(`/fav-lists`);
  }

  const goToCart = () => {
    router.push(`/cart`);
  }
  return (
    <header className="p-8 border-b border-border sticky left-0 top-0 w-full bg-background z-50">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Logo />
        <div className="flex items-center gap-4 grow w-full">
          <SearchInput 
            placeholder="Search products" 
            className="grow h-10" 
            name="searchValue" 
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
          <Button size={"icon"} variant="outline" onClick={goToFavorited}>
            <Heart />
          </Button>
          <Button size={"icon"} variant="outline" onClick={goToCart}>
            <ShoppingCart />
          </Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size={"icon"}>
                  <Filter />
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col px-0" side={"left"}>
                <SheetTitle className="sr-only">Filters</SheetTitle>
                <ul className="flex-1">{/* TODO: Add filters */}</ul>
                <SheetFooter className="border-t border-border pt-4 px-3">
                  {!user ? (
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <Button asChild variant={"outline"} size={"lg"}>
                        <Link href={"/log-in"}>Login</Link>
                      </Button>
                      <Button size={"lg"}>
                        <Link href={"/signup"}>Get Started</Link>
                      </Button>
                    </div>
                  ) : (
                    <UserActionsDropdownMobile user={user} />
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {!user ? (
          <div className="md:flex items-center gap-4 hidden">
            <Button variant={"outline"} asChild size={"lg"}>
              <Link href={"/log-in"}>Login</Link>
            </Button>
            <Button size={"lg"}>
              <Link href={"/signup"}>Get Started</Link>
            </Button>
          </div>
        ) : (
          <div className="hidden md:block">
            <UserActionsDropdownDesktop user={user} />
          </div>
        )}
      </div>
    </header>
  );
};
