"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white" | "stacked-white";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const logoSizes = {
  sm: { width: 120, height: 32 },
  md: { width: 150, height: 40 },
  lg: { width: 180, height: 48 },
};

const stackedLogoSizes = {
  sm: { width: 60, height: 60 },
  md: { width: 80, height: 80 },
  lg: { width: 100, height: 100 },
};

export function Logo({
  variant = "default",
  className,
  size = "md",
}: LogoProps) {
  const isStacked = variant === "stacked-white";
  const dimensions = isStacked ? stackedLogoSizes[size] : logoSizes[size];

  const logoSrc = {
    default: "/images/vodafone-logo-red.png",
    white: "/images/vodafone-logo-white.png",
    "stacked-white": "/images/vodafone-logo-stacked-white.png",
  }[variant];

  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image
        src={logoSrc}
        alt="Vodafone"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
    </Link>
  );
}
