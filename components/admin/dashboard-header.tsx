"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Radio } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardHeaderProps {
  userName: string;
  lastUpdated: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isPolling?: boolean;
}

export function DashboardHeader({
  userName,
  lastUpdated,
  onRefresh,
  isRefreshing: externalIsRefreshing,
  isPolling = false,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [internalIsRefreshing, setInternalIsRefreshing] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>("");

  const isRefreshing = externalIsRefreshing ?? internalIsRefreshing;

  useEffect(() => {
    // Update the "time ago" display
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }));
    };

    updateTimeAgo();
    // Update every 60 seconds to reduce unnecessary re-renders
    const interval = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setInternalIsRefreshing(true);
      router.refresh();
      setTimeout(() => setInternalIsRefreshing(false), 1000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold text-vodafone-grey">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-500">
          Here&apos;s what&apos;s happening with Sports Village 2026
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isPolling && (
          <Badge variant="outline" className="gap-1.5 text-secondary-spring-green border-secondary-spring-green/50">
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </Badge>
        )}
        <span className="text-sm text-gray-400">
          Updated {timeAgo}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
