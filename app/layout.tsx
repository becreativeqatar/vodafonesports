import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DirectionProvider } from "@/contexts/direction-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sports Village 2026 - Vodafone Qatar",
  description:
    "Register for Sports Village - National Sport Day 2026 at Downtown Msheireb, Qatar",
  keywords: [
    "Sports Village",
    "National Sport Day",
    "Qatar",
    "Vodafone",
    "2026",
    "Registration",
  ],
  authors: [{ name: "Vodafone Qatar" }],
  openGraph: {
    title: "Sports Village 2026 - Vodafone Qatar",
    description:
      "Register for Sports Village - National Sport Day 2026 at Downtown Msheireb, Qatar",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoArabic.variable} font-sans antialiased`}
      >
        <DirectionProvider>
          {children}
          <Toaster />
        </DirectionProvider>
      </body>
    </html>
  );
}
