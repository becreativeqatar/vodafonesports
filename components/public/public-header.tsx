"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { LanguageToggle } from "@/components/shared/language-toggle";

export function PublicHeader() {
  const pathname = usePathname();

  // Hide header on home page
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="bg-vodafone-red text-white px-3 py-1 rounded-full text-sm font-medium">
            10 Feb 2026
          </span>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
