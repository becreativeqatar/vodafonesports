"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate, maskQID } from "@/lib/utils";
import { AGE_GROUPS, STATUSES } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarDays,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Registration } from "@/types";
import type { Role } from "@prisma/client";

interface RegistrationsTableProps {
  userRole: Role;
  initialStatus?: string;
  initialAgeGroup?: string;
  initialDate?: string;
}

type SortColumn = "fullName" | "email" | "ageGroup" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

// Memoized row component to prevent unnecessary re-renders
interface RegistrationRowProps {
  reg: Registration;
  onView: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  getAgeGroupBadge: (ageGroup: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

const RegistrationRow = memo(function RegistrationRow({
  reg,
  onView,
  onStatusChange,
  getAgeGroupBadge,
  getStatusBadge,
}: RegistrationRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{reg.fullName}</TableCell>
      <TableCell className="font-mono text-sm">
        {maskQID(reg.qid)}
      </TableCell>
      <TableCell>{reg.email}</TableCell>
      <TableCell>{getAgeGroupBadge(reg.ageGroup)}</TableCell>
      <TableCell>{getStatusBadge(reg.status)}</TableCell>
      <TableCell>{formatDate(reg.createdAt)}</TableCell>
      <TableCell className="text-right">
        <TooltipProvider>
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(reg.id)}
                  aria-label="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View details</p>
              </TooltipContent>
            </Tooltip>
            {reg.status === "REGISTERED" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStatusChange(reg.id, "CHECKED_IN")}
                    aria-label="Check in"
                  >
                    <UserCheck className="h-4 w-4 text-secondary-spring-green" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Check in</p>
                </TooltipContent>
              </Tooltip>
            )}
            {reg.status !== "CANCELLED" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStatusChange(reg.id, "CANCELLED")}
                    aria-label="Cancel registration"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel registration</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
});

export function RegistrationsTable({
  userRole,
  initialStatus,
  initialAgeGroup,
  initialDate,
}: RegistrationsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState(initialStatus || "ALL");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [ageGroup, setAgeGroup] = useState(initialAgeGroup || "ALL");
  const [dateFilter, setDateFilter] = useState(initialDate || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<SortColumn>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });

      if (debouncedSearch) params.set("query", debouncedSearch);
      if (status !== "ALL") params.set("status", status);
      if (ageGroup !== "ALL") params.set("ageGroup", ageGroup);
      if (dateFilter) params.set("date", dateFilter);

      const response = await fetch(`/api/registrations?${params}`);
      const data = await response.json();

      if (data.success) {
        setRegistrations(data.data.registrations);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, ageGroup, dateFilter, sortBy, sortOrder, toast]);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column with default desc order
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      const params = new URLSearchParams({ format });
      if (status !== "ALL") params.set("status", status);
      if (ageGroup !== "ALL") params.set("ageGroup", ageGroup);

      const response = await fetch(`/api/registrations/export?${params}`);

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Export completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export registrations",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update - update UI immediately
    const previousRegistrations = [...registrations];
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === id
          ? { ...reg, status: newStatus as Registration["status"] }
          : reg
      )
    );

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Update failed");

      toast({
        title: "Success",
        description: `Registration ${newStatus === "CHECKED_IN" ? "checked in" : "updated"} successfully`,
      });
    } catch (error) {
      // Revert on error
      setRegistrations(previousRegistrations);
      toast({
        title: "Error",
        description: "Failed to update registration",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = useCallback((status: string) => {
    const variant = {
      REGISTERED: "registered",
      CHECKED_IN: "checkedIn",
      CANCELLED: "cancelled",
    }[status] as "registered" | "checkedIn" | "cancelled";

    return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
  }, []);

  const getAgeGroupBadge = useCallback((ageGroup: string) => {
    const variant = ageGroup.toLowerCase() as "kids" | "youth" | "adult" | "senior";
    return <Badge variant={variant}>{ageGroup}</Badge>;
  }, []);

  const handleViewRegistration = useCallback((id: string) => {
    router.push(`/registrations/${id}`);
  }, [router]);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, QID, or email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ageGroup} onValueChange={(v) => { setAgeGroup(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Age Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ages</SelectItem>
              {AGE_GROUPS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {["ADMIN", "MANAGER"].includes(userRole) && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("xlsx")}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {dateFilter && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Filtering by:</span>
            <Badge variant="outline" className="gap-1.5">
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(dateFilter), "MMM dd, yyyy")}
              <button
                onClick={() => {
                  setDateFilter("");
                  setPage(1);
                }}
                className="ml-1 hover:text-vodafone-red"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort("fullName")}
                    className="flex items-center hover:text-vodafone-red transition-colors"
                  >
                    Name
                    {getSortIcon("fullName")}
                  </button>
                </TableHead>
                <TableHead>QID</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center hover:text-vodafone-red transition-colors"
                  >
                    Email
                    {getSortIcon("email")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("ageGroup")}
                    className="flex items-center hover:text-vodafone-red transition-colors"
                  >
                    Age Group
                    {getSortIcon("ageGroup")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center hover:text-vodafone-red transition-colors"
                  >
                    Status
                    {getSortIcon("status")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center hover:text-vodafone-red transition-colors"
                  >
                    Date
                    {getSortIcon("createdAt")}
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No registrations found
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <RegistrationRow
                    key={reg.id}
                    reg={reg}
                    onView={handleViewRegistration}
                    onStatusChange={handleStatusChange}
                    getAgeGroupBadge={getAgeGroupBadge}
                    getStatusBadge={getStatusBadge}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {registrations.length} of {total} registrations
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
