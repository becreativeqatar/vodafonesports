import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrationSchema, searchSchema } from "@/lib/validations";
import { generateUniqueQRCode, generateQRCodeDataURL } from "@/lib/qr";
import { sendRegistrationEmail, sendFamilyRegistrationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// POST - Create a new registration (Public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registrationSchema.parse(body);

    // Check for existing registration with same QID
    const existingQid = await db.registration.findUnique({
      where: { qid: validatedData.qid },
    });

    if (existingQid) {
      return NextResponse.json(
        { success: false, error: "A registration with this QID already exists" },
        { status: 400 }
      );
    }

    // Check for existing registration with same email
    const existingEmail = await db.registration.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "A registration with this email already exists",
        },
        { status: 400 }
      );
    }

    // Check if registration is still open
    const settings = await db.systemSettings.findFirst();
    if (settings && !settings.registrationOpen) {
      return NextResponse.json(
        { success: false, error: "Registration is currently closed" },
        { status: 400 }
      );
    }

    // Check if max registrations reached
    if (settings) {
      const totalRegistrations = await db.registration.count();
      if (totalRegistrations >= settings.maxRegistrations) {
        return NextResponse.json(
          {
            success: false,
            error: "Maximum registration limit has been reached",
          },
          { status: 400 }
        );
      }
    }

    // Helper function to generate a unique QR code
    const generateUniqueQR = async (): Promise<string> => {
      let qrCode: string;
      let isUnique = false;

      do {
        qrCode = generateUniqueQRCode();
        const existing = await db.registration.findUnique({
          where: { qrCode },
        });
        isUnique = !existing;
      } while (!isUnique);

      return qrCode;
    };

    // Generate unique QR code for primary registrant
    const qrCode = await generateUniqueQR();

    // Create primary registration
    const registration = await db.registration.create({
      data: {
        qid: validatedData.qid,
        fullName: validatedData.fullName,
        ageGroup: validatedData.ageGroup,
        email: validatedData.email,
        nationality: validatedData.nationality,
        gender: validatedData.gender,
        qrCode,
      },
    });

    // Process family members if present
    const familyRegistrations = [];
    if (validatedData.familyMembers && validatedData.familyMembers.length > 0) {
      for (const member of validatedData.familyMembers) {
        // Check for existing registration with same QID
        const existingMemberQid = await db.registration.findUnique({
          where: { qid: member.qid },
        });

        if (existingMemberQid) {
          // Skip this family member if already registered
          console.log(`Skipping family member with QID ${member.qid} - already registered`);
          continue;
        }

        const memberQrCode = await generateUniqueQR();
        const familyRegistration = await db.registration.create({
          data: {
            qid: member.qid,
            fullName: member.fullName,
            ageGroup: member.ageGroup,
            email: validatedData.email, // Same email as primary
            nationality: validatedData.nationality, // Same nationality as primary
            gender: member.gender,
            qrCode: memberQrCode,
          },
        });
        familyRegistrations.push(familyRegistration);
      }
    }

    // Generate QR code images and send email
    try {
      const primaryQrCodeDataUrl = await generateQRCodeDataURL(qrCode);

      if (familyRegistrations.length > 0) {
        // Family registration - send one consolidated email with all QR codes
        const familyMembersData = await Promise.all(
          familyRegistrations.map(async (familyReg) => ({
            fullName: familyReg.fullName,
            qrCode: familyReg.qrCode,
            qrCodeDataUrl: await generateQRCodeDataURL(familyReg.qrCode),
            qid: familyReg.qid,
            ageGroup: familyReg.ageGroup,
          }))
        );

        await sendFamilyRegistrationEmail({
          to: registration.email,
          primaryMember: {
            fullName: registration.fullName,
            qrCode: registration.qrCode,
            qrCodeDataUrl: primaryQrCodeDataUrl,
            qid: registration.qid,
            ageGroup: registration.ageGroup,
          },
          familyMembers: familyMembersData,
        });
      } else {
        // Single registration - send regular email
        await sendRegistrationEmail({
          to: registration.email,
          fullName: registration.fullName,
          qrCode: registration.qrCode,
          qrCodeDataUrl: primaryQrCodeDataUrl,
          registrationId: registration.id,
          qid: registration.qid,
          ageGroup: registration.ageGroup,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      {
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
          createdAt: registration.createdAt,
          familyCount: familyRegistrations.length,
        },
        message:
          familyRegistrations.length > 0
            ? `Registration successful for you and ${familyRegistrations.length} family member(s). Please check your email for confirmation.`
            : "Registration successful. Please check your email for confirmation.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { success: false, error: "A registration with this information already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET - List registrations (Protected)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const params = searchSchema.parse({
      query: searchParams.get("query") || undefined,
      status: searchParams.get("status") || undefined,
      ageGroup: searchParams.get("ageGroup") || undefined,
      date: searchParams.get("date") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    // Build where clause
    const where: Prisma.RegistrationWhereInput = {};

    if (params.query) {
      where.OR = [
        { fullName: { contains: params.query, mode: "insensitive" } },
        { qid: { contains: params.query } },
        { email: { contains: params.query, mode: "insensitive" } },
      ];
    }

    if (params.status && params.status !== "ALL") {
      where.status = params.status;
    }

    if (params.ageGroup && params.ageGroup !== "ALL") {
      where.ageGroup = params.ageGroup;
    }

    // Date filter - filter by specific day
    if (params.date) {
      const filterDate = new Date(params.date);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.createdAt = {
        gte: filterDate,
        lt: nextDay,
      };
    }

    // Get total count
    const total = await db.registration.count({ where });

    // Get registrations with dynamic sorting
    // Only include checkedInByUser when filtering by CHECKED_IN status
    const registrations = await db.registration.findMany({
      where,
      include: params.status === "CHECKED_IN" ? {
        checkedInByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      } : undefined,
      orderBy: { [params.sortBy]: params.sortOrder },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
