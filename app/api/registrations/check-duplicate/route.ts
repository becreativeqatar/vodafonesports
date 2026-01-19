import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { duplicateCheckSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qid, email } = duplicateCheckSchema.parse(body);

    let qidExists = false;
    let emailExists = false;

    if (qid) {
      const existing = await db.registration.findUnique({
        where: { qid },
      });
      qidExists = !!existing;
    }

    if (email) {
      const existing = await db.registration.findUnique({
        where: { email },
      });
      emailExists = !!existing;
    }

    return NextResponse.json({
      qidExists,
      emailExists,
    });
  } catch (error) {
    console.error("Duplicate check error:", error);
    return NextResponse.json(
      { error: "Failed to check for duplicates" },
      { status: 500 }
    );
  }
}
