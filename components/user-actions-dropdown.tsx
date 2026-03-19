import { signout } from "@/actions/signout";
import { Button } from "@/components/ui/button";
import { StorefrontCurrencySelector } from "@/components/customer-facing-components/storefront/storefront-currency-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js"; 
import { User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, ReactNode } from "react";

type Props = {
  user: User;
  trigger?: ReactNode;
  selectedCurrency?: string;
};

const menuItems: {
  label: string;
  href?: string;
  action?: () => void;
  separator?: boolean;
}[] = [
  {
    label: "My account",
    href: "/my-account",
  },
  {
    label: "Log out",
    action: signout,
  },
];

export function UserActionsDropdownDesktop({ user }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="hidden md:flex">
        <Button variant="outline" size={"icon"} className="border-2">
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <p className="">
            Hi, <span>{user.user_metadata.first_name} </span>
          </p>
          
          
        </DropdownMenuLabel>
        {menuItems.map((item) => (
          <Fragment key={item.label}>
            <DropdownMenuItem asChild>
              {item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <form action={item.action}>
                  <button type="submit">{item.label}</button>
                </form>
              )}
            </DropdownMenuItem>
            {item.separator && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function UserActionsDropdownMobile({ user, trigger, selectedCurrency }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="md:hidden">
        {trigger ?? (
          <Button variant="outline">
            <span className="sr-only">Open menu</span>
            <UserIcon />
            <span className="ml-2">{user.user_metadata.first_name}</span>
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        {selectedCurrency ? (
          <>
            <div className="px-2 py-2">
              <StorefrontCurrencySelector
                selectedCurrency={selectedCurrency}
                className="w-full"
              />
            </div>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {menuItems.map((item) => (
          <Fragment key={item.label}>
            <DropdownMenuItem asChild>
              {item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <form action={item.action}>
                  <button type="submit">{item.label}</button>
                </form>
              )}
            </DropdownMenuItem>
            {item.separator && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
