import { AgeGroup } from "@prisma/client";
import { ISO_NUMERIC_TO_COUNTRY } from "./countries";

interface ParsedQID {
  birthYear: number | null;
  countryCode: string | null;
  isValid: boolean;
}

/**
 * Parse a Qatar ID (QID) number to extract birth year and country code
 *
 * QID Structure (11 digits):
 * - Position 1: Century (2=1900s, 3=2000s)
 * - Position 2-3: Birth year (last 2 digits)
 * - Position 4-6: ISO 3166-1 numeric country code
 * - Position 7-11: Unique sequence number
 *
 * @param qid - The 11-digit QID number
 * @returns Parsed QID data with birthYear, countryCode, and validity flag
 */
export function parseQID(qid: string): ParsedQID {
  // Remove any spaces or dashes
  const cleanQID = qid.replace(/[\s-]/g, "");

  // Validate: must be exactly 11 digits
  if (!/^\d{11}$/.test(cleanQID)) {
    return { birthYear: null, countryCode: null, isValid: false };
  }

  const centuryDigit = cleanQID[0];
  const yearDigits = cleanQID.substring(1, 3);
  const countryCode = cleanQID.substring(3, 6);

  // Century digit must be 2 (1900s) or 3 (2000s)
  if (centuryDigit !== "2" && centuryDigit !== "3") {
    return { birthYear: null, countryCode: null, isValid: false };
  }

  const century = centuryDigit === "2" ? 1900 : 2000;
  const birthYear = century + parseInt(yearDigits, 10);

  return {
    birthYear,
    countryCode,
    isValid: true,
  };
}

/**
 * Calculate age group based on birth year and a reference date
 *
 * Age Groups:
 * - KIDS: Under 12 years
 * - YOUTH: 12-17 years
 * - ADULT: 18-45 years
 * - SENIOR: 45+ years
 *
 * @param birthYear - The birth year
 * @param referenceDate - The date to calculate age relative to (event date)
 * @returns The calculated age group or null if invalid
 */
export function calculateAgeGroup(
  birthYear: number,
  referenceDate: Date = new Date(2026, 1, 10) // Feb 10, 2026 (event date)
): AgeGroup | null {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  // Calculate age (assume birthday already passed in the reference year for simplicity)
  // For more accuracy, we'd need the full birth date, but QID only has year
  let age = refYear - birthYear;

  // Basic sanity check
  if (age < 0 || age > 120) {
    return null;
  }

  if (age < 12) {
    return "KIDS";
  } else if (age >= 12 && age <= 17) {
    return "YOUTH";
  } else if (age >= 18 && age <= 45) {
    return "ADULT";
  } else {
    return "SENIOR";
  }
}

/**
 * Get country name from ISO 3166-1 numeric code
 *
 * @param numericCode - The 3-digit ISO numeric country code
 * @returns The country name or null if not found
 */
export function getCountryFromCode(numericCode: string): string | null {
  // Pad with leading zeros if needed (e.g., "48" -> "048")
  const paddedCode = numericCode.padStart(3, "0");
  return ISO_NUMERIC_TO_COUNTRY[paddedCode] || null;
}

/**
 * Parse QID and return pre-fill data for the registration form
 *
 * @param qid - The 11-digit QID number
 * @returns Object with nationality and ageGroup to pre-fill, or null values if parsing fails
 */
export function getQIDPrefillData(qid: string): {
  nationality: string | null;
  ageGroup: AgeGroup | null;
} {
  const parsed = parseQID(qid);

  if (!parsed.isValid) {
    return { nationality: null, ageGroup: null };
  }

  const nationality = parsed.countryCode
    ? getCountryFromCode(parsed.countryCode)
    : null;

  const ageGroup = parsed.birthYear
    ? calculateAgeGroup(parsed.birthYear)
    : null;

  return { nationality, ageGroup };
}
