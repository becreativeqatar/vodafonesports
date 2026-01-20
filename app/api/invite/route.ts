import { NextResponse } from "next/server";
import { z } from "zod";
import { sendInviteEmail } from "@/lib/email";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  inviterName: z.string().min(1, "Inviter name is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, inviterName } = inviteSchema.parse(body);

    await sendInviteEmail({
      to: email,
      inviterName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to send invite:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
