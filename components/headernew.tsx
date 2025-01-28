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


export const HeaderNew = ({ user }: { user: any }) => {
    const [searchQuery, setSearchQuery] = useState("");  
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const router = useRouter();

    const handleSearch = () => {

    if (searchQuery.trim()) 
        {
            router.push(`/products?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const goToFavorited = () => {
        router.push(`/fav-lists`);
    }

    const goToCart = () => {
        router.push(`/cart`);
    }

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible); // Toggle search input visibility
    };

    return (
        <header className="p-8 border-b border-border left-0 top-0 w-full bg-background z-50 sticky">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <div className="flex md:flex-row gap-4">

                    {/* Mobile Search Icon */}
                    {!isSearchVisible && (
                        <div className="lg:hidden md:hidden flex items-center">
                            <Button 
                                className="bg-white"
                                onClick={toggleSearch}
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24"  
                                    fill="none" 
                                    stroke="black" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="lucide lucide-search "
                                >
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.3-4.3"/>
                                </svg>
                            </Button>
                        </div>
                    )}

                     {/* Logo */}
                    {!isSearchVisible && (
                        <div className="lg:items-start md:items-start mx-auto">
                            <Logo />
                        </div>
                    )}

                    {/* Mobile Menu Icon */}
                    {!isSearchVisible && (
                        <div className="lg:hidden md:hidden flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-menu"
                            >
                                <line x1="4" x2="20" y1="12" y2="12" />
                                <line x1="4" x2="20" y1="6" y2="6" />
                                <line x1="4" x2="20" y1="18" y2="18" />
                            </svg>
                        </div>
                    )}

                    {/* Search Input (Visible on Mobile when Search Icon is Clicked) */}
                    {isSearchVisible && (
                        <div className="lg:hidden md:hidden flex items-center w-full gap-2">
                            <SearchInput
                                placeholder="Search products"
                                className="grow h-10 cursor-auto"
                                name="searchValue"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onSearch={handleSearch}
                            />
                            <Button variant="outline" onClick={toggleSearch}>
                                Cancel
                            </Button>
                        </div>
                    )}
                    
                    <div className="hidden lg:flex md:flex items-center gap-4 grow w-full">
                            <SearchInput 
                                placeholder="Search products" 
                                className="grow h-10 cursor-auto" 
                                name="searchValue" 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onSearch={handleSearch}
                            /> 
                        
                        <div className="hidden md:flex lg:flex gap-4">
                            <Button size={"icon"} variant="outline" onClick={goToFavorited}>
                                <Heart />
                            </Button>
                            <Button size={"icon"} variant="outline" onClick={goToCart}>
                                <ShoppingCart />
                            </Button>
                        </div>
                        
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
            </div>
            
        </header>
    );
};
