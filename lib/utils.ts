import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateQRCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SVE2026-${result}`;
}

export function maskQID(qid: string): string {
  if (qid.length !== 11) return qid;
  return `${qid.slice(0, 3)}-${qid.slice(3, 7)}-${qid.slice(7)}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAgeGroupLabel(ageGroup: string): string {
  const labels: Record<string, string> = {
    KIDS: "Kids (Under 12)",
    YOUTH: "Youth (12-17)",
    ADULT: "Adult (18-45)",
    SENIOR: "Senior (45+)",
  };
  return labels[ageGroup] || ageGroup;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REGISTERED: "bg-secondary-aqua-blue text-white",
    CHECKED_IN: "bg-secondary-spring-green text-white",
    CANCELLED: "bg-vodafone-grey text-white",
  };
  return colors[status] || "bg-gray-500 text-white";
}

export function getAgeGroupColor(ageGroup: string): string {
  const colors: Record<string, string> = {
    KIDS: "bg-secondary-lemon-yellow text-black",
    YOUTH: "bg-secondary-aqua-blue text-white",
    ADULT: "bg-vodafone-red text-white",
    SENIOR: "bg-secondary-turquoise text-white",
  };
  return colors[ageGroup] || "bg-gray-500 text-white";
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: "bg-vodafone-red text-white",
    MANAGER: "bg-secondary-aubergine text-white",
    STAFF: "bg-secondary-turquoise text-white",
  };
  return colors[role] || "bg-gray-500 text-white";
}
