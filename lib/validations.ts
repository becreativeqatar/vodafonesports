import { z } from "zod";

// QID validation: exactly 11 digits
export const qidSchema = z
  .string()
  .length(11, "QID must be exactly 11 digits")
  .regex(/^\d{11}$/, "QID must contain only numbers");

// Registration form schema
export const registrationSchema = z.object({
  qid: qidSchema,
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must be less than 100 characters")
    // Support Unicode letters (including Arabic, accented characters, etc.)
    .regex(/^[\p{L}\p{M}\s\-']+$/u, "Full name can only contain letters, spaces, hyphens, and apostrophes"),
  ageGroup: z.enum(["KIDS", "YOUTH", "ADULT", "SENIOR"], {
    required_error: "Please select an age group",
  }),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase(),
  nationality: z
    .string()
    .min(2, "Please select a nationality"),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Please select a gender",
  }),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// User creation schema
export const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "MANAGER", "VALIDATOR"]),
});

// User update schema
export const updateUserSchema = z.object({
  email: z.string().email("Please enter a valid email").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["ADMIN", "MANAGER", "VALIDATOR"]).optional(),
  isActive: z.boolean().optional(),
});

// Search/filter schema
export const searchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["REGISTERED", "CHECKED_IN", "CANCELLED", "ALL"]).optional(),
  ageGroup: z.enum(["KIDS", "YOUTH", "ADULT", "SENIOR", "ALL"]).optional(),
  date: z.string().optional(), // Format: YYYY-MM-DD
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["fullName", "email", "ageGroup", "status", "createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Check-in schema
export const checkInSchema = z.object({
  qrCode: z.string().min(1, "QR code is required"),
});

// Manual lookup schema
export const lookupSchema = z.object({
  type: z.enum(["qid", "email"]),
  value: z.string().min(1),
});

// Duplicate check schema
export const duplicateCheckSchema = z.object({
  qid: z.string().optional(),
  email: z.string().email().optional(),
});

// Types inferred from schemas
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type LookupInput = z.infer<typeof lookupSchema>;
export type DuplicateCheckInput = z.infer<typeof duplicateCheckSchema>;
