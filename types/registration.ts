import type { AgeGroup, Gender, Status } from "@prisma/client";

export interface Registration {
  id: string;
  qid: string;
  fullName: string;
  ageGroup: AgeGroup;
  email: string;
  nationality: string;
  gender: Gender;
  qrCode: string;
  status: Status;
  checkedInAt: Date | null;
  checkedInBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  checkedInByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface RegistrationStats {
  totalRegistrations: number;
  checkedIn: number;
  pending: number;
  cancelled: number;
  byAgeGroup: {
    KIDS: number;
    YOUTH: number;
    ADULT: number;
    SENIOR: number;
  };
  byGender: {
    MALE: number;
    FEMALE: number;
  };
  todayRegistrations: number;
  recentCheckIns: Registration[];
  registrationsByDay: {
    date: string;
    count: number;
  }[];
}

export interface RegistrationFilters {
  search?: string;
  status?: Status | "ALL";
  ageGroup?: AgeGroup | "ALL";
  page?: number;
  limit?: number;
}

export interface PaginatedRegistrations {
  registrations: Registration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
