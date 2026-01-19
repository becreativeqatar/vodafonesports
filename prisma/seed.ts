import { PrismaClient, AgeGroup, Gender, Status, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const validatorPassword = await bcrypt.hash("Validator@123456", 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@vodafone.qa" },
    update: {},
    create: {
      email: "admin@vodafone.qa",
      password: adminPassword,
      name: "Admin User",
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log("Created admin user:", admin.email);

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: "manager@vodafone.qa" },
    update: {},
    create: {
      email: "manager@vodafone.qa",
      password: validatorPassword,
      name: "Manager User",
      role: Role.MANAGER,
      isActive: true,
    },
  });
  console.log("Created manager user:", manager.email);

  // Create validator user
  const validator = await prisma.user.upsert({
    where: { email: "validator@vodafone.qa" },
    update: {},
    create: {
      email: "validator@vodafone.qa",
      password: validatorPassword,
      name: "Validator User",
      role: Role.VALIDATOR,
      isActive: true,
    },
  });
  console.log("Created validator user:", validator.email);

  // Create system settings
  const settings = await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      registrationOpen: true,
      maxRegistrations: 6000,
      eventDate: new Date("2026-02-10T07:30:00+03:00"),
      eventName: "Sports Village - National Sport Day 2026",
      eventLocation: "Downtown Msheireb, Barahat Msheireb",
      contactEmail: "sportsvillage@vodafone.qa",
    },
  });
  console.log("Created system settings");

  // Sample nationalities
  const nationalities = [
    "Qatar",
    "Saudi Arabia",
    "UAE",
    "India",
    "Philippines",
    "Egypt",
    "Pakistan",
    "Bangladesh",
    "Nepal",
    "Sri Lanka",
  ];

  // Sample first names
  const firstNames = [
    "Ahmed", "Mohammed", "Ali", "Omar", "Khalid",
    "Sara", "Fatima", "Maryam", "Layla", "Noura",
    "Raj", "Arjun", "Priya", "Anita", "Vikram",
    "John", "Maria", "Joseph", "Ana", "Carlos",
  ];

  // Sample last names
  const lastNames = [
    "Al-Thani", "Al-Kuwari", "Al-Sulaiti", "Al-Marri", "Al-Dosari",
    "Khan", "Ahmed", "Sharma", "Singh", "Kumar",
    "Santos", "Garcia", "Martinez", "Lopez", "Rodriguez",
  ];

  // Generate 50 sample registrations
  const registrations = [];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;

    const ageGroups: AgeGroup[] = ["KIDS", "YOUTH", "ADULT", "SENIOR"];
    const genders: Gender[] = ["MALE", "FEMALE"];

    const qid = String(28400000000 + i).padStart(11, "0");
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace("-", "")}${i}@example.com`;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let qrCode = "SVE2026-";
    for (let j = 0; j < 8; j++) {
      qrCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create registration with random date in the past month
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    // Some registrations are checked in
    const isCheckedIn = Math.random() > 0.6;
    const status: Status = isCheckedIn ? "CHECKED_IN" : "REGISTERED";

    registrations.push({
      qid,
      fullName,
      ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
      email,
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
      qrCode,
      status,
      checkedInAt: isCheckedIn ? new Date() : null,
      checkedInBy: isCheckedIn ? validator.id : null,
      createdAt,
    });
  }

  // Insert registrations
  for (const registration of registrations) {
    try {
      await prisma.registration.create({
        data: registration,
      });
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log(`Created ${registrations.length} sample registrations`);
  console.log("\nSeed completed!");
  console.log("\n--- Login Credentials ---");
  console.log("Admin: admin@vodafone.qa / Admin@123456");
  console.log("Manager: manager@vodafone.qa / Validator@123456");
  console.log("Validator: validator@vodafone.qa / Validator@123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
