export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DuplicateCheckResponse {
  qidExists: boolean;
  emailExists: boolean;
}

export interface CheckInResponse {
  id: string;
  fullName: string;
  ageGroup: string;
  status: string;
  checkedInAt: Date;
}
