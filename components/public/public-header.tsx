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
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="bg-vodafone-red text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
            10 Feb 2026
          </span>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
