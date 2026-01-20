"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Users, UserCheck } from "lucide-react";

interface Stats {
  totalRegistrations: number;
  checkedIn: number;
}

export default function LiveStatsPage() {
  const [stats, setStats] = useState<Stats>({ totalRegistrations: 0, checkedIn: 0 });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Use Server-Sent Events for real-time updates
    const eventSource = new EventSource("/api/public/stats/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStats({
          totalRegistrations: data.totalRegistrations,
          checkedIn: data.checkedIn,
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // EventSource will automatically try to reconnect
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-vodafone-gradient flex flex-col items-center justify-center p-8">
      {/* Vodafone Logo */}
      <div className="mb-8">
        <Image
          src="/images/vodafone-logo-white.png"
          alt="Vodafone"
          width={250}
          height={68}
          className="object-contain"
          priority
        />
      </div>

      {/* Event Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Sports Village 2026
        </h1>
        <p className="text-xl md:text-2xl text-white/80">
          National Sport Day - 10 February 2026
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl w-full">
        {/* Total Registrations */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <Users className="h-12 w-12 md:h-16 md:w-16 text-white" />
            </div>
          </div>
          <div className="text-6xl md:text-8xl font-bold text-white mb-4 tabular-nums transition-all duration-300">
            {stats.totalRegistrations.toLocaleString()}
          </div>
          <div className="text-xl md:text-2xl text-white/80 font-medium">
            Total Registrations
          </div>
        </div>

        {/* Checked In */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-secondary-spring-green/30 p-4 rounded-full">
              <UserCheck className="h-12 w-12 md:h-16 md:w-16 text-secondary-spring-green" />
            </div>
          </div>
          <div className="text-6xl md:text-8xl font-bold text-secondary-spring-green mb-4 tabular-nums transition-all duration-300">
            {stats.checkedIn.toLocaleString()}
          </div>
          <div className="text-xl md:text-2xl text-white/80 font-medium">
            Checked In
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-12 text-white/60 text-sm">
        Real-time updates • Last updated: {lastUpdated.toLocaleTimeString()}
      </div>

      {/* Connection status indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected
              ? "bg-secondary-spring-green animate-pulse"
              : "bg-yellow-500"
          }`}
        />
        <span className="text-white/60 text-sm">
          {isConnected ? "LIVE" : "RECONNECTING..."}
        </span>
      </div>
    </div>
  );
}
