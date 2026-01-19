import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN and MANAGER can export
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const formatType = searchParams.get("format") || "xlsx";
    const status = searchParams.get("status");
    const ageGroup = searchParams.get("ageGroup");

    // Build where clause
    const where: Prisma.RegistrationWhereInput = {};

    if (status && status !== "ALL") {
      where.status = status as "REGISTERED" | "CHECKED_IN" | "CANCELLED";
    }

    if (ageGroup && ageGroup !== "ALL") {
      where.ageGroup = ageGroup as "KIDS" | "YOUTH" | "ADULT" | "SENIOR";
    }

    // Get registrations
    const registrations = await db.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        checkedInByUser: {
          select: {
            name: true,
          },
        },
      },
    });

    // Transform data for export
    const exportData = registrations.map((reg, index) => ({
      "#": index + 1,
      "Registration ID": reg.id,
      QID: reg.qid,
      "Full Name": reg.fullName,
      Email: reg.email,
      "Age Group": reg.ageGroup,
      Nationality: reg.nationality,
      Gender: reg.gender,
      "QR Code": reg.qrCode,
      Status: reg.status,
      "Registered At": format(reg.createdAt, "yyyy-MM-dd HH:mm:ss"),
      "Checked In At": reg.checkedInAt
        ? format(reg.checkedInAt, "yyyy-MM-dd HH:mm:ss")
        : "",
      "Checked In By": reg.checkedInByUser?.name || "",
    }));

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EXPORT",
        entity: "Registration",
        metadata: { format: formatType, count: registrations.length },
      },
    });

    if (formatType === "csv") {
      // Create CSV
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="registrations-${format(
            new Date(),
            "yyyy-MM-dd"
          )}.csv"`,
        },
      });
    } else {
      // Create XLSX
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

      // Set column widths
      worksheet["!cols"] = [
        { wch: 5 }, // #
        { wch: 25 }, // Registration ID
        { wch: 15 }, // QID
        { wch: 25 }, // Full Name
        { wch: 30 }, // Email
        { wch: 12 }, // Age Group
        { wch: 20 }, // Nationality
        { wch: 10 }, // Gender
        { wch: 15 }, // QR Code
        { wch: 12 }, // Status
        { wch: 20 }, // Registered At
        { wch: 20 }, // Checked In At
        { wch: 20 }, // Checked In By
      ];

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="registrations-${format(
            new Date(),
            "yyyy-MM-dd"
          )}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}
