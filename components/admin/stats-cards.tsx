"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, CalendarDays } from "lucide-react";

interface StatsCardsProps {
  total: number;
  checkedIn: number;
  pending: number;
  todayCount: number;
}

export function StatsCards({ total, checkedIn, pending, todayCount }: StatsCardsProps) {
  const router = useRouter();

  const stats = [
    {
      title: "Total Registrations",
      value: total.toLocaleString(),
      icon: Users,
      color: "text-vodafone-red",
      bgColor: "bg-vodafone-red/10",
      href: "/registrations",
    },
    {
      title: "Checked In",
      value: checkedIn.toLocaleString(),
      icon: UserCheck,
      color: "text-secondary-spring-green",
      bgColor: "bg-secondary-spring-green/10",
      href: "/registrations?status=CHECKED_IN",
    },
    {
      title: "Pending",
      value: pending.toLocaleString(),
      icon: Clock,
      color: "text-secondary-aqua-blue",
      bgColor: "bg-secondary-aqua-blue/10",
      href: "/registrations?status=REGISTERED",
    },
    {
      title: "Today's Registrations",
      value: todayCount.toLocaleString(),
      icon: CalendarDays,
      color: "text-secondary-fresh-orange",
      bgColor: "bg-secondary-fresh-orange/10",
      href: "/registrations",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="cursor-pointer hover:shadow-md hover:border-vodafone-red/30 transition-all"
          onClick={() => router.push(stat.href)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-vodafone-grey">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
