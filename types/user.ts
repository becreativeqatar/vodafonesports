import type { Role } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithStats extends User {
  checkInsCount: number;
}
