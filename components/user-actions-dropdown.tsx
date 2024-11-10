import { signout } from "@/actions/signout";
import { Button } from "@/components/ui/button";
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
import { Fragment } from "react";

type Props = {
  user: User;
};

const menuItems: {
  label: string;
  href?: string;
  action?: () => void;
  separator?: boolean;
}[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Start your brand",
    href: "/brand-onboarding",
    separator: true,
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
        <Button variant="outline" size={"icon"}>
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
export function UserActionsDropdownMobile({ user }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="md:hidden">
        <Button variant="outline">
          <span className="sr-only">Open menu</span>
          <UserIcon />
          <span className="ml-2">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
