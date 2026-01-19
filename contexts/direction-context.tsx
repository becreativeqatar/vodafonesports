"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Direction = "ltr" | "rtl";
type Language = "en" | "ar";

interface DirectionContextType {
  direction: Direction;
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const DirectionContext = createContext<DirectionContextType | undefined>(undefined);

export function DirectionProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const direction: Direction = language === "ar" ? "rtl" : "ltr";
  const isRTL = direction === "rtl";

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && (saved === "en" || saved === "ar")) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <DirectionContext.Provider value={{ direction, language, setLanguage, isRTL }}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  const context = useContext(DirectionContext);
  if (context === undefined) {
    throw new Error("useDirection must be used within a DirectionProvider");
  }
  return context;
}
