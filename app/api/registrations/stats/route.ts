import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get total registrations by status
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

    // Get count by gender
    const genderCounts = await db.registration.groupBy({
      by: ["gender"],
      _count: { gender: true },
    });

    const byGender = {
      MALE: 0,
      FEMALE: 0,
    };

    genderCounts.forEach((item) => {
      byGender[item.gender] = item._count.gender;
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
      take: 10,
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
        count,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations,
        checkedIn,
        pending,
        cancelled,
        byAgeGroup,
        byGender,
        todayRegistrations,
        recentCheckIns,
        registrationsByDay,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
