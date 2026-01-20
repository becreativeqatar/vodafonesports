export const AGE_GROUPS = [
  { value: "KIDS", label: "Kids", description: "Under 12 years" },
  { value: "YOUTH", label: "Youth", description: "12-17 years" },
  { value: "ADULT", label: "Adult", description: "18-45 years" },
  { value: "SENIOR", label: "Senior", description: "45+ years" },
] as const;

export const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
] as const;

export const STATUSES = [
  { value: "REGISTERED", label: "Registered" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const ROLES = [
  { value: "ADMIN", label: "Administrator", description: "Full system access" },
  { value: "MANAGER", label: "Manager", description: "Can manage registrations and check-ins" },
  { value: "VALIDATOR", label: "Validator", description: "Can scan QR codes and check-in participants" },
] as const;

export const EVENT_INFO = {
  name: "Sports Village - National Sport Day 2026",
  date: "2026-02-10",
  dateFormatted: "Tuesday, 10 February 2026",
  time: "7:30 AM - 4:30 PM",
  location: "Downtown Msheireb, Barahat Msheireb",
  locationUrl: "https://share.google/wSJgqfIyYScjsx5uo",
  city: "Doha, Qatar",
  maxRegistrations: 6000,
};

export const CHART_COLORS = [
  "#E60000", // Vodafone Red
  "#00B0CA", // Aqua Blue
  "#A8B400", // Spring Green
  "#FECB00", // Lemon Yellow
  "#9C2AA0", // Red Violet
  "#007C92", // Turquoise
  "#EB9700", // Fresh Orange
  "#5E2750", // Aubergine
];

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
};
