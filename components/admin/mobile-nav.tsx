"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Registrations",
    href: "/registrations",
    icon: ClipboardList,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Validation",
    href: "/validation",
    icon: QrCode,
    roles: ["ADMIN", "MANAGER", "VALIDATOR"],
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Logo size="sm" href="/dashboard" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-0 right-0 z-40 h-full w-72 bg-white transform transition-transform duration-300 ease-in-out shadow-xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-vodafone-grey">Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-vodafone-red text-white"
                    : "text-vodafone-grey hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-vodafone-grey truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-vodafone-red hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
