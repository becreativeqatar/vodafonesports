"use client";

import { useDirection } from "@/contexts/direction-context";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface LanguageToggleProps {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function LanguageToggle({
  variant = "ghost",
  size = "sm",
  showLabel = false,
}: LanguageToggleProps) {
  const { language, setLanguage, isRTL } = useDirection();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLanguage}
      className="gap-2"
      aria-label={`Switch to ${language === "en" ? "Arabic" : "English"}`}
    >
      <Languages className="h-4 w-4" />
      {showLabel && (
        <span className="text-sm font-medium">
          {language === "en" ? "العربية" : "English"}
        </span>
      )}
      {!showLabel && (
        <span className="text-xs font-medium uppercase">
          {language === "en" ? "AR" : "EN"}
        </span>
      )}
    </Button>
  );
}
