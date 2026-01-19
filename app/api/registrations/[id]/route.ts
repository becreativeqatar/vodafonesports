import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Get single registration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const registration = await db.registration.findUnique({
      where: { id: params.id },
      include: {
        checkedInByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}

// PATCH - Update registration status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["REGISTERED", "CHECKED_IN", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const updateData: {
      status: "REGISTERED" | "CHECKED_IN" | "CANCELLED";
      checkedInAt?: Date | null;
      checkedInBy?: string | null;
    } = { status };

    // If checking in, add check-in details
    if (status === "CHECKED_IN") {
      updateData.checkedInAt = new Date();
      updateData.checkedInBy = session.user.id;
    } else {
      // Clear check-in details if status changes
      updateData.checkedInAt = null;
      updateData.checkedInBy = null;
    }

    const registration = await db.registration.update({
      where: { id: params.id },
      data: updateData,
      include: {
        checkedInByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: status === "CHECKED_IN" ? "CHECK_IN" : "UPDATE",
        entity: "Registration",
        entityId: registration.id,
        metadata: { status },
      },
    });

    return NextResponse.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

// DELETE - Delete registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await db.registration.delete({
      where: { id: params.id },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Registration",
        entityId: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}
