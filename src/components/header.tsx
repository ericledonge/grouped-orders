"use client";

import { UserButton } from "@daveyplate/better-auth-ui";
import { LayoutDashboardIcon, MenuIcon, PackageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboardIcon },
  { label: "Commandes", href: "/admin/orders", icon: PackageIcon },
];

const memberNav: NavItem[] = [
  { label: "Commandes", href: "/orders", icon: PackageIcon },
];

interface HeaderProps {
  /** Rôle de l'utilisateur connecté */
  userRole?: string | null;
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Header({ userRole }: HeaderProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";
  const navItems = isAdmin ? adminNav : memberNav;
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          Grouped Order
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-2">
          <NavLinks items={navItems} pathname={pathname} />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <div className="hidden md:block">
            <UserButton size="icon" />
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-2">
                  <NavLinks
                    items={navItems}
                    pathname={pathname}
                    onNavigate={() => setOpen(false)}
                  />
                </nav>

                {/* Mobile User Actions */}
                <div className="mt-6 flex items-center gap-2 border-t pt-4 px-2">
                  <UserButton variant="ghost" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
