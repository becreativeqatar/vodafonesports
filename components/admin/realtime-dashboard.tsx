"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { RegistrationsChartInteractive } from "./charts/registrations-chart-interactive";
import { AgeDistributionChartInteractive } from "./charts/age-distribution-chart-interactive";
import { GenderDistributionChart } from "./charts/gender-distribution-chart";
import { NationalityDistributionChart } from "./charts/nationality-distribution-chart";
import { RecentActivity } from "./recent-activity";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardStats {
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
  byNationality: {
    nationality: string;
    count: number;
  }[];
  todayRegistrations: number;
  recentCheckIns: any[];
  registrationsByDay: {
    date: string;
    fullDate: string;
    count: number;
  }[];
}

interface RealtimeDashboardProps {
  userName: string;
  initialStats: DashboardStats;
  initialTimestamp: string;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function RealtimeDashboard({
  userName,
  initialStats,
  initialTimestamp,
}: RealtimeDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [lastUpdated, setLastUpdated] = useState(initialTimestamp);
  const [isPolling, setIsPolling] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      const response = await fetch("/api/dashboard/stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
        setLastUpdated(result.timestamp);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      if (showRefreshing) setIsRefreshing(false);
    }
  }, []);

  // Polling effect
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      fetchStats(false);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isPolling, fetchStats]);

  // Handle visibility change - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden);
      if (!document.hidden) {
        // Refresh when tab becomes visible again
        fetchStats(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchStats]);

  const handleRefresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  const handleChartDateClick = useCallback((fullDate: string) => {
    router.push(`/registrations?date=${fullDate}`);
  }, [router]);

  const handleAgeGroupClick = useCallback((ageGroup: string) => {
    router.push(`/registrations?ageGroup=${ageGroup}`);
  }, [router]);

  const handleGenderClick = useCallback((gender: string) => {
    router.push(`/registrations?gender=${gender}`);
  }, [router]);

  const handleNationalityClick = useCallback((nationality: string) => {
    router.push(`/registrations?nationality=${nationality}`);
  }, [router]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        userName={userName}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isPolling={isPolling}
      />

      {/* Stats Cards */}
      <StatsCards
        total={stats.totalRegistrations}
        checkedIn={stats.checkedIn}
        pending={stats.pending}
        todayCount={stats.todayRegistrations}
      />

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <RegistrationsChartInteractive
          data={stats.registrationsByDay}
          onDateClick={handleChartDateClick}
        />
        <AgeDistributionChartInteractive
          data={stats.byAgeGroup}
          onAgeGroupClick={handleAgeGroupClick}
        />
      </div>

      {/* Charts Row 2 - Gender & Nationality */}
      <div className="grid md:grid-cols-2 gap-6">
        <GenderDistributionChart
          data={stats.byGender}
          onGenderClick={handleGenderClick}
        />
        <NationalityDistributionChart
          data={stats.byNationality}
          onNationalityClick={handleNationalityClick}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity checkIns={stats.recentCheckIns} />
    </div>
  );
}

// Loading skeleton for initial load
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
