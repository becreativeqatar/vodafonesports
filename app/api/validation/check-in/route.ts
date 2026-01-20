import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { checkInSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { qrCode } = checkInSchema.parse(body);

    // Find registration by QR code
    const registration = await db.registration.findUnique({
      where: { qrCode },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Invalid QR code. Registration not found." },
        { status: 404 }
      );
    }

    // Check if already checked in
    if (registration.status === "CHECKED_IN") {
      return NextResponse.json(
        {
          success: false,
          error: "Already checked in",
          data: {
            id: registration.id,
            fullName: registration.fullName,
            ageGroup: registration.ageGroup,
            checkedInAt: registration.checkedInAt,
          },
        },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (registration.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "This registration has been cancelled",
        },
        { status: 400 }
      );
    }

    // Perform check-in and create audit log in a single transaction
    const now = new Date();
    const [updatedRegistration] = await db.$transaction([
      db.registration.update({
        where: { id: registration.id },
        data: {
          status: "CHECKED_IN",
          checkedInAt: now,
          checkedInBy: session.user.id,
        },
        select: {
          id: true,
          fullName: true,
          ageGroup: true,
          nationality: true,
          gender: true,
          status: true,
          checkedInAt: true,
        },
      }),
      db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CHECK_IN",
          entity: "Registration",
          entityId: registration.id,
          metadata: { qrCode },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: updatedRegistration,
      message: "Check-in successful",
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { success: false, error: "Check-in failed. Please try again." },
      { status: 500 }
    );
  }
}
