import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API endpoint for live participant count
// No authentication required - only returns aggregate counts
export async function GET() {
  try {
    const [totalRegistrations, checkedIn] = await Promise.all([
      db.registration.count(),
      db.registration.count({ where: { status: "CHECKED_IN" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations,
        checkedIn,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
