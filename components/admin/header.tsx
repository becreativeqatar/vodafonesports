"use client";

import { useMemo } from "react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import type { Role } from "@prisma/client";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const initials = useMemo(() =>
    user.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U",
  [user.name]);

  const roleVariant = {
    ADMIN: "admin",
    MANAGER: "manager",
    VALIDATOR: "validator",
  }[user.role] as "admin" | "manager" | "validator";

  return (
    <header className="bg-white border-b px-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-vodafone-grey">
            Sports Village Admin
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant={roleVariant}>{user.role}</Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-vodafone-red text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
