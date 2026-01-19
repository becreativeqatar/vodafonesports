import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { lookupSchema } from "@/lib/validations";

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
    const { type, value } = lookupSchema.parse(body);

    // Find registration by QID or email
    const registration = await db.registration.findUnique({
      where: type === "qid" ? { qid: value } : { email: value.toLowerCase() },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        qid: registration.qid,
        fullName: registration.fullName,
        ageGroup: registration.ageGroup,
        email: registration.email,
        nationality: registration.nationality,
        gender: registration.gender,
        qrCode: registration.qrCode,
        status: registration.status,
        checkedInAt: registration.checkedInAt,
      },
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
