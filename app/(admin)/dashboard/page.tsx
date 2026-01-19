import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RealtimeDashboard } from "@/components/admin/realtime-dashboard";
import { startOfDay, subDays, format } from "date-fns";

async function getStats() {
  const [totalRegistrations, checkedIn, cancelled] = await Promise.all([
    db.registration.count(),
    db.registration.count({ where: { status: "CHECKED_IN" } }),
    db.registration.count({ where: { status: "CANCELLED" } }),
  ]);

  const pending = totalRegistrations - checkedIn - cancelled;

  // Get count by age group
  const ageGroupCounts = await db.registration.groupBy({
    by: ["ageGroup"],
    _count: { ageGroup: true },
  });

  const byAgeGroup = {
    KIDS: 0,
    YOUTH: 0,
    ADULT: 0,
    SENIOR: 0,
  };

  ageGroupCounts.forEach((item) => {
    byAgeGroup[item.ageGroup] = item._count.ageGroup;
  });

  // Get today's registrations
  const today = startOfDay(new Date());
  const todayRegistrations = await db.registration.count({
    where: {
      createdAt: { gte: today },
    },
  });

  // Get recent check-ins
  const recentCheckIns = await db.registration.findMany({
    where: { status: "CHECKED_IN" },
    orderBy: { checkedInAt: "desc" },
    take: 5,
    include: {
      checkedInByUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Get registrations by day for the last 7 days
  const registrationsByDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = await db.registration.count({
      where: {
        createdAt: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    });

    registrationsByDay.push({
      date: format(date, "MMM dd"),
      fullDate: format(date, "yyyy-MM-dd"),
      count,
    });
  }

  return {
    totalRegistrations,
    checkedIn,
    pending,
    cancelled,
    byAgeGroup,
    todayRegistrations,
    recentCheckIns,
    registrationsByDay,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const stats = await getStats();
  const lastUpdated = new Date().toISOString();

  return (
    <RealtimeDashboard
      userName={session.user.name?.split(" ")[0] || "User"}
      initialStats={stats}
      initialTimestamp={lastUpdated}
    />
  );
}
