import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RealtimeDashboard } from "@/components/admin/realtime-dashboard";
import { startOfDay, subDays, format } from "date-fns";

async function getStats() {
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6);

  // Batch all independent queries with Promise.all
  const [
    totalRegistrations,
    checkedIn,
    cancelled,
    ageGroupCounts,
    genderCounts,
    nationalityCounts,
    todayRegistrations,
    recentCheckIns,
    dailyCounts,
  ] = await Promise.all([
    db.registration.count(),
    db.registration.count({ where: { status: "CHECKED_IN" } }),
    db.registration.count({ where: { status: "CANCELLED" } }),
    db.registration.groupBy({
      by: ["ageGroup"],
      _count: { ageGroup: true },
    }),
    db.registration.groupBy({
      by: ["gender"],
      _count: { gender: true },
    }),
    db.registration.groupBy({
      by: ["nationality"],
      _count: { nationality: true },
      orderBy: { _count: { nationality: "desc" } },
      take: 10,
    }),
    db.registration.count({
      where: { createdAt: { gte: today } },
    }),
    db.registration.findMany({
      where: { status: "CHECKED_IN" },
      orderBy: { checkedInAt: "desc" },
      take: 5,
      include: {
        checkedInByUser: {
          select: { id: true, name: true },
        },
      },
    }),
    // Fix N+1: Single query to get registrations grouped by day
    db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "Registration"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  const pending = totalRegistrations - checkedIn - cancelled;

  const byAgeGroup = {
    KIDS: 0,
    YOUTH: 0,
    ADULT: 0,
    SENIOR: 0,
  };

  ageGroupCounts.forEach((item) => {
    byAgeGroup[item.ageGroup] = item._count.ageGroup;
  });

  const byGender = {
    MALE: 0,
    FEMALE: 0,
  };

  genderCounts.forEach((item) => {
    byGender[item.gender] = item._count.gender;
  });

  const byNationality = nationalityCounts.map((item) => ({
    nationality: item.nationality,
    count: item._count.nationality,
  }));

  // Build registrationsByDay from the grouped query results
  const dailyCountsMap = new Map<string, number>();
  dailyCounts.forEach((item) => {
    const dateKey = format(new Date(item.date), "yyyy-MM-dd");
    dailyCountsMap.set(dateKey, Number(item.count));
  });

  const registrationsByDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const fullDate = format(date, "yyyy-MM-dd");
    registrationsByDay.push({
      date: format(date, "MMM dd"),
      fullDate,
      count: dailyCountsMap.get(fullDate) || 0,
    });
  }

  return {
    totalRegistrations,
    checkedIn,
    pending,
    cancelled,
    byAgeGroup,
    byGender,
    byNationality,
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
