"use client";

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
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";

interface SidebarProps {
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

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <Logo href="/dashboard" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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
      <div className="p-4 border-t">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-vodafone-grey truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-vodafone-grey hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
